'use strict'

const regex = new RegExp( /^(!|\/)ping$/ );

module.exports = [{
    name: '!ping',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        // Parse the message from the command,
        // limit !say message to 80 chars
        let message = regex.exec( stanza.message )[2];

        console.log(message);
    }
}]; 