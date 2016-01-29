'use strict';

/**
 * Discord chatbot
 */

const credentials = require('./setup/custom/credentials');
const Brain = require('/utils/Brain');
const ChatBot = require('/utils/ChatBot');

// Build the initial runtime object
let runtime = require('./utils/Runtime');
runtime.debug = process.argv[2] === 'debug' || false;
runtime.coreCommands = null;
runtime.pluginCommands = null;
runtime.websocketCommands = null;
runtime.startUpTime = new Date().getTime();
runtime.credentials = credentials;
runtime.brain = Brain;

// Verify credentials exist
if ( !runtime.credentials.email || !runtime.credentials.password || !runtime.credentials.token ) {
    console.error('ERROR: Credentials file is missing required attributes. Please check your credentials.js');
    console.log('[bot] Quitting startup process.');
    return;
}

runtime.brain.start( __dirname + "/brain" );
ChatBot.start();