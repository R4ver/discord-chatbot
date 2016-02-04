'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const Log = require('../../utils/Log');
const auth = require('../op/auth');
const fetch = require('node-fetch');
const crypto = require('crypto');
const spawn = require('child_process').spawn;
const terminate = require('terminate');
const joinRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.join\\s(.+)$" );
const leaveRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.leave$" );
const playMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.playmusic$" );
const stopMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.stopmusic$" );
const addMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.addmusic\\s(.+)$" );
const playNextRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.playnext$" );
const playPrevRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.playprev$" );

let voiceChannelObj = {};
let ffmpeg = null;

let playSong = (chat, stanza, index) => {
    index = index || null;

    let playList = runtime.brain.get('playList');
    let currentSongIndex = playList["currentSongIndex"];

    chat.client.getAudioContext({ channel: voiceChannelObj.id, stereo: true}, function(stream) {

        fetch("http://www.youtubeinmp3.com/fetch/?format=JSON&video=" + playList.songList[currentSongIndex].link)
            .then(function(res) {
                return res.text();
            }).then(function(body) {
                let _body = JSON.parse(body);
                //console.log(_body.link);

                ffmpeg = spawn("ffmpeg", [
                    '-i', _body.link + ".mp3",
                    '-f', 's16le',
                    '-ar', '48000',
                    '-af', 'volume=0.060',
                    '-ac', '2',
                    'pipe:1'
                ], {stdio: ['pipe', 'pipe', 'ignore']});

                stream.send(ffmpeg.stdout); //To start playing an audio file, will stop when it's done.
                chat.sendMessage('Now Playing: ' + playList.songList[currentSongIndex].title, stanza);

                ffmpeg.stdout.once('end', function() {

                    let playList = runtime.brain.get('playList') || {};
                    let currentSongIndex = playList["currentSongIndex"];
                    ffmpeg.kill();

                    setTimeout(function() {
                        playList["currentSongIndex"] = ++currentSongIndex;
                        runtime.brain.set('playList', playList);

                        playSong(chat, stanza);
                    }, 500);
                });
            });
            
    });
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
                    //Set variable for current joined voice channel
                    voiceChannelObj = {
                        id: servers[serverFromChannel].channels[channel].id,
                        name: channelName
                    }

                    chat.client.joinVoiceChannel(servers[serverFromChannel].channels[channel].id, function() {
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
                        link: youtubeLink
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
            let playList = runtime.brain.get('playList');
            let currentSongIndex = playList["currentSongIndex"];
            console.log(currentSongIndex);
            playSong(chat, stanza);
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

            let playList = runtime.brain.get("playList");
            let currentSongIndex = playList["currentSongIndex"];

            playList["currentSongIndex"] = ++currentSongIndex;
            runtime.brain.set('playList', playList);

            playSong(chat, stanza);
        }     
    }
}, {
    name: 'playprev',
    types: ['message'],
    regex: playPrevRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {

            let playList = runtime.brain.get("playList");
            let currentSongIndex = playList["currentSongIndex"];

            playList["currentSongIndex"] = --currentSongIndex;
            runtime.brain.set('playList', playList);

            playSong(chat, stanza);
        }    
    }
}, {
    name: 'stopmusic',
    types: ['message'],
    regex: stopMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            ffmpeg.stdout.end();
            ffmpeg.kill();

            console.log("Killed ffmpeg");
        }     
    }
}];