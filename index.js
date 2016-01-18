'use strict';

var fs = require('fs');
const credentials = require('./setup/custom/credentials');

const DiscordClient = require('discord.io');
let bot = new DiscordClient({
    autorun: true,
    email: credentials.email,
    token: credentials.token 
});

bot.on('ready', function () {
    console.log(bot.username + " - (" + bot.id + ")");

    bot.editUserInfo({
        avatar: require('fs').readFileSync('./images/fullyerect.jpg', 'base64'), //Optional
        password: credentials.password, //Required
        username: 'The Best Bot' //Optional
    });

    // bot.sendMessage({
    //     to: credentials.channel,
    //     message: "I have ascended from the darkness of the consoles!"
    // });  
});

let swearWords = ["fuck u man!", "yo mama", "I will slap you in the face", "you chubby"];
let khaledQuotes = [
    "Don't burn no bridge. Only god can walk on water.", 
    "Always have faith. Always have hope.", 
    "Smh they get mad when u have joy.", 
    "Those that weather the storm r the great ones.", 
    "Blessup.",
    "You have to make it through the jungle to make it to paradise. That's the key.",
    "Give thanks to the most high.",
    "Lion",
    "Some people can't handle success. I can.",
    "Another one, no. Another two, drop two singles at a time.",
    "Another one"
]

bot.on('message', function (user, userID, channelID, message, rawEvent) {
    let convertMessage = message.toLowerCase();
    let messageInfo = rawEvent.d;

    let username = messageInfo.author.username;

    if (convertMessage === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }

    if ( convertMessage === "bing" ) {
        bot.sendMessage({
            to: channelID,
            message: "bong" 
        });
    }

    if ( convertMessage === "im back" || convertMessage === "i'm back" || convertMessage === "i am back" ) {
        bot.sendMessage({
            to: channelID,
            message: "Hello Back, I'm dad :^)" 
        });
    }

    if ( convertMessage === "wake me up" ) {
        bot.sendMessage({
            to: channelID,
            message: "**WAKE ME UP INSIDE**" 
        });
    }

    if ( convertMessage === "cant wake up" || convertMessage === "can't wake up" ) {
        bot.sendMessage({
            to: channelID,
            message: "**SAVE ME**" 
        });
    }
    
    if ( convertMessage === "#deportdan" ) {
        bot.sendMessage({
            to: channelID,
            message: "Yea! #DEPORTDAN!!" 
        });
    }

    if ( convertMessage === "ayy lmao" ) {
        bot.sendMessage({
            to: channelID,
            message: ":alien:" 
        });
    }

    if ( convertMessage === "gems" ) {
        bot.sendMessage({
            to: channelID,
            message: "Gems are truly outrageous" 
        });
    }  

    if ( convertMessage === "tsm" ) {
        bot.sendMessage({
            to: channelID,
            message: "**TSM TSM TSM**"
        });
    }  
    
    if ( convertMessage === "sluta" ) {
        bot.sendMessage({
            to: channelID,
            message: "Nej du måste sluta"
        });
    }

    if (convertMessage === "!swear") {
        let swearWord = swearWords[Math.floor(Math.random() * swearWords.length)];

        bot.sendMessage({
            to: channelID,
            message: "***" + username + "*** " + swearWord
        });
    }

    if (convertMessage === "!khaled") {
        let quote = khaledQuotes[Math.floor(Math.random() * khaledQuotes.length)];

        bot.sendMessage({
            to: channelID,
            message: '*"' + quote + '"*' + " - DJ Khaled"
        });
    }

    if ( convertMessage === "!flip" ) {

        bot.sendMessage({
            to: channelID,
            message: "‎(ﾉಥ益ಥ）ﾉ﻿ ┻━┻"
        });
        
    }

    if ( convertMessage === "!cyka" ) {
        bot.sendMessage({
            to: channelID,
            message: "сука блядь"
        });
    }

    if ( convertMessage === "!drophack" ) {
        bot.sendMessage({       
            to: channelID,
            message: "```javascript" + "\n" + "hax.drophack.init();" + "\n" + "```"
        });
    }

    if ( convertMessage === "!roll" ) {
        let randomNumber = Math.floor(Math.random() * 6);

        if ( randomNumber == 0 ) {
            console.log("rerolling dice");
            randomNumber = Math.floor(Math.random() * 6);
        }

        bot.sendMessage({
            to: channelID,
            message: "@" + username + ": You rolled " + randomNumber
        });
    }

    if ( convertMessage === "!rollteam" ) {
        let obj = JSON.parse(fs.readFileSync('./league.json', 'utf8'));

        let team = [];
        let lane = [];
        let randomTeam = "";
        let randomLane = "";

        for ( let i = 0; i < 5; i++ ) {
            let champion = obj.champions[Math.floor(Math.random() * obj.champions.length)];
            let lanes = obj.lane[Math.floor(Math.random() * obj.lane.length)];

            team.push(champion);
            lane.push(lanes);
        }

        for ( let champ in team ) {
            let gohere = obj.lane[Math.floor(Math.random() * obj.lane.length)];
            randomTeam += "Champion: " + team[champ] + " Goes to: " + gohere + "\n";
        }

        bot.sendMessage({
            to: channelID,
            message: "**WELCOME TO THE RANDOM TEAM**\n\n" + randomTeam
        });
    }

    if ( convertMessage === "!rules" ) {
        let rules = "1. All links, images, videos etc. Goes into the #pics-vids-links-go-here text-channel\n2. Do not post pornographic or NSFW content in the #pics-vids-links-go-here text-channel.\n3. Do not use @everyone in any chat.\n4. Ryan is not allowed to have a giggle fit.\n5. **DON'T SPAM THE BOT! It's still under development so please don't spam it.**\n\nCommands of the bot:\n1. ping\n2. bing\n3. !swear\n4. !khaled\n5. !flip\n6. !drophack\n7. !rules\n"

        bot.sendMessage({
            to: userID,
            message: rules
        });
    }
}); 