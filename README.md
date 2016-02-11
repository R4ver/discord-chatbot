# SD Discord Bot
This bot is a modified version of [Owen Conti's](https://github.com/owenconti/) LiveCoding.tv chatbot.
The structure is the same as his bot, but some core files has been changed to fit [discord.io](https://github.com/izy521/discord.io)

## Create a plugin for the bot

```javascript
'use strict'

const runtime = require('../utils/Runtime');
const regex = new RegExp( "^(\\" + runtime.prefix + ")ping$" );

module.exports = [{
    name: 'ping',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        chat.sendMessage('pong', stanza);
    }
}];
```

`runtime.prefix` is set in the settings file and defines the custom prefix for the bot

*More readme comming later*