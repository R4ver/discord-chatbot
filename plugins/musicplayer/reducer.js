'use strict';

const runtime   = require('../../utils/Runtime');
const Client    = require('../../utils/Client');
const Log       = require('../../utils/Log');

//Get Immutable and set defaultState
const musicBrain = runtime.brain.get('musicBrain');
const defaultSate = {};

export default function playerReducer(state = defaultState, action) {
    switch(action.type) {
        //Add new song
        case 'ADD_SONG':
            return state.concat(action.trackID, action.title);

        default:
            console.log(state);
            return state;
    }
}