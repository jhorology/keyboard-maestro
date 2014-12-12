module.exports = (grunt) ->
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'
        distName: 'Keyboard Maestro'
        distJs: '<%= distName%>.control.js'
        distMiniJs: '<%= distName%>.min.control.js'
        testDir: '${HOME}/Documents/Bitwig Studio/Controller Scripts/Debug'
        jshint:
            files: [
                'src/**/*.js',
                'package.json',
                '.jshintrc'
            ]
            options:
                jshintrc: '.jshintrc'

        browserify:
            dist:
                files:
                    '<%= distJs%>': [
                        'node_modules/underscore/underscore.js',
                        'node_modules/JSON2/json2.js',
                        'src/bitwig.coffee',
                        'src/actions.coffee',
                        'src/util.coffee',
                        'src/action.coffee',
                        'src/main.coffee'
                    ]
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']

        concat:
            options:
                stripBanners: true
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\nvar window = this;\n'

            dist:
                files:
                    '<%= distJs%>': [
                        '<%= distJs%>'
                    ]

        uglify:
            dist:
                files:
                    '<%= distMiniJs%>': '<%= distJs%>'

        template:
            generate:
                options:
                    data: grunt.file.readJSON 'actions/bitwig-studio-actions-1.1.2.json'

                files:
                    'BitwigStudioActions(Safe).kmlibrary': ['template/BitwigStudioActions(Safe).kmlibrary.tpl'],
                    'BitwigStudioActions.kmlibrary': ['template/BitwigStudioActions.kmlibrary.tpl'],
                    'src/actions.coffee': ['template/actions.coffee.tpl']

        shell:
            test:
                command: [
                    'mkdir -p "<%= testDir%>"',
                    'cp -f "<%= distJs%>" "<%= testDir%>"',
                    'ls -l "<%= testDir%>"'
                ].join '&&'

    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-shell'
    grunt.loadNpmTasks 'grunt-template'
    grunt.registerTask 'default', ['jshint', 'browserify', 'concat', 'uglify']
    grunt.registerTask 'generate', ['template:generate']
    grunt.registerTask 'integration-test', ['shell:test']
