'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const Log = require('../../utils/Log');
const auth = require('../op/auth');
const joinRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.join\\s(.+)$" );
const leaveRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.leave$" );
const playMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.playmusic$" );
const stopMusicRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.stopmusic$" );

let voiceChannelObj = {};

module.exports = [{
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
        }
    }
}, {
    name: 'playmusic',
    types: ['message'],
    regex: playMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            chat.client.getAudioContext({ channel: voiceChannelObj.id, stereo: true}, function(stream) {
                stream.playAudioFile(__dirname + '/music/sandstorm.mp3'); //To start playing an audio file, will stop when it's done.
                //stream.stopAudioFile(); //To stop an already playing file
                stream.once('fileEnd', function() {
                    chat.sendMessage('Stopped playing song.', stanza);
                });
            });
        }     
    }
}, {
    name: 'stopmusic',
    types: ['message'],
    regex: stopMusicRegex,
    action: function( chat, stanza ) {
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            chat.client.getAudioContext({ channel: voiceChannelObj.id, stereo: true}, function(stream) {
                stream.stopAudioFile(); //To stop an already playing file
                stream.once('fileEnd', function() {
                    chat.sendMessage('Stopped playing song.', stanza);
                });
            });
        }     
    }
}];