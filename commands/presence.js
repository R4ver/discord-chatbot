'use strict'

const runtime = require('../utils/Runtime');
const auth = require('../plugins/op/auth');
const playRegex = new RegExp( /^(~)bot.play\s(.+)$/ );

module.exports = [{
    name: 'presence',
    types: ['message'],
    regex: playRegex,
    action: function( chat, stanza ) {
        if ( !auth.has(stanza, 'moderator') ) {
            console.log('User does not have high enough rank');
            return;
        }

        let match = playRegex.exec( stanza.message );
        let game = match[2];

        chat.client.setPresence({
            game: game
        });
    }
}];