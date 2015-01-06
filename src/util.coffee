bitwig = require './bitwigify'
uuid   = require 'uuid'

application = undefined
bitwig
  .on 'init', ->
    application = bitwig.createApplication()

  .on 'midi', (port, s, d1, d2) ->
    # CC ch 16 for utility
    if s is 0xBF and d1 < handlers.length
      handlers[d1].call null, d2

handlers = [
  # 0 list all actions as JSON
  -> printActions()
]

printActions = ->
  console.info JSON.stringify
    hostVersion: bitwig.getHostVersion()
    hostApiVersion: Number bitwig.getHostApiVersion()
    actions: (
      for action, i in application.getActions()
        id = String action.getId()
        id: id
        uuid: createOrReuseUuid require('./bitwig-actions').ids, id
        category: String action.getCategory().getId()
        on:
          ch: 1
          cc: i >> 7
          value: i & 0x7f
    ).concat(
      for action, j in (require('./extended').actions)
        id: action.id
        uuid: createOrReuseUuid require('./extended-actions').ids, action.id
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
