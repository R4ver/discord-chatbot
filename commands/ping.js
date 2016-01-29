'use strict'

const runtime = require('../utils/Runtime');
const regex = new RegExp( /^(_)ping$/ );

module.exports = [{
    name: '!ping',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        chat.sendMessage('pong');
    }
}];