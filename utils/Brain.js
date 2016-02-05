'use strict';

const brain = require('node-persist');

class Brain {
    static start( directory ) {
        brain.initSync({
            dir: directory
        });
    }

    static get( key ) {
        return brain.getItemSync( key ) || null;
    }

    static set( key, value ) {
        brain.setItemSync( key, value );
    }

    static setPid( value ) {
        brain.setItemSync('pids', value);
    }
};

module.exports = Brain;