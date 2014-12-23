bitwig = require './bitwig'
actions = require './actions'

module.exports =
  init: ->
    ver = String bitwig.getHostVersion()
    if ver isnt actions.version
      throw new Error "Invalid version. host:[#{ver}] actions:[#{actions.version}]"
    @application = bitwig.createApplication()
    
  midi: (s, d1, d2) ->
    if s is 0xB0
      index = (d1 << 7) + d2
      @application.getAction(actions.ids[index].id).invoke() if index < actions.ids.length
        
