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
            username: 'The Best Bot' //Optional
        });
    }

    sendPressence() {
        this.client.sendMessage({
            to: this.credentials.channel,
            message: "I has return with new code! Not done though.."
        })
    }

    listen(credentials) {
        this.client.on('message', function( user, userID, channelID, message, rawEvent, credentials ) {
            Log.log("User: " + user + "\nuserID: " + userID + "\nchannelID: " + channelID + "\nmessage: " + message + "\nrawEvent: " + rawEvent, "\ncredentials: " + credentials );
            this.sendMessage(channelID, "Got the message");
        }.bind(this) );
    }

    sendMessage( channelID, message ) {
        if ( runtime.debug ) {
            Log.log('DEBUGGING: ' + message);
            return false;
        }

        console.log(message + " | " + channelID);

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
                to: channelID,
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