module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distName: 'Keyboard Maestro',
        distJs: '<%= distName%>.control.js',
        distMiniJs: '<%= distName%>.min.control.js',
        testDir: '${HOME}/Documents/Bitwig Studio/Controller Scripts/Debug',
        jshint: {
            files: [
                'src/**/*.js',
                'package.json',
                '.jshintrc'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            files: {
                src: [
                    'node_modules/underscore/underscore.js',
                    'lib/json2.js',
                    'src/directive.js',
                    'src/generated-action-ids.js',
                    'src/util.js',
                    'src/action.js',
                    'src/main.js'
                ],
                dest: '<%= distJs%>'
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= distMiniJs%>': '<%= distJs%>'
                }
            }
        },
        template: {
            generate: {
                options: {
                    data: grunt.file.readJSON('actions/bitwig-studio-actions-1.1RC1.json')
                },
                files: {
                    'BitwigStudioActions(Safe).kmlibrary': ['template/BitwigStudioActions(Safe).kmlibrary.tpl'],
                    'BitwigStudioActions.kmlibrary': ['template/BitwigStudioActions.kmlibrary.tpl'],
                    'src/generated-action-ids.js': ['template/bitwig-studio-action-ids.js.tpl']
                }
            }
        },
        shell: {
            test: {
                command: [
                    'mkdir -p "<%= testDir%>"',
                    'cp -f "<%= distJs%>" "<%= testDir%>"',
                    'ls -l "<%= testDir%>"'
                ].join('&&')
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-template');
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('generate', ['template:generate']);
    grunt.registerTask('integration-test', ['shell:test']);
};
