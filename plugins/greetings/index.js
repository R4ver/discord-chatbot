'use strict'

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');
const regex = new RegExp( /^(hello|hi|sup|hello guys|whats up|what's up|hi guys)$/ );

//Different greetings based on rank

const greetings = {
    "mod": [
        "Welcome friend."
    ],

    "vip": [
        "Welcome fam."
    ],

    "donator": [
        "Welcome xaxaxaxa."
    ],

    "potato": [
        "Sup fagget",
        "What's up potato",
        "Please leave.",
        "Hey look, it's the potato!"
    ]
};

module.exports = [{
    name: 'greetings',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        console.log("USING THE LOCAL BOT");

        //get the info about the users
        let rawEvent = stanza.rawEvent;

        let userID = rawEvent.userID;
        console.log(userID);

        for ( let ranks in greetings ) {
            let keys = Object.keys(greetings);

            if ( auth.has(userID, ranks) ) {
                let randomNumber = Math.floor(Math.random() * greetings[ranks].length);

                chat.sendMessage(greetings[ranks][randomNumber], stanza);
                return;
            }
        }

        //Check if user is potato
        // if ( auth.has(userID, "potato") ) {
        //     chat.sendMessage(potatoGreetings[randomNumber], stanza);
        // }
    }
}];