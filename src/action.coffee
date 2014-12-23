bitwig = require './bitwig'
actions = require './actions'

module.exports =
  init: ->
    ver = String bitwig.getHostVersion()
    if ver isnt actions.version
      throw new Error "Invalid version. host:[#{ver}] actions:[#{actions.version}]"
    @application = bitwig.createApplication()
    @ids = (id for id of actions.ids)
    
  midi: (s, d1, d2) ->
    if s is 0xB0
      index = (d1 << 7) + d2
      @application.getAction(@ids[index]).invoke() if index < @ids.length
