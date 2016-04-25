'use strict'

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');
const regex = new RegExp( /^(hello|hi|sup|hello guys|whats up|what's up|hi guys)$/ );

const potatoGreetings = [
    "Sup fagget",
    "What's up potato",
    "Please leave.",
    "Hey look, it's the potato!"
];

module.exports = [{
    name: 'rules',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        //get the info about the users
        let rawEvent = stanza.rawEvent;

        let userID = rawEvent.userID;
        let randomNumber = Math.floor(Math.random() * potatoGreetings.length);

        console.log(userID);

        if ( auth.has(userID, "potato") ) {
            chat.sendMessage(potatoGreetings[randomNumber], stanza);
        }
    }
}];