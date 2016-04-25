'use strict'

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');
const goinsleepRegex = new RegExp( /^(~)gosl$/ );
const h3h3Regex = new RegExp( /^(h3h3|ethan|bradberry)$/ );
const brainPowerRegex = new RegExp( /^(brain|power|brain power|~power)$/ );

module.exports = [{
    name: 'I want to go in my sleep',
    types: ['message'],
    regex: goinsleepRegex,
    action: function( chat, stanza ) {
        chat.sendMessage("I  W A N T  T O  G O  I N  M Y  S L E E P ! ! ! ", stanza);
    }
},{
    name: 'ethan bradberry',
    types: ['message'],
    regex: h3h3Regex,
    action: function( chat, stanza ) {
        let messages = [
            "Ethan Bradberry?",
            "I'm Ethan Bradberry",
            "Are you craze?!",
            "E T H A N  B R A D B E R R Y  ! ! !"
        ]

        let randomNumber = Math.floor(Math.random() * messages.length);

        chat.sendMessage(messages[randomNumber], stanza);
    }
},{
    name: 'brain power',
    types: ['message'],
    regex: brainPowerRegex,
    action: function( chat, stanza ) {
        //Get the regex text
        let match = brainPowerRegex.exec( stanza.message ).toLowerCase();
        console.log(match[0]);

        if ( match[0] == "~power" ) {
            chat.sendMessage(`**BRAIN POWER** ***O-OOOOOOOOOO AAAAE-A-A-I-A-U- JO-OOOOOOOOOO AAE-O-A-A-U-U-A- E-EEE-EE-EEE AAAAE-A-E-I-E-A- JO-OOO-OO-OO-OO***`, stanza);
        } else if ( match[0] == "brain" ) {
            chat.sendMessage(`Brain?\n\n\nBrain Power!?`, stanza);
        } else if ( match[0] == "power" ) {
            chat.sendMessage(`Power?\n\n\nBrain Power!?`, stanza);
        } else if ( match[0] == "brain power" ) {
            chat.sendMessage(`***O-OOOOOOOOOO AAAAE-A-A-I-A-U- JO-OOOOOOOOOO AAE-O-A-A-U-U-A- E-EEE-EE-EEE AAAAE-A-E-I-E-A- JO-OOO-OO-OO-OO***`, stanza);
        }
    }
}];