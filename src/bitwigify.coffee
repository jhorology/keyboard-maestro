global.loadAPI 1

# Bitwig Studio Rhino engine is ES3
require 'es5-shim'

# global modules
global.JSON    = require 'JSON'
global.console = require 'console'

util           = require 'util'
host           = global.host

# replace console-browserify methods
console.log = ->
  host.println util.format.apply undefined, arguments
console.warn = ->
  host.errorln util.format.apply undefined, arguments
if DEBUG
  console.trace = console.warn
else
  console.trace = ->

class ApiWrapper extends require 'events'
  constructor: (clazz, api, blacklist) ->
    @api = api
    for propertyName of api
      try
        if propertyName isnt 'class' and propertyName not in blacklist
          if not clazz::[propertyName] and typeof api[propertyName] is 'function'
            clazz::[propertyName] = ((func) =>
              if /^java\.lang\.String/m.test func.toString()
                =>
                  console.info "## #{func}" if DEBUG
                  String func.apply @api, arguments
              else if /^void/m.test func.toString()
                =>
                  console.info "## #{func}" if DEBUG
                  func.apply @api, arguments
                  @
              else
                =>
                  console.info "## #{func}" if DEBUG
                  func.apply @api, arguments

            )(api[propertyName])
      catch error
        console.error error if DEBUG

class Host extends ApiWrapper
  constructor: (api) ->
    super Host, api, ['notificationSettings','preferences','documentState']
    
  prepare: (defs) ->
    @defineController defs.vender, defs.name, defs.version, defs.uuid, defs.author
    @numInPorts = 1
    @numOutPorts = 0
    defineMidi = (pairs) =>
      for pair in pairs
        @numInPorts = pair.in.length if @numInPorts < pair.in.length
        @numOutPorts = pair.out.length if @numOutPorts < pair.out.length
      @defineMidiPorts @numInPorts, @numOutPorts
      for pair in pairs
        @addDeviceNameBasedDiscoveryPair pair.in, pair.out
    
    defineMidi defs.midiPort.mac if @platformIsMac()
    defineMidi defs.midiPort.windows if @platformIsWindows()
    defineMidi defs.midiPort.linux if @platformIsLinux()
    @

bitwig = new Host(host)

global.init = ->
  for port in [0..(bitwig.numInPorts - 1)]
    bitwig.getMidiInPort(port).setMidiCallback (s, d1, d2) -> bitwig.emit 'midi', port, s, d1, d2
    bitwig.getMidiInPort(port).setSysexCallback (data) -> bitwig.emit 'sysex', port, data
  bitwig.emit 'init'

global.flush = ->
  bitwig.emit 'flush'

global.exit = ->
  bitwig.emit 'exit'

module.exports = bitwig
