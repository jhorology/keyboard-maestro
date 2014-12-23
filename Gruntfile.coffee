module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    distName: 'Keyboard Maestro'
    distJs: '<%= distName%>.control.js'
    distMiniJs: '<%= distName%>.min.control.js'
    jsTestDir: '${HOME}/Documents/Bitwig Studio/Controller Scripts/Debug'
    distKmLib: 'BitwigStudioActions.kmlibrary'
    kmLibDir: '${HOME}/Library/Application Support/Keyboard Maestro/Keyboard Maestro Libraries'
    
    jshint:
      files: [
        'src/**/*.js'
        'actions/*.json'
        '*.json'
      ]
      options:
        jshintrc: 'jshint.json'

    coffeelint:
      app: [
        'src/*.coffee'
        'Gruntfile.coffee'
      ]
      options:
        configFile: 'coffeelint.json'

    browserify:
      dist:
        files:
          '<%= distJs%>': 'src/main.coffee'
        options:
          transform: ['coffeeify']
          browserifyOptions:
            extensions: ['.coffee']

    concat:
      options:
        stripBanners: true
        banner: '''
/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */
// workaround for browserify's global.
var window = this;

'''
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
          data: grunt.file.readJSON 'actions/bitwig-studio-actions-1.1.3RC2.json'
        files:
          '<%= distKmLib%>': ['template/<%= distKmLib%>.tpl']
          'src/actions.coffee': ['template/actions.coffee.tpl']

    shell:
      test:
        command: [
          'mkdir -p "<%= jsTestDir%>"'
          'cp -f "<%= distMiniJs%>" "<%= jsTestDir%>"'
          'ls -l "<%= jsTestDir%>"'
          'cp -f "<%= distKmLib%>" "<%= kmLibDir%>"'
          'ls -l "<%= kmLibDir%>"'
        ].join '&&'

    grunt.loadNpmTasks 'grunt-contrib-jshint'
    grunt.loadNpmTasks 'grunt-coffeelint'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-shell'
    grunt.loadNpmTasks 'grunt-template'
    grunt.registerTask 'default', ['jshint', 'coffeelint', 'browserify', 'concat', 'uglify']
    grunt.registerTask 'generate', ['template:generate']
    grunt.registerTask 'integration-test', ['shell:test']
