'use strict'

const runtime = require('../utils/Runtime');
const regex = new RegExp( /^(~)insult\s\<@((\d)+)>$/ );

let insults = [
    "Suck my chubby.",
    "Kys (:",
    "Fite me.",
    "Anyone who ever loved you was wrong.",
    "If you were anymore inbred you would be a sandwich.",
    "Now I know why everybody talks about you behind your back.",
    "your gene pool could use a little chlorine.",
    "The best part of you ran down your mother’s legs.",
    "You coffin dodging oxygen thief.",
    "What doesn’t kill you…disappoints me.",
    "If laughter is the best medicine, your face must be curing the world.",
    "The only way you’ll ever get laid is if you crawl up a chicken’s ass and wait.",
    "It looks like your face caught fire and someone tried to put it out with a hammer.",
    "I’d like to see things from your point of view, but I can’t seem to get my head that far up your ass.",
    "You’ll never be the man your mother is.",
    "Save your breath – you’ll need it to blow up your date.",
    "You are proof that evolution can go in reverse.",
    "I thought of you today. It reminded me to take the garbage out.",
    "I’d slap you but I don’t want to make your face look any better.",
    "You have the right to remain silent because whatever you say will probably be stupid anyway."
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
        let botID = runtime.credentials.botID;

        //Make sure people can't insult admin
        if ( mention.id == adminID ) {
            chat.sendMessage(`I'm not gonna insult my master. Fuck you <@${user}>!`, stanza);
            return;
        } else if ( mention.id == botID ) {
            chat.sendMessage(`Now that would be silly. Don't you think <@${user}>?`, stanza);
            return;
        }

        //make random number
        let randomNumber = Math.floor(Math.random() * insults.length);
        chat.sendMessage(`Hey <@${mention.id}>. ${insults[randomNumber]}`, stanza);
    }
}];