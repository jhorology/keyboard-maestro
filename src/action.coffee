actions     = require './bitwig-actions'
host        = require './host'

host.on 'init', ->
  hostVersion = host.getHostVersion()
  if hostVersion isnt actions.version
    throw new Error "Invalid version. host:[#{hostVersion}] actions:[#{actions.version}]"
  application = host.createApplication()
  host.on 'midi', (port, s, d1, d2) ->
    if s is 0xB0
      index = (d1 << 7) + d2
      application.getAction(actions.ids[index].id).invoke() if index < actions.ids.length
