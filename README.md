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

# License
The MIT License (MIT)

Copyright (c) 2016 RavingAPD

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.