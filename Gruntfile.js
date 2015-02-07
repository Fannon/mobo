'use strict';

module.exports = function(grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // Load all grunt tasks
    //require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                force: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        mochacli: {
            options: {
                reporter: 'spec',
                bail: true,
                force: true,
                timeout: 16000
            },
            all: ['test/*/*.spec.js', 'test/*/.exec.js']
        },
        mocha_istanbul: {
            coverage: {
                src: ['test/*/*.spec.js', 'test/*/.exec.js'],
                options: {
                    mask: '*.spec.js',
                    coverage: true,
                    check: {
                        lines: 0,
                        statements: 0,
                        branches: 0,
                        functions: 0
                    },
                    root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
                    reportFormats: ['lcov','text']
                }
            }
        },
        watch: {
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'mochacli']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'mochacli']
            }
        }
    });

    // Default task.
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
    grunt.registerTask('default', ['jshint', 'coverage']);

    grunt.event.on('coverage', function(content, done) {
        done();
    });
};
