'use strict'

const runtime = require('../utils/Runtime');
const Client = require("../utils/Client");
const regex = new RegExp( /^(hello|hey|sup|hi)$/ );

module.exports = [{
    name: 'hello guys',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        let rawEvent = stanza.rawEvent;

        let userID = rawEvent.userID;
        let user = Client.getUser(stanza.user.id, stanza.user.username);

        if ( user.isAdmin() || auth.has(user.id, "admin") ) {
            chat.sendMessage(`Welcome my lord, <@${userID}> !`, stanza);
        }
    }
}]; 