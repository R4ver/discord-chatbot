/*global module:false*/
    module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: true,
                presets: ["es2015"],
                plugins: ["transform-strict-mode"]
            },
            dist: {
                files: [
                    {src: '*_es6.js', dest: '*.js'},
                    {src: 'commands/src/*_es6.js', dest: 'commands/*.js'}
                ]
            }
        },

        watch: {
            babel: {
                files: [
                    '*_es6.js',
                    'commands/**/*_es6.js'
                ],
                tasks: ['babel']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');

    grunt.registerTask('default', ["babel"]);
};