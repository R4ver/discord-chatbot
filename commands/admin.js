'use strict'

const runtime = require('../utils/Runtime');
const regex = new RegExp( /^hello guys$/ );

module.exports = [{
    name: 'hello guys',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        let rawEvent = stanza.rawEvent;

        let userID = rawEvent.userID.userID;
        let adminName = stanza.user.username;

        if ( userID == runtime.credentials.admin ) {
            chat.sendMessage(runtime.credentials.channel, "Welcome my lord, <@" + userID + "> !")
        }
    }
}]; 