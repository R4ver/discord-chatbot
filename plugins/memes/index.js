'use strict'

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');

const goinsleepRegex = new RegExp( /^(~)gosl$/ );
const h3h3Regex = new RegExp( /^(h3h3|ethan|bradberry)$/ );
const brainPowerRegex = new RegExp( /^(brain|power|brain power|~power)$/ );
const wakeUpRegex = new RegExp( /^(wake me up|wake me up inside|save me)$/ );
const awpRegex = new RegExp( /^(~)awp$/ );
const kelsRegex = new RegExp ( /^(~)lonedig$/ );
const addMemeRegex = new RegExp( /^(~)meme\.add\smeme=(.+)\sregex=(.+)$/ );
const removeMemeRegex = new RegExp( /^(~)meme\.remove\s(.+)$/ );
const runMemeRegex = new RegExp ( /(.+)$/ );

module.exports = [{
    name: 'Lone digger',
    types: ['message'],
    regex: kelsRegex,
    action: function( chat, stanza ) {
        chat.sendMessage(`
Baby can you move it round the rhythm
So we can get with 'em
To the ground and get us a rock and roll round
Just a downtown body body coming with a super-hottie
Let's go, yes, no, hell no
Baby can you move it round the rhythm
Cause you know we're living in the fast lane, speed up
It ain't no game, just turn up all the beams when I come up on the scene
`, stanza);
    }
},{
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
        
        let message = stanza.message.toLowerCase();
        let match = brainPowerRegex.exec( message );
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
},{
    name: 'wake me up',
    types: ['message'],
    regex: wakeUpRegex,
    action: function( chat, stanza ) {
        //Get the regex text
        
        let message = stanza.message.toLowerCase();
        let match = wakeUpRegex.exec( message );

        if ( match[0] == "wake me up" ) {
            chat.sendMessage(`WAKE ME UP INSIDE`, stanza);
        } else if ( match[0] == "wake me up inside" ) {
            chat.sendMessage(`SAVE ME`, stanza);
        } else if ( match[0] == "save me" ) {
            chat.sendMessage(`CALL MY NAME AND SAVE ME FROM THE DARK`, stanza);
        }
    }
},{
    name: 'AH WAH PAY',
    types: ['message'],
    regex: awpRegex,
    action: function( chat, stanza ) {
        let messages = [
            "AH WAH PAY",
            "#AHWAHPAY",
            "RIP MOMAJOE126"
        ];

        let randomNumber = Math.floor(Math.random() * messages.length);

        chat.sendMessage(`${messages[randomNumber]}`, stanza);
    }
},{
    name: 'Add meme',
    types: ['message'],
    regex: addMemeRegex,
    action: function( chat, stanza ) {
        if ( !auth.has(stanza, 'moderator') ) {
            console.log("Is not high enough rank");
            return;
        }

        //Get the regex content
        let message = stanza.message.toLowerCase();
        let match = addMemeRegex.exec( message );

        //Get the meme
        let meme = match[2];

        //Get regex
        let regex = match[3];

        //Get the brain
        let memeDB = runtime.brain.get('memeDB') || {};
        let newMemeID = Object.keys(memeDB).length + 1;

        //First check if Regex matches any existing regex
        for ( let dbRegex in memeDB ) {
            let key = memeDB[dbRegex];

            if ( regex === key.regex ) {
                chat.sendMessage("`Sorry, a command already uses that regex`", stanza);
                return;
            }
        }

        if ( memeDB[newMemeID] === undefined ) {

            memeDB[newMemeID] = {
                id: newMemeID,
                meme: meme,
                regex: regex
            };

            runtime.brain.set("memeDB", memeDB);

            chat.sendMessage(`Added meme: ${meme}\nUse: ${regex} to use the meme`, stanza);
        }
    }
},{
    name: 'Run meme',
    types: ['message'],
    regex: runMemeRegex,
    action: function( chat, stanza ) {
        //Get the regex content
        let message = stanza.message.toLowerCase();
        let match = runMemeRegex.exec( message );

        //Get the meme database
        let memeDB = runtime.brain.get('memeDB');

        //Meme from regex
        let meme = match[1];

        for ( let memes in memeDB ) {
            let dbMeme = memeDB[memes];

            if ( meme == dbMeme.regex) {
                chat.sendMessage(dbMeme.meme, stanza);
            }
        }
    }
},{
    name: 'Remove meme',
    types: ['message'],
    regex: removeMemeRegex,
    action: function( chat, stanza ) {
        if ( !auth.has(stanza, 'moderator') ) {
            console.log("Is not high enough rank");
            return;
        }

        //Get the regex content
        let message = stanza.message.toLowerCase();
        let match = removeMemeRegex.exec( message );

        //Get the meme database
        let memeDB = runtime.brain.get('memeDB');

        //Meme from regex
        let meme = match[2];

        for ( let memes in memeDB ) {
            let dbMeme = memeDB[memes];

            if ( meme == dbMeme.regex) {
                delete memeDB[dbMeme.id];
                runtime.brain.set("memeDB", memeDB);
                chat.sendMessage(`Removed meme: ${meme}`, stanza);
            }
        }
    }
}];