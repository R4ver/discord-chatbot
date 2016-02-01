'use strict'

const runtime = require('../../utils/Runtime');
const Client = require('../../utils/Client');
const Github = require('github-api');
const gc = require('./credentials');
const regex = new RegExp( /^(>)gitstats\s(.+)$/ );

//Create new Github instance
let github = new Github({
    username: gc.gitUser,
    password: gc.gitPwd,
    auth: "basic"
});

module.exports = [{
    name: '>gitstats',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        
        let git = github.getUser();
        let userData;

        let match = regex.exec( stanza.message );
        let user = match[2];

        git.show(user, function(err, user) {
            if ( err ) {
                console.log(err);
                if ( err.error == 404 ) {
                    chat.sendMessage('```Github user not found.```', stanza);
                }
            }

            let convert_date = user.created_at;
            let created_at = /(.+)T/.exec(convert_date)[1];
            let bio = user.bio;

            if ( !bio ) {
                bio = '';
            }

            chat.sendMessage(`${user.html_url}` + "\n```" + `
Username: ${user.login}
Joined: ${created_at}
Repos: ${user.public_repos}
Followers: ${user.followers}
Following: ${user.following}

${bio}
            ` + "```", stanza)
        });
    }
}];