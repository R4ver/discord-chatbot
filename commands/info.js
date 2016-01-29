'use strict'

const runtime = require('../utils/Runtime');
const fs = require("fs");
const regex = new RegExp( /^(>)info/ );

module.exports = [{
    name: '!ping',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {

        let str = fs.readFileSync(__dirname + "/../setup/core/info.md", "utf8");

        fs.readFile(__dirname + "/../setup/core/info.md", 'utf8', function(err, data) {
            if (err) throw err;
            chat.sendMessage(data, stanza.user.id);
        });
    }
}];