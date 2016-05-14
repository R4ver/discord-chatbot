'use strict'

const runtime = require('../utils/Runtime');
const Client = require("../utils/Client");
const blacklistRegex = new RegExp( /^(~)blacklist\s\<@!?((\d)+)>$/ );
const whitelistRegex = new RegExp( /^(~)whitelist\s\<@!?((\d)+)>$/ );

module.exports = [{
    name: 'blacklist',
    types: ['message'],
    regex: blacklistRegex,
    action: function( chat, stanza ) {
        //Start by checking if user id admin.
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( !user.isAdmin() ) 
            return;
        
        let targetID = stanza.rawEvent.d.mentions[0].id;

        //Check if the person mentioned is admin or the bot
        if ( targetID == runtime.credentials.admin || targetID == runtime.credentials.botID ) {
            chat.sendMessage(`Now that would be silly`, stanza);
            return;
        }

        let blacklist = runtime.brain.get('blacklist') || [];

        //Push new blacklisted person to the brain and save
        blacklist.push(targetID);
        runtime.brain.set('blacklist', blacklist);
    }
}, {
    name: 'whitelist',
    types: ['message'],
    regex: whitelistRegex,
    action: function( chat, stanza ) {
        //Start by checking if user id admin.
        let user = Client.getUser(stanza.user.id, stanza.user.username);
        if ( !user.isAdmin() ) 
            return;
        
        let targetID = stanza.rawEvent.d.mentions[0].id;
        let blacklist = runtime.brain.get('blacklist') || [];

        for ( let user in blacklist ) {
            let targetIndex = blacklist.indexOf(targetID);
            if (targetIndex > -1) {
                blacklist.splice(targetIndex, 1);
                runtime.brain.set('blacklist', blacklist);
            }
        }

    }
}];