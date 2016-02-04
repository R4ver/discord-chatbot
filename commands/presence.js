'use strict'

const runtime = require('../utils/Runtime');
const playRegex = new RegExp( "^(\\" + runtime.prefix + ")bot.play\\s(.+)$" );

module.exports = [{
    name: 'presence',
    types: ['message'],
    regex: playRegex,
    action: function( chat, stanza ) {
        let match = playRegex.exec( stanza.message );
        let game = match[2];

        chat.client.setPresence({
            game: game
        });
    }
}];