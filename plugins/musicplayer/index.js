'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const Log = require('../../utils/Log');
const auth = require('../op/auth');
const fetch = require('node-fetch');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const terminate = require('terminate');
const joinRegex = new RegExp( "^(\\" + runtime.prefix + ")join\\s(.+)$" );
const leaveRegex = new RegExp( "^(\\" + runtime.prefix + ")leave$" );
const playMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")playmusic$" );
const stopMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")stopmusic$" );
const addMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")addmusic\\s(.+)$" );
const playNextRegex = new RegExp( "^(\\" + runtime.prefix + ")playnext$" );
const playPrevRegex = new RegExp( "^(\\" + runtime.prefix + ")playprev$" );

let voiceChannelObj = {};
let ffmpeg = null;

let playSong = (chat, stanza, index) => {

    let playList = runtime.brain.get('playList');
    let currentSongIndex = playList["currentSongIndex"];

    if ( (playList.currentSongIndex + 1) >= playList.songList.length && playList.songList[currentSongIndex].hasPlayed == true ) {
        console.log(playList.songList.length);
        console.log(playList.currentSongIndex);
        console.log(playList.songList[currentSongIndex].title);
        console.log("Got to the end");
        return;
    }

    chat.client.getAudioContext({ channel: voiceChannelObj.id, stereo: true}, function(stream) {

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

                console.log(playList.songList[currentSongIndex]);
                
                stream.send(ffmpeg.stdout) 

                ffmpeg.stdout.on('end', function() {
                    console.log("Song ended");

                    ffmpeg.kill();
                    ffmpeg.on('close', (code, signal) => {
                        console.log(
                            `child process terminated due to receipt of signal ${signal}`);
                    });

                    //Set the current song to hasPlayed
                    playList.songList[currentSongIndex].hasPlayed = true;

                    playList['currentSongIndex'] = ++currentSongIndex
                    //Reset hasPlayed for the new currentSongIndex
                    playList.songList[currentSongIndex].hasPlayed = false;
                    runtime.brain.set('playList', playList);
            
                    setTimeout(function() {
                        playSong(chat, stanza);
                        console.log("did it die?");
                    }, 2000);            
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
            currentSongIndex: 0,
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
                        hasPlayed: false,
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
            //http:\/\/www.youtubeinmp3.com\/download\/get\/?i=KVYQFjr9VHSmy5%2F0fKTYhx6WfSsS6kM73NFDRO3SeJRKLI7L6XNQayDeZDVfYh1TVADlrRFs6kVYLd%2BZ9qEerw%3D%3D
            //http://www.youtubeinmp3.com/download/get/?i=KVYQFjr9VHSmy5%2F0fKTYhx6WfSsS6kM73NFDRO3SeJRKLI7L6XNQayDeZDVfYh1TVADlrRFs6kVYLd%2BZ9qEerw%3D%3D

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
            }

            let playList = runtime.brain.get("playList");
            let currentSongIndex = playList["currentSongIndex"];

            playList["currentSongIndex"] = ++currentSongIndex;
            runtime.brain.set('playList', playList);

            setTimeout(function() {
                playSong(chat, stanza);
            }, 2000); 
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
            }

            let playList = runtime.brain.get("playList");
            let currentSongIndex = playList["currentSongIndex"];

            playList["currentSongIndex"] = --currentSongIndex;
            runtime.brain.set('playList', playList);

            setTimeout(function() {
                playSong(chat, stanza);
            }, 2000); 
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