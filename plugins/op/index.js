"use strict";

const runtime = require("../../utils/Runtime");
const Client = require("../../utils/Client");
const auth = require("./auth");
const settings = require("./settings");

let createOpRegex = new RegExp( /^(>)op\s\<@((\d)+)>\s\#((\w|\d)+)$/ ); //\s(\w|\d)\s\#((\w|\d)+)
let otherUserRank = new RegExp( /^(>)rank\s\<@(\d+)>$/ );

module.exports = [{
    name: '!op {@username} {#Lvl}',
    types: ['message'],
    regex: createOpRegex,
    action: function( chat, stanza ) {
        let rawEvent = stanza.rawEvent;

        // console.log(stanza);
        //Get the user
        let user = Client.getUser(stanza.user.id, stanza.user.username);

        //If the user is the streamer or has a lvl of mod they will
        //be able to op a specific user from the chat 
        if ( user.isAdmin() || auth.has(user.id, "mod") ) {
            let opLevels = settings.opLevels;

            //Get the regex groups
            let match = createOpRegex.exec( stanza.message );
            let newOpID = match[2];
            let newOpName = rawEvent.d.mentions[0].username;
            let newOpLvl = match[4].toLowerCase();

            //Check if the op level specified is valid
            if ( !opLevels.hasOwnProperty(newOpLvl) ) {
                    chat.sendMessage(`Level: "${newOpLvl}" is not a valid level`, stanza);
                    return null;
            }

            //Get the chatOPS from the brain
            let chatOPS = runtime.brain.get("chatOPS") || {};

            //Check if the opped user already exists, else create it
            if ( chatOPS[newOpID] === undefined ) {
                chatOPS[newOpID] = {
                    id: newOpID,
                    opName: newOpName,
                    opLvl: newOpLvl
                };

                runtime.brain.set("chatOPS", chatOPS);

                chat.sendMessage(`**Opped user:** *${newOpName}*\n**to:** *${newOpLvl}*`, stanza);
            } else {

                //If the opped user already exists change the op level.
                let match = createOpRegex.exec( stanza.message );
                let existingOpID = match[2];
                let existingOpName = rawEvent.d.mentions[0].username;
                let existingOpLvl = chatOPS[existingOpID].opLvl;
                let newOpLvl = match[4];

                chatOPS[existingOpID].opLvl = newOpLvl;

                runtime.brain.set("chatOPS", chatOPS);

                chat.sendMessage(`**Opped user:** *${newOpName}*\n**From:** *${existingOpLvl}*\n**To:** *${newOpLvl}*`, stanza);
            }
        }

    }
}, {
    name: '>rank',
    help: 'Gets the current op level of the user',
    types: ['message'],
    regex: /^(>)rank$/,
    action: function( chat, stanza ) {

        //Get the chatOPS from the brain
        let OP = runtime.brain.get("chatOPS") || {};
        let opID = OP[stanza.user.id];

        //Check if the opped user exists, print the rank, else the user is a viewer
        if ( opID ) {
            chat.sendMessage(stanza.user.username + "\'s rank is **" + opID.opLvl + "**", stanza);
        } else {
            chat.sendMessage(stanza.user.username + " has no rank", stanza);
        }
    }
}, {
    name: '!rank {@username}',
    help: 'Gets the current op level of a user',
    types: ['message'],
    regex: otherUserRank,
    action: function( chat, stanza ) {
        //Get the chatOPS from the brain
        let OP = runtime.brain.get("chatOPS") || {};

        //Get the regex group
        let match = otherUserRank.exec( stanza.message );
        let requestedUserID = match[2];
        let username = stanza.rawEvent.d.mentions[0].username;

        //Set user to the user passed in by the regex group
        let user = OP[requestedUserID];

        //Check if the user exists in the chat, else print "user not found"
        if ( user ) {
            chat.sendMessage(`**${user.opName}'s** rank is **${user.opLvl}**`, stanza);
        } else {
            chat.sendMessage(`**${username}** has no rank`, stanza);
        }
    }
}]