events    = require 'events'
Backbone  = require 'backbone'
_         = require 'underscore'
host      = require './host'
Bitmonkey = require './bitmonkey'

module.exports = ctx = new events()

class Tracks extends Backbone.Collection
  model: Bitmonkey.Track

tracks = new Tracks
host.on 'init', ->
  scripting = host.getPreferences()
    .getEnumSetting 'Scripting (affect on reload)'
    , 'Scripting', ['off', 'on'], 'off'
  
  numTracks = parseInt(
    host.getPreferences()
      .getEnumSetting 'Number of Main Tracks'
      , 'Scripting', ['8', '16', '32', '64'], '32'
  )
  numSends = parseInt(
    host.getPreferences()
      .getEnumSetting 'Number of Sends(Effect Tracks)'
      , 'Scripting', ['2', '4', '8', '16'], '4'
  )
  numScenes = parseInt(
    host.getPreferences()
      .getEnumSetting 'Number of Scenes'
      , 'Scripting', ['8', '16', '32', '64'], '16'
  )

  return if scripting isnt 'on'
  ctx.app = host.createApplication()
  ctx.trp = host.createTransport()
  ctx.grv = host.createGroove()
  
  mainTracks = host.createMainTrackBank numTracks, numSends, numScenes
  for index in [0...numTracks]
    ctx["mt#{index + 1}"] = effecTracks.getTrack index
      .attribify 'name', 64, ''
      
  ctx.mst = host.createMasterTrack numScenes
      .attribify 'name', 64, ''
  
  effectTracks = host.createEffectTrackBank numSends, numScenes
  for index in [0...numSends]
    ctx["st#{index + 1}"] = effecTracks.getTrack index
      .attribify 'name', 64, ''
    
  ctx.msg = (s) -> host.showPopupNotification s
  ctx.trk = (id) -> trackBank.getTrack(id - 1)

  ctx.emit 'init'
