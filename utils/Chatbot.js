'use strict';

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
                chat.listen(runtime.credentials);
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

    /**
     * Runs a passed-in command, if the regex matches
     * and the rateLimiting criteria matches.
     * @param  {obj} command
     * @param  {obj} parsedStanza
     * @param  {Client} chat
     * @return {void}
     */
    static runCommand( command, parsedStanza, chat ) {
        Log.log("Running command, or trying");

        try {
            var regexMatched =  command.regex && command.regex.test( parsedStanza.message.toLowerCase() );
            var ignoreRateLimiting = command.ignoreRateLimiting;
            var passesRateLimiting = !parsedStanza.rateLimited || ( parsedStanza.rateLimited && ignoreRateLimiting );

            if ( regexMatched && passesRateLimiting ) {
                command.action( chat, parsedStanza );
                Log.log('running command');
                // If we are ignoring rate limiting,
                // don't say we ran a command.
                if ( !ignoreRateLimiting ) {
                    return true;
                }
            }
        } catch ( e ) {
            console.trace( 'Command error: ', command, e );
        }
    }

    /**
     * Returns a boolean based on the startup state of the bot.
     * @return {Boolean}
     */
    static isStartingUp() {
        const messageTime = new Date().getTime();
        if ( messageTime - runtime.startUpTime < 5000 ) { // 5 seconds
            Log.log( "Skipping startup messages" );
            return true;
        }

        return false;
    }
}

module.exports = ChatBot;
