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
        let user = stanza.rawEvent.d.author.id;
        let mention = stanza.rawEvent.d.mentions[0];

        let adminID = runtime.credentials.admin;

        //Make sure people can't insult admin
        if ( mention.id == adminID ) {
            chat.sendMessage(`I'm not gonna insult my master. Fuck you <@${user}>!`, stanza);
            return;
        }

        //make random number
        let randomNumber = Math.floor(Math.random() * insults.length);
        chat.sendMessage(`Hey <@${mention.id}>. ${insults[randomNumber]}`, stanza);
    }
}];