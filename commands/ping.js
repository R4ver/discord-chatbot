'use strict'

const runtime = require('../utils/Runtime');
const regex = new RegExp( /^(!|\/)ping$/ );

module.exports = [{
    name: '!ping',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        console.log(stanza);
        chat.sendMessage(runtime.credentials.channel, 'pong');
    }
}]; 