'use strict'

const runtime = require('../../utils/Runtime');
const auth = require('../op/auth');
const goinsleepRegex = new RegExp( /^(~)gosl$/ );
const h3h3Regex = new RegExp( /^(\bh3h3|ethan|bradberry)$/)

module.exports = [{
    name: 'I want to go in my sleep',
    types: ['message'],
    regex: goinsleepRegex,
    action: function( chat, stanza ) {
        chat.sendMessage("I  W A N T  T O  G O  I N  M Y  S L E E P ! ! ! ", stanza);
    }
},{
    name: 'ethan bradberry',
    types: ['message'],
    regex: h3h3Regex,
    action: function( chat, stanza ) {
        let messages = [
            "Ethan Bradberry?",
            "I'm Ethan Bradberry"
        ]

        chat.sendMessage("I'm Ethan Bradberry", stanza);
    }
}];