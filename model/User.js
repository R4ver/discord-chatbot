'use strict';

const runtime = require('../utils/Runtime');
const Settings = require('../utils/Settings');
const availableStatuses = Settings.getSetting( 'user-status', 'statuses' );

class User {
    constructor( attrs ) {
        this.username = attrs.username;
        this.id = attrs.id;
        this.role = attrs.role;
    }

    /**
     * Save this user into the brain
     * @return {void}
     */
    saveToBrain() {
        let users = runtime.brain.get( 'users' ) || {};
        users[ this.username ] = {
            username: this.username,
            id: this.id,
            role: this.role
        };
        runtime.brain.set( 'users', users );
    }

    getMessages() {
        let messages = runtime.brain.get( 'userMessages' ) || {};
        let userMessageLog = messages[ this.username ];

        return userMessageLog;
    }

    /**
     * Returns a boolean if the user has equal-to or
     * greater than the passed-in permission.
     * @param  {String}  statusID
     * @return {Boolean
     */
    hasStatus( statusID ) {
        let statusObj = availableStatuses[ statusID.toLowerCase() ];
        let userStatusObj = availableStatuses[ this.status.toLowerCase() ];
        return userStatusObj.weight >= statusObj.weight;
    }

    isModerator() {
        return this.hasStatus( 'moderator' );
    }

    isAdmin() {
        return this.id === runtime.credentials.admin;
    }

    isBot() {
        return this.username === runtime.credentials.botID;
    }
}

module.exports = User;