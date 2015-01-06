actions = require './bitwig-actions'
bitwig  = require './bitwigify'
application = null
bitwig
  .on 'init', ->
    hostVersion = bitwig.getHostVersion()
    if hostVersion isnt actions.version
      throw new Error "Invalid version. host:[#{hostVersion}] actions:[#{actions.version}]"
    application = bitwig.createApplication()
    
  .on 'midi', (port, s, d1, d2) ->
    if s is 0xB0
      index = (d1 << 7) + d2
      application.getAction(actions.ids[index].id).invoke() if index < actions.ids.length
