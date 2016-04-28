"use strict";

var runtime = require("../../utils/Runtime");
var Client = require('../../utils/Client');
var settings = require("./settings");

module.exports = {
    /**
     * Check if the joined user is an opped user
     * @param  {user}
     * @return {true|false}
     */
    isOpped: function(userID) {
        var OP = runtime.brain.get("chatOPS") || {};
        var opID = OP[userID];

        if ( opID !== undefined ) {
            if ( userID === opID.oppedUser ) {
                return true;
            }
        }
    },

    /**
     * Check if the user has the required level passed in
     * @param {user}
     * @param {level required}
     * @return {true|false}
     */
    has: function(stanza, lvl) {
        let userID = stanza.rawEvent.userID;
        let OP = runtime.brain.get("chatOPS") || {};

        //Check if user exists in the rank system.
        if ( OP[userID] == undefined ) {
            console.log("User doesn't have a rank at all");
            return;
        }

        let userLvl = OP[userID].opLvl.toLowerCase();
        let userWeight = settings.opLevels[userLvl].weight;
        let opWeight = settings.opLevels[lvl].weight;


        if ( userWeight >= opWeight ) {
            return true;
        } else {
            Client.sendMessage(`I'm sorry, <@${userID}>. You don't have the right rank for this command.`, stanza);
        }
    }
}