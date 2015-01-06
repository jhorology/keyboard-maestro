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
                  console.info # #{func}" if DEBUG
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
    super Host, host, ['notificationSettings','preferences','documentState']
    
  prepare: (defs) ->
    @defineController defs.vender, defs.name, defs.version, defs.uuid, defs.author
    @defineMidiPorts defs.numInPorts, defs.numOutPorts
    @numInPorts = defs.numInPorts
    @numOutPorts = defs.numOutPorts
    if @platformIsMac()
      @addDeviceNameBasedDiscoveryPair defs.macInPortNames, defs.macOutPortNames
    if @platformIsWindows()
      @addDeviceNameBasedDiscoveryPair defs.windowsInPortNames, defs.windowOutPortNames
    if @platformIsLinux()
      @addDeviceNameBasedDiscoveryPair defs.linuxInPortNames, defs.linuxOutPortNames
    @

  init: ->
    @getMidiInPort(0).setMidiCallback (s, d1, d2) =>
      @emit 'midi', 0, s, d1, d2
    if @numMidiInPorts > 1
      @api.getMidiInPort(1).setMidiCallback (s, d1, d2) =>
        @emit 'midi', 1, s, d1, d2
    @emit 'init'
    
  flush: ->
    @emit 'flush'
    
  exit: ->
    @emit 'exit'

bitwig = new Host(host)

global.init = ->
  bitwig.init()

global.flush = ->
  bitwig.flush()

global.exit = ->
  bitwig.exit()

module.exports = bitwig
