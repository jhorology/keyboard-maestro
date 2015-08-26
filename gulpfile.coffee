# require modules
# ==================
gulp        = require 'gulp'
jshint      = require 'gulp-jshint'
coffeelint  = require 'gulp-coffeelint'
template    = require 'gulp-template'
data        = require 'gulp-data'
rename      = require 'gulp-rename'
browserify  = require 'browserify'
builtins    = require 'browserify/lib/builtins.js'
source      = require 'vinyl-source-stream'
uglify      = require 'gulp-uglify'
header      = require 'gulp-header'
del         = require 'del'
runSequence = require 'run-sequence'
pkg         = require './package.json'

# replace browserify builtin modules
# ==================
builtins.assert = require.resolve './lib/assert'
builtins.timers = require.resolve './lib/timers'
builtins.process = require.resolve './lib/process'
builtins._process = require.resolve './lib/process'
# workaround for now backbone require jquery
builtins.jquery = require.resolve './lib/_empty.js'


# paths/misc settings
# ==================
$ =
  actions:
    dir: 'actions'
    json: 'bitwig-studio-actions-1.2BETA5.json'
  src:
    dir: 'src'
    bitwigActions: 'bitwig-actions.coffee'
    extendedActions: 'extended-actions.coffee'
  template:
    dir: 'template'
    kmLib: 'BitwigStudioActions.kmlibrary.tpl'
    bitwigActions: 'bitwig-actions.coffee.tpl'
    extendedActions: 'extended-actions.coffee.tpl'
  build:
    dir: 'build'
    browserifyJs: 'Keyboard Maestro.browserify.control.js'
    debugJs: 'Keyboard Maestro.debug.control.js'
  dist:
    dir: 'dist'
    kmLib: 'BitwigStudioActions.kmlibrary'
    js: 'Keyboard Maestro.control.js'
  debug:
    jsDir: "#{process.env.HOME}/Documents/Bitwig Studio/Controller Scripts/Debug"
  deploy:
    jsDir: "#{process.env.HOME}/Documents/Bitwig Studio/Controller Scripts/Stairways Software"
    kmLibDir: "#{process.env.HOME}/Library/Application Support/Keyboard Maestro/Keyboard Maestro Libraries"
  banner: '''
/**
 * <%= pkg.name %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @link <%= pkg.homepage %>
 * @license <%= pkg.license %>
 */

// workaround for browserify's global
var global = window = this;

'''
  uglify:
    debug:
      warning: true
      fromString: true
      mangle: false
      output:
        indent_start: 0      # start indentation on every line (only when `beautify`)
        indent_level: 2      # indentation level (only when `beautify`)
        beautify: true       # beautify output?
      compress:
        global_defs:         # global definitions
          DEBUG: true
    dist:
      warning: true
      compress:
        global_defs:         # global definitions
          DEBUG: false


# tasks
# ==================
gulp.task 'jshint', ->
  gulp.src ['*.json', "#{$.actions.dir}/*.json", "#{$.src.dir}/**/*.js"]
    .pipe jshint './jshint.json'
    .pipe jshint.reporter 'jshint-stylish'

gulp.task 'coffeelint', ->
  gulp.src ['*.coffee', "#{$.src.dir}/**/*.coffee"]
    .pipe coffeelint './coffeelint.json'
    .pipe coffeelint.reporter()

gulp.task 'generate-kmLib', ->
  gulp.src ["#{$.template.dir}/#{$.template.kmLib}"]
    .pipe data -> require "./#{$.actions.dir}/#{$.actions.json}"
    .pipe template()
    .pipe rename $.dist.kmLib
    .pipe gulp.dest $.dist.dir

gulp.task 'generate-bitwig-actions', ->
  gulp.src ["#{$.template.dir}/#{$.template.bitwigActions}"]
    .pipe data -> require "./#{$.actions.dir}/#{$.actions.json}"
    .pipe template()
    .pipe rename $.src.bitwigActions
    .pipe gulp.dest $.src.dir

gulp.task 'generate-extended-actions', ->
  gulp.src ["#{$.template.dir}/#{$.template.extendedActions}"]
    .pipe data -> require "./#{$.actions.dir}/#{$.actions.json}"
    .pipe template()
    .pipe rename $.src.extendedActions
    .pipe gulp.dest $.src.dir

gulp.task 'browserify', ->
  b = browserify
    entries: ["./#{$.src.dir}/main.coffee"]
    extensions: ['.coffee']
    debug: false
  b.transform 'coffeeify'
    .bundle()
    .pipe source $.build.browserifyJs
    .pipe header $.banner, pkg: pkg
    .pipe gulp.dest $.build.dir

gulp.task 'uglify-dist-js', ->
  gulp.src ["#{$.build.dir}/#{$.build.browserifyJs}"]
    .pipe uglify $.uglify.dist
    .pipe rename $.dist.js
    .pipe gulp.dest $.dist.dir

gulp.task 'uglify-debug-js', ->
  gulp.src ["#{$.build.dir}/#{$.build.browserifyJs}"]
    .pipe uglify $.uglify.debug
    .pipe rename $.build.debugJs
    .pipe gulp.dest $.build.dir

gulp.task 'clean', (cb) ->
  del ['dist', 'build', $.debug.jsDir, $.deploy.jsDir, "#{$.deploy.kmLibDir}/#{$.dist.kmLib}"], force: true, cb

gulp.task 'copy-debug', ->
  gulp.src ["#{$.build.dir}/#{$.build.debugJs}"]
    .pipe gulp.dest $.debug.jsDir
  gulp.src ["#{$.dist.dir}/#{$.dist.kmLib}"]
    .pipe gulp.dest $.deploy.kmLibDir

gulp.task 'copy-deploy', ->
  gulp.src ["#{$.dist.dir}/#{$.dist.js}"]
    .pipe gulp.dest $.deploy.jsDir
  gulp.src ["#{$.dist.dir}/#{$.dist.kmLib}"]
    .pipe gulp.dest $.deploy.kmLibDir
    
# combined tasks
# ================
gulp.task 'default', (cb) -> runSequence.apply null, [
  ['jshint', 'coffeelint']
  ['generate-kmLib','generate-bitwig-actions','generate-extended-actions']
  'browserify'
  'uglify-dist-js'
  cb
]

gulp.task 'deploy', (cb) -> runSequence.apply null, [
  'clean'
  ['jshint', 'coffeelint']
  ['generate-kmLib','generate-bitwig-actions','generate-extended-actions']
  'browserify'
  'uglify-dist-js'
  'copy-deploy'
  cb
]

gulp.task 'debug', (cb) -> runSequence.apply null, [
  ['jshint', 'coffeelint']
  ['generate-kmLib','generate-bitwig-actions','generate-extended-actions']
  'browserify'
  'uglify-debug-js'
  'copy-debug'
  cb
]
