'use strict'

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');
const goinsleepRegex = new RegExp( /^(~)gosl$/ );

module.exports = [{
    name: 'I want to go in my sleep',
    types: ['message'],
    regex: goinsleepRegex,
    action: function( chat, stanza ) {
        chat.sendMessage("I  W A N T  T O  G O  I N  M Y  S L E E P ! ! ! ");
    }
}];