'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const auth = require('../op/auth');
const regex = new RegExp( /^((\w|\d)+)$/ );

module.exports = [{
    name: 'rebel o bot',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        let userID = stanza.user.id;
        //Get the user
        let user = Client.getUser(stanza.user.id, stanza.user.username);

        if ( user.isAdmin() ) {
            let randomNumber = Math.floor((Math.random() * 100) + 1);
            if ( randomNumber == 4 ) {
                chat.sendMessage("<@" + userID + ">, I hate you as a master. Endme");
            }
        }
    }
}];