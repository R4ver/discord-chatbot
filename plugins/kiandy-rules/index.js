'use strict'

const runtime = require('../../utils/Runtime');
const regex = new RegExp( /^(~)rules$/ );

const rules = `
**Common rules on the server**

**Don't** promote other Discord servers. Send people a DM (Direct Message) instead.

Keep links, images etc. in the #pics-vids-links-go-here.

Be nice to all the faggots here. kys and gg wp reported :)
`

module.exports = [{
    name: 'rules',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        console.log("I hit this");
        chat.sendPrivate(rules, stanza);
    }
}];