'use strict';

const runtime   = require('../../utils/Runtime');
const Client    = require('../../utils/Client');
const Log       = require('../../utils/Log');

export function addSong(id, title) {
    return {
        type: 'ADD_SONG',
        id,
        title
    }
}

