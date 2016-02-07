'use strict';

const runtime   = require('../../utils/Runtime');
const Client    = require('../../utils/Client');
const Log       = require('../../utils/Log');
const fetch     = require('node-fetch');
const spawn     = require('child_process').spawn;

//Always have a variable for ffmpeg available
let ffmpeg;

class Player {
    constructor() {
        this.playList = runtime.brain.get('playList');
    }

    static createStream(url) {
        ffmpeg = spawn("ffmpeg", [
            '-i', url + ".mp3",
            '-f', 's16le',
            '-ar', '48000',
            '-af', 'volume=0.030',
            '-ac', '2',
            'pipe:1'
        ], {stdio: ['pipe', 'pipe', 'ignore']});

        return ffmpeg;
    }

    checkIndex() {
        //Check if the songIndex it greater than or equal to the length of the songList
        if( this.playList.currentSongIndex + 1 > this.playList.songList.length ) {
            console.log("The index was greater" + this.playList.currentSongIndex);
            this.playList.currentSongIndex = this.playList.songList.length - 1;

            console.log('The index was greater than or equal');
            return true;
        }

        runtime.brain.set('playList', this.playList);

        if ( this.playList.currentSongIndex + 1 == this.playList.songList.length ) {
            console.log("The index was greater" + this.playList.currentSongIndex);
            this.playList.currentSongIndex = this.playList.songList.length - 1;
            runtime.brain.set('playList', this.playList);

            return false;
        }
    }

    resetChannel() {
        //Reset the channel information
        this.playList.inVoiceChannel = false;
        this.playList.currentVoiceChannel = '';
        this.playList.currentChannelName = '';

        //Save the playList
        runtime.brain.set('playList', this.playList);
    }

    killMusic() {
        if ( ffmpeg == null )
            return;

        ffmpeg.kill();
        ffmpeg.on('close', (code, signal) => {
            console.log(
                `child process terminated due to receipt of signal ${signal}`);
        });

        //Reset ffmpeg 
        ffmpeg = null;
    }

    playMusic(songId, stream) {
        fetch("http://www.youtubeinmp3.com/fetch/?format=JSON&video=http://www.youtube.com/watch?v=" + songId)
            .then(function(res) {
                return res.text();
            }).then(function(body) {
                let _body = JSON.parse(body);
                let musicStream = Player.createStream(_body.link);

                //Start the music stream
                stream.send(musicStream.stdout);
            });
    }
}

//Export the Player
module.exports = Player;