"use strict";

var runtime = require("../../utils/Runtime");
var settings = require("./settings");

module.exports = {
    /**
     * Check if the joined user is an opped user
     * @param  {user}
     * @return {true|false}
     */
    isOpped: function(stanza) {
        var OP = runtime.brain.get("chatOPS") || {};
        var opID = OP[stanza];

        if ( opID !== undefined ) {
            if ( stanza === opID.oppedUser ) {
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
        var OP = runtime.brain.get("chatOPS") || {};
        var userLvl = OP[stanza].opLvl.toLowerCase();
        var userWeight = settings.opLevels[userLvl].weight;
        var opWeight = settings.opLevels[lvl].weight;

        if ( userWeight >= opWeight ) {
            return true;
        }
    }
}