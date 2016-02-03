'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const Log = require('../../utils/Log');
const auth = require('../op/auth');
const joinRegex = new RegExp( /^(>)mp\sjoin$/ );

module.exports = [{
    name: 'musicplayer',
    types: ['message'],
    regex: joinRegex,
    action: function( chat, stanza ) {
        chat.getServers();
    }
}];