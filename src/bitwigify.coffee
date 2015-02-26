global.loadAPI 1

# Bitwig Studio Rhino engine is ES3
require 'es5-shim'

# global modules
global.JSON    = require 'JSON'
global.console = require 'console'

# required module
host           = global.host
util           = require 'util'
Bitmonkey      = require './bitmonkey'

# replace console-browserify methods
console.log = ->
  host.println util.format.apply undefined, arguments
console.warn = ->
  host.errorln util.format.apply undefined, arguments
if DEBUG
  console.trace = console.warn
else
  console.trace = ->

bitwig = new Bitmonkey.Host(host)

global.init = ->
  for port in [0..(bitwig.numInPorts - 1)]
    bitwig.getMidiInPort(port).setMidiCallback (s, d1, d2) -> bitwig.trigger 'midi', port, s, d1, d2
    bitwig.getMidiInPort(port).setSysexCallback (data) -> bitwig.trigger 'sysex', port, data
  bitwig.trigger 'init'

global.flush = ->
  bitwig.trigger 'flush'

global.exit = ->
  bitwig.trigger 'exit'

module.exports = bitwig
