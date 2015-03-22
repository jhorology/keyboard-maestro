uuid            = require 'uuid'
host            = require './host'
bitwigActions   = require './bitwig-actions'
extendedActions = require './extended-actions'
extendedModule  = require './extended'
application = undefined

host.on 'init', ->
  application = host.createApplication()
  host.on 'midi', (port, s, d1, d2) ->
    # CC ch 16 for utility
    if s is 0xBF and d1 < handlers.length
      handlers[d1].call null, d2

handlers = [
  # 0 list all actions as JSON
  -> printActions()
]

printActions = ->
  console.info JSON.stringify
    hostVersion: host.getHostVersion()
    hostApiVersion: host.getHostApiVersion()
    actions: (
      for action, i in application.getActions()
        id: action.getId()
        uuid: createOrReuseUuid bitwigActions.ids, action.getId()
        category: action.getCategory().getId()
        on:
          ch: 1
          cc: i >> 7
          value: i & 0x7f
    ).concat(
      for action, j in extendedModule.actions
        id: action.id
        uuid: createOrReuseUuid extendedActions.ids, action.id
        category: 'extended'
        on:
          ch: 2
          cc: j >> 7
          value: j & 0x7f
    )
  console.info '''

copy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html

'''
  console.info "total #{i} + #{j} actions."

createOrReuseUuid = (ids, id) ->
  for action in ids
    if action.id is id
      return action.uuid
  uuid.v4().toUpperCase()
