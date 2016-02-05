'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const Log = require('../../utils/Log');
const auth = require('../op/auth');
const fetch = require('node-fetch');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const joinRegex = new RegExp( "^(\\" + runtime.prefix + ")join\\s(.+)$" );
const leaveRegex = new RegExp( "^(\\" + runtime.prefix + ")leave$" );
const playMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")playmusic$" );
const stopMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")stopmusic$" );
const addMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")addmusic\\s(.+)$" );
const playNextRegex = new RegExp( "^(\\" + runtime.prefix + ")playnext$" );
const playPrevRegex = new RegExp( "^(\\" + runtime.prefix + ")playprev$" );

let voiceChannelObj = {};
let ffmpeg = null;

let playSong = (chat, stanza, opts) => {
    opts = opts || null;

    let playList = runtime.brain.get('playList');
    let currentSongIndex = playList["currentSongIndex"];
    let pids = runtime.brain.get('pids') || {};

    //Check if the option is next
    if ( opts != null && opts.next ) {
        //Check if the index is greater than the que length else increment
        if ( playList["currentSongIndex"] > playList.songList.length ) {
            playList["currentSongIndex"] = currentSongIndex;
            console.log("Next was greater")             
        } else {
            playList["currentSongIndex"] = ++currentSongIndex;
        }
    
    //Check if option is prev
    } else if ( opts != null && opts.prev ) {
        //Check if the index is less than 0 else decrement
        if ( playList["currentSongIndex"] < 0 ) {
            playList["currentSongIndex"] = 0;
            console.log("Prev was less")             
        } else {
            playList["currentSongIndex"] = --currentSongIndex;
        }
    }

    //Checks if the index is either greater or less than the que.
    //This is used if no opts were given
    if ( playList['currentSongIndex'] + 1 > playList.songList.length ) {
        playList["currentSongIndex"] = playList.songList.length - 1;
    } else if ( playList['currentSongIndex'] < 0 ) {
        playList["currentSongIndex"] = 0;
    }

    runtime.brain.set('playList', playList);
    currentSongIndex = playList['currentSongIndex'];

    console.log("Song index: " + playList['currentSongIndex']);

    chat.client.getAudioContext({ channel: voiceChannelObj.id, stereo: true}, function(stream) {
        console.log("Index before fetch: " + playList['currentSongIndex']);
        console.log("Index before fetch, currentSongIndex: " + currentSongIndex);
        fetch("http://www.youtubeinmp3.com/fetch/?format=JSON&video=" + playList.songList[currentSongIndex].link)
            .then(function(res) {
                return res.text();
            }).then(function(body) {
                console.log(body.link);
                let _body = JSON.parse(body);
                
                ffmpeg = spawn("ffmpeg", [
                    '-i', _body.link + ".mp3",
                    '-f', 's16le',
                    '-ar', '48000',
                    '-af', 'volume=0.060',
                    '-ac', '2',
                    'pipe:1'
                ], {stdio: ['pipe', 'pipe', 'ignore']});
                
                let pidObj = {
                    ffmpeg_pid: ffmpeg.pid
                };

                runtime.brain.setPid(pidObj);

                stream.send(ffmpeg.stdout) 

                ffmpeg.stdout.on('end', function() {

                    if ( ffmpeg != null ) {
                        isPlaying(ffmpeg.pid);

                        playList.next = false;

                        setTimeout(function() {
                            playSong(chat, stanza, {
                                next: true
                            });
                        }, 2000); 
                    }          
                });
            });
    });
};

let isPlaying = (pid) => {
    if ( pid == ffmpeg.pid ) {
        ffmpeg.kill();
        ffmpeg.on('close', (code, signal) => {
            console.log(
                `child process terminated due to receipt of signal ${signal}`);
            ffmpeg = null;
        });

    }
};

module.exports = [{
    types: ['message'],
    action: function( chat ) {
        let playList = runtime.brain.get('playList') || {};

        let playListSetup = {
            currentSongIndex: -1,
            next: false,
            prev: false,
            songList: []
        };

        runtime.brain.set('playList', playListSetup);
    }
}, {
    name: 'Join',
    types: ['message'],
    regex: joinRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "vip") ) {

            let servers = chat.getServers();
            //console.log(chat.client);

            //Get the regex groups
            let match = joinRegex.exec( stanza.message );
            let channelName = match[2];
            let serverFromChannel = stanza.rawEvent.serverFromChannel;

            for ( let channel in servers[serverFromChannel].channels ) {
                if ( servers[serverFromChannel].channels[channel].type == "voice" && servers[serverFromChannel].channels[channel].name == channelName ) {
                    chat.client.joinVoiceChannel(servers[serverFromChannel].channels[channel].id, function() {
                        //Set variable for current joined voice channel
                        voiceChannelObj = {
                            id: servers[serverFromChannel].channels[channel].id,
                            name: channelName
                        }

                        chat.sendMessage("Joined voice channel: " + channelName, stanza);
                    });
                }
            } 
        }
        
    }
}, {
    name: 'Leave',
    types: ['message'],
    regex: leaveRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {

            if ( voiceChannelObj.id == undefined ) {
                chat.sendMessage("Currently not connected to a voice channel", stanza);
                return;
            }

            chat.client.leaveVoiceChannel(voiceChannelObj.id);
            chat.sendMessage("Left voice channel: " + voiceChannelObj.name, stanza);
            voiceChannelObj = {};
        }
    }
},{
    name: 'addsong',
    types: ['message'],
    regex: addMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            let match = addMusicRegex.exec( stanza.message );
            let youtubeLink = match[2];
            console.log(youtubeLink);

            //Get the playList
            let hash = crypto.createHash('md5').update( youtubeLink ).digest('hex');
            let playList = runtime.brain.get("playList") || {};

            fetch("http://www.youtubeinmp3.com/fetch/?format=JSON&video=" + youtubeLink)
                .then(function(res) {
                    return res.text();
                }).then(function(body) {
                    console.log(body.link);
                    let _body = JSON.parse(body);
                    console.log(_body);
                    
                    if ( playList['songList'] === undefined ) {
                        playList['currentSongIndex'] = 0;
                        playList['songList'] = [];
                    }

                    let newTrack = {
                        title: _body.title,
                        length: _body.length,
                        link: youtubeLink,
                        isPlaying: false
                    }

                    playList[ "songList" ].push(newTrack);
                    runtime.brain.set("playList", playList);
                });
        }     
    }
}, {
    name: 'playmusic',
    types: ['message'],
    regex: playMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            if ( ffmpeg != null ) {
                isPlaying(ffmpeg.pid);
            }

            setTimeout(function() {
                playSong(chat, stanza);
            }, 2000); 
        }     
    }
}, {
    name: 'playnext',
    types: ['message'],
    regex: playNextRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {

            if ( ffmpeg != null ) {
                isPlaying(ffmpeg.pid);

                setTimeout(function() {
                    playSong(chat, stanza, {
                        next: true
                    });
                }, 2000); 
            }
        }     
    }
}, {
    name: 'playprev',
    types: ['message'],
    regex: playPrevRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {

            if ( ffmpeg != null ) {
                isPlaying(ffmpeg.pid);

                setTimeout(function() {
                    playSong(chat, stanza, {
                        prev: true
                    });
                }, 2000);
            } 
        }    
    }
}, {
    name: 'stopmusic',
    types: ['message'],
    regex: stopMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            ffmpeg.kill();
            ffmpeg.on('close', (code, signal) => {
                console.log(
                    `child process terminated due to receipt of signal ${signal}`);
            });

            ffmpeg = null;
        }
    }
}];