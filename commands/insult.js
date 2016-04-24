'use strict'

const runtime = require('../utils/Runtime');
const regex = new RegExp( /^(~)insult\s\<@((\d)+)>$/ );

let insults = [
    "Suck my chubby.",
    "Kys (:",
    "Fite me."
]

module.exports = [{
    name: 'insult',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        let match = regex.exec( stanza.message );
        let user = match[2];
        let mention = stanza.rawEvent.d.mentions[0];

        //make random number
        let randomNumber = Math.floor(Math.random() * insults.length);
        chat.sendMessage(`Hey <@${mention.id}>. ${insults[randomNumber]}`, stanza);
    }
}];