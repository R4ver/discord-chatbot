'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');

module.exports = [{
    types: ['startup'],
    action: function( chat ) {
        chat.sendMessage()
    }
}];