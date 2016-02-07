'use strict'

const Player            = require('./Player');
const runtime           = require('../../utils/Runtime');
const Client            = require('../../utils/Client');
const fetch             = require('node-fetch');
const Log               = require('../../utils/Log');
const auth              = require('../op/auth');
const joinRegex         = new RegExp( "^(\\" + runtime.prefix + ")join\\s(.+)$" );
const leaveRegex        = new RegExp( "^(\\" + runtime.prefix + ")leave$" );
const playMusicRegex    = new RegExp( "^(\\" + runtime.prefix + ")playmusic$" );
const stopMusicRegex    = new RegExp( "^(\\" + runtime.prefix + ")stopmusic$" );
const addMusicRegex     = new RegExp( "^(\\" + runtime.prefix + ")addmusic\\s(.+)$" );
const playNextRegex     = new RegExp( "^(\\" + runtime.prefix + ")playnext$" );
const playPrevRegex     = new RegExp( "^(\\" + runtime.prefix + ")playprev$" );

//Initialize new Player
let player = new Player();

module.exports = [{
    types: ['startup'],
    action: function( chat ) {
        //Check if the brain for the playlist already exist, else create it
        if ( runtime.brain.get('playList') === null ) {

            let playListSetup = {
                inVoiceChannel: false,
                isPlaying: false,
                currentVoiceChannel: '',
                currentChannelName: '',
                currentSongIndex: 0,
                songList: []
            };

            runtime.brain.set('playList', playListSetup);
        }

        //Reset inVoiceChannel and isPlaying to false on every startup
        //Get the playList
        let playList = runtime.brain.get('playList');
        playList.inVoiceChannel         = false;
        playList.isPlaying              = false;
        playList.currentVoiceChannel    = '';
        playList.currentChannelName     = '';
        runtime.brain.set('playList', playList);
    }
}, {
    name: 'play',
    types: ['message'],
    regex: playMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            //Get the playlist
            let playList = runtime.brain.get('playList');

            //Check if currently playing music 
            if ( playList.isPlaying ) {
                chat.sendMessage("Error: Currently playing music", stanza);
                return;
            }

            //Kill ffmpeg instance if running
            player.killMusic();

            //Get the current songIndex
            let songIndex = playList.currentSongIndex;

            chat.client.getAudioContext({ channel: playList.currentVoiceChannel, stereo: true}, function(stream) {
                //Start the music
                player.playMusic(playList.songList[songIndex].songId, stream);

                //playList.isPlaying = true;
                runtime.brain.set('playList', playList);

                //Give the channel information about the currently playing song.
                chat.sendMessage("Now playing: " + playList.songList[songIndex].title, stanza);
            });
        }
    }
}, {
    name: 'stop',
    types: ['message'],
    regex: stopMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            let playList = runtime.brain.get('playList');
            //Set the playList.isPlaying to false
            playList.isPlaying = false;
            runtime.brain.set('playList', playList);

            player.killMusic();
        }
    }
}, {
    name: 'next',
    types: ['message'],
    regex: playNextRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            //Get the playList
            let playList = runtime.brain.get('playList');

            if ( !playList.isPlaying )
                return; 

            player.killMusic();


            //Check if the songIndex it greater than or equal to the length of the songList
            if ( player.checkIndex() ) {
                console.log("Got to the end");
                console.log(player.checkIndex());

                playList.isPlaying = false;
                runtime.brain.set('playList', playList);

                chat.sendMessage("No more songs", stanza);
                return;
            }

            //Increment the currentSongIndex
            playList.currentSongIndex = playList.currentSongIndex + 1;

            //Save the new index to the playList
            runtime.brain.set('playList', playList);

            //Get the songIndex
            let songIndex = playList.currentSongIndex;

            //Set a timeout before playing next song to make sure there's no small bit music stream still going
            setTimeout(function() {

                //Start the new song based on the new index
                chat.client.getAudioContext({ channel: playList.currentVoiceChannel, stereo: true}, function(stream) {
                    //Start the music
                    player.playMusic(playList.songList[songIndex].songId, stream);
                    //Give the channel information about the currently playing song.
                    chat.sendMessage("Now playing: " + playList.songList[songIndex].title, stanza);
                });

            }, 1000);
        }
    }
}, {
    name: 'addsong',
    types: ['message'],
    regex: addMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            let match = addMusicRegex.exec( stanza.message );
            let youtubeId = match[2];

            //Get the playList
            let playList = runtime.brain.get("playList") || {};

            fetch("http://www.youtubeinmp3.com/fetch/?format=JSON&video=http://www.youtube.com/watch?v=" + youtubeId)
                .then(function(res) {
                    return res.text();
                }).then(function(body) {
                    let _body = JSON.parse(body);

                    //If the body return no video. end
                    if ( _body.error == 'no video' ) {
                        console.error('Error: Link contained no video');
                        chat.sendMessage("Link ")
                        return
                    }

                    //Create the new track
                    let newTrack = {
                        title: _body.title,
                        length: _body.length,
                        songId: youtubeId
                    }

                    //Push the new track to the songList
                    playList[ "songList" ].push(newTrack);
                    //Save the playList
                    runtime.brain.set("playList", playList);
                });
        }     
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

            //Get the playlist
            let playList = runtime.brain.get('playList');

            //Check if in voiceChannel 
            if ( playList.inVoiceChannel && playList.isPlaying ) {
                chat.sendMessage("Error: Currently playing music in another channel", stanza);
                return;
            }

            for ( let channel in servers[serverFromChannel].channels ) {
                if ( servers[serverFromChannel].channels[channel].type == "voice" && servers[serverFromChannel].channels[channel].name == channelName ) {

                    //Leave the current voiceChannel;
                    chat.client.leaveVoiceChannel(playList.currentVoiceChannel);

                    //Set variable for current joined voice channel
                    playList.inVoiceChannel = true;
                    playList.currentVoiceChannel = servers[serverFromChannel].channels[channel].id;
                    playList.currentChannelName = channelName;

                    //Save the information about the channel
                    runtime.brain.set('playList', playList);

                    chat.client.joinVoiceChannel(playList.currentVoiceChannel, function() {
                        chat.sendMessage("Joined voice channel: " + playList.currentChannelName, stanza);
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

            //Get the playlist
            let playList = runtime.brain.get('playList');

            //Check if not currently in a voiceChannel
            if ( !playList.inVoiceChannel ) {
                chat.sendMessage("Error: Currently not in a voice channel", stanza);
                return;
            }

            chat.client.leaveVoiceChannel(playList.currentVoiceChannel);
            chat.sendMessage("Left voice channel: " + playList.currentChannelName, stanza);
            
            //Reset the channel information
            player.resetChannel();
        }
    }
}];