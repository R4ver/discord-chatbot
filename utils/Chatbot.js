'use strict';

const DiscordClient = require('discord.io');
const Client = require( './Client' );
const Log = require('./Log');
const Loader = require('./Loader');
let runtime = require('./Runtime');

class ChatBot {

    static start() {
        // Load core commands
        Loader.loadCoreCommands( ( coreCommands ) => {
            // coreCommands is returned as an object with
            // each message type as an array
            runtime.coreCommands = coreCommands;

            // Load plugin commands
            Loader.loadPluginCommands( ( pluginCommands, pluginWebsocketFiles ) => {
                runtime.pluginCommands = pluginCommands;
                runtime.pluginWebsocketFiles = pluginWebsocketFiles;

                // Load the client (connects to server)
                let chat = new Client( runtime.credentials );

                // Run any start up commands
                ChatBot.runStartupCommands( chat );

                // Start the websocket server

                // Start listening for stanzas
                ChatBot.Listen(chat);
            } );
        } );
    }

    /**
     * Run any of the 'startup' type commands
     * for both core and plugin commands.
     * @return {void}
     */
    static runStartupCommands( chat ) {
        // Loop through each startup core commands, and run the action
        runtime.coreCommands.startup.forEach( function( command ) {
            command.action( chat );
        });

        // Loop through each startup plugin commands, and run the action
        runtime.pluginCommands.startup.forEach( function( command ) {
            command.action( runtime.credentials );
        });
    }

    static Listen(chat) {
        chat.listen(function(message) {
            // Skip the initial messages when starting the bot
            if ( ChatBot.isStartingUp() ) {
                return;
            }
            
            runtime.brain.start( __dirname + '/../brain' );

            let parsedMessage = Client.parseMessage(message, runtime.credentials);

            parsedMessage.ranCommand = false;
            // Run the incoming stanza against
            // the core commands for the stanza's type.
            let coreCommandsForStanzaType = runtime.coreCommands[ parsedMessage.type ];
            if ( coreCommandsForStanzaType ) {
                coreCommandsForStanzaType.forEach( ( command ) => {
                    if ( ChatBot.runCommand( command, parsedMessage, chat ) ) {
                        parsedMessage.ranCommand = true;
                    }
                } );
            }
        });
    }

    /**
     * Runs a passed-in command, if the regex matches
     * and the rateLimiting criteria matches.
     * @param  {obj} command
     * @param  {obj} parsedStanza
     * @param  {Client} chat
     * @return {void}
     */
    static runCommand( command, parsedMessage, chat ) {

        try {
            var regexMatched =  command.regex && command.regex.test( parsedMessage.message.toLowerCase() );
            var ignoreRateLimiting = command.ignoreRateLimiting;
            var passesRateLimiting = !parsedMessage.rateLimited || ( parsedMessage.rateLimited && ignoreRateLimiting );

            if ( regexMatched && passesRateLimiting ) {
                command.action( chat, parsedMessage );

                // If we are ignoring rate limiting,
                // don't say we ran a command.
                if ( !ignoreRateLimiting ) {
                    return true;
                }
            }
        } catch ( e ) {
            Log.log( 'Command error: ', command, e );
        }
    }

    /**
     * Returns a boolean based on the startup state of the bot.
     * @return {Boolean}
     */
    static isStartingUp() {
        const messageTime = new Date().getTime();
        if ( messageTime - runtime.startUpTime < 10000 ) { // 10 seconds
            Log.log('Starting up, skipping message');
            return true;
        }

        return false;
    }

}

module.exports = ChatBot;
