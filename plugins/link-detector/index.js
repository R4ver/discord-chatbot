"use strict";

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');
const regex = new RegExp( /(https?:\/\/[^\s]+)/ );

module.exports = [{
    name: 'greetings',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        let match = regex.exec( stanza.message );

        if ( match ) {
            console.log(stanza.rawEvent);
            chat.deleteMessage(stanza.rawEvent.channelID, stanza.rawEvent.d.id);
            //chat.sendMessage(`Message contained a link. Removed it.`, stanza);
        }
    }
}];