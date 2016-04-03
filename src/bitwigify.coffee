## shim for using node.js way in Bitwig Studio

global.loadAPI 1

# Bitwig Studio Rhino engine is ES3

# support es5-shim 4.5.7
# patch for bitwig's Array#sort never throw execption.
Array::_originalSort = Array::sort
Array::sort = ->
  if arguments.length isnt 0
    throw new Error("original Array#sortt dosn't support arguments.")
  @_originalSort()

require 'es5-shim'


# global modules
global.JSON    = require 'JSON'
global.console = require 'console'
# global.process = require 'process'

timers = require 'timers'
global.setTimeout     = timers.setTimeout
global.clearTimeout   = timers.clearTimeout
global.setInterval    = timers.setInterval
global.clearInterval  = timers.clearInterval
global.setImmediate   = timers.setImmediate
global.clearImmediate = timers.clearImmediate

# required module
host           = global.host
util           = require 'util'

# replace console-browserify methods
console.log = ->
  host.println util.format.apply undefined, arguments
console.warn = ->
  host.errorln util.format.apply undefined, arguments
if DEBUG
  console.trace = console.warn
else
  console.trace = ->
    
