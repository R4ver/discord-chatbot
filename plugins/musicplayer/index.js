'use strict';

const runtime   = require('../../utils/Runtime');
const Client    = require('../../utils/Client');
const Log       = require('../../utils/Log');

//Regex
const addSongRegex = new RegExp( /(~)play\s(\w)\s(\w)$/ );

module.exports = [{
    types: ['startup'],
    action: function( chat ) {
        let musicBrain = runtime.brain.get('musicBrain') || {};

        let musicBrainSetup = {
            currentIndex: 0,
            currentVC: "",
            playList: []
        };

        let testTrack = {
            trackID: 'x2LwR_D-sio',
            title: "F(x) Pink Tape' The 2nd album [FULL ALBUM]",
            isPlaying: false,
            hasPlayed: false
        };

        musicBrainSetup.playList.push(testTrack);

        runtime.brain.set('musicBrain', musicBrainSetup);
    }
}, {
    name: 'ADD SONG',
    types: ['message'],
    regex: addSongRegex,
    action: function( chat, stanza ) {
        //get regex items
        let message = stanza.message.toLowerCase();
        let match = addSongRegex.exec( message );

        //trackID
        let trackID = match[2];

        //Song Title
        let songTitle = match[3];

        
    }
}]