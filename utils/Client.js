'use strict';

const DiscordClient = require('discord.io');
const crypto = require('crypto');
const Log = require('./Log');
const runtime = require('./Runtime');
const User = require('../model/User');

class Client {
    /**
     * Connect to a room
     * @param  {object} credentials
     * @return {void}
     */
    constructor( credentials ) {
        this.credentials = credentials;

        // Connect to the server
        this.client = new DiscordClient({
            autorun: true,
            email: credentials.email,
            token: credentials.token 
        });

        this.client.on('error', function(err) {
            Log.log('CLIENT ERROR: ', err);
        });

        this.client.on('ready', function () {
            Log.log( 'Connected' );
            this.setup();
            //this.sendPressence();
        }.bind(this) );
    }

    setup() {
        this.client.editUserInfo({
            //avatar: require('fs').readFileSync('../setup/custom/images/fullyerect.jpg', 'base64'), //Optional
            password: this.credentials.password, //Required
            username: runtime.credentials.botName //Optional
        });

        this.client.setPresence({
            game: "Boku no Pico: Online"    
        });
    }

    sendPressence() {
        this.client.sendMessage({
            to: this.credentials.channel,
            message: runtime.credentials.botName + " 2.0 Initialized"
        })
    }

    listen(action) {
        this.client.on('message', function(user, userID, channelID, message, rawEvent) {
            rawEvent['serverFromChannel'] = this.client.serverFromChannel(channelID);
            rawEvent['channelID'] = rawEvent.d.channel_id;
            rawEvent['userID'] = userID;
            let StringedEvent = JSON.stringify(rawEvent);
            action(StringedEvent); 
        }.bind(this) );
    }

    /**
     * Returns the user based on the specified username.
     * @param  {string} username
     * @return {object}
     */
    static getUser( id, username ) {

        const users = runtime.brain.get( 'users' ) || {};
        let userObj = users[ id ];

        if ( !userObj ) {
            // If the user joined the channel for the first time,
            // while the bot was not connected, the user will not
            // have an entry in the 'users' brain.
            // Create the entry for the user here
            userObj = {
                username: username,
                id: id,
                time: new Date().getTime()
            };
            users[ id ] = userObj;
            runtime.brain.set( 'users', users );
        }

        if ( username != userObj.username ) {
            userObj = {
                username: username,
                id: id,
                time: new Date().getTime()
            };
            users[ id ] = userObj;
            runtime.brain.set( 'users', users );
        }

        return new User( userObj );
    }

    /**
     * Parse the message 
     * @param  {string} event
     * @param  {string} credentials
     * @return {object}
     */
    static parseMessage( event, credentials ) {
        let type = 'message';
        let rawEvent = JSON.parse(event);
        let username = rawEvent.d.author.username;
        let userID = rawEvent.d.author.id;
        let message = rawEvent.d.content;
        let rateLimited = false;

        // Rate limiting
        const now = new Date().getTime();
        let messages = runtime.brain.get( 'userMessages' ) || {};
        let userMessageLog = messages[ username ];

        // Don't rate limit the bot
        if ( username !== credentials.username && userMessageLog ) {
            let lastCommandTimeExists = userMessageLog.lastCommandTime > 0;

            if ( lastCommandTimeExists && now - userMessageLog.lastCommandTime < 3000 ) { // 3 seconds
                rateLimited = true;
            }
        }

        let user = Client.getUser( userID, username );

        // Return the parsed message
        return { type, user, message, rateLimited, rawEvent };
    }

    getServers() {
        return this.client.servers;
    }

    sendMessage( message, stanza ) {
        if ( runtime.debug ) {
            Log.log('DEBUGGING: ' + message);
            return false;
        }

        let receiver = stanza.rawEvent.channelID;

        console.log(message + " | " + receiver);

        // Get the previously sent messages
        let messages = runtime.brain.get('messages') || {};

        // Hash the message and use it as our key.
        // Grab the previous message that uses the same hash.
        // (ie: the message text is the same).
        // Build the new message object.
        let hash = crypto.createHash('md5').update( message ).digest('hex');
        let previousMessage = messages[ hash ];
        let messageObj = {
            message: message,
            time: new Date().getTime()
        };

        // Compare the previous message time vs the current message time
        // Only send the message to the server, if the difference is > 5 seconds
        if ( !previousMessage || messageObj.time - previousMessage.time > 5000 ) { // 5 seconds
            this.client.sendMessage({
                to: receiver,
                message: "`" + message + "`"
            });
        } else {
            Log.log( 'Skipping sendMessage - previous message sent within 5 seconds' );
        }

        // Save the message to the messages store
        messages[ hash ] = messageObj;
        runtime.brain.set( 'messages', messages );
    }

    sendPrivate( message, stanza ) {
        if ( runtime.debug ) {
            Log.log('DEBUGGING: ' + message);
            return false;
        }

        let receiver = stanza.rawEvent.userID;

        console.log(message + " | " + receiver);

        // Get the previously sent messages
        let messages = runtime.brain.get('messages') || {};

        // Hash the message and use it as our key.
        // Grab the previous message that uses the same hash.
        // (ie: the message text is the same).
        // Build the new message object.
        let hash = crypto.createHash('md5').update( message ).digest('hex');
        let previousMessage = messages[ hash ];
        let messageObj = {
            message: message,
            time: new Date().getTime()
        };

        // Compare the previous message time vs the current message time
        // Only send the message to the server, if the difference is > 5 seconds
        if ( !previousMessage || messageObj.time - previousMessage.time > 5000 ) { // 5 seconds
            this.client.sendMessage({
                to: receiver,
                message: message
            });
        } else {
            Log.log( 'Skipping sendMessage - previous message sent within 5 seconds' );
        }

        // Save the message to the messages store
        messages[ hash ] = messageObj;
        runtime.brain.set( 'messages', messages );
    }
}

module.exports = Client;