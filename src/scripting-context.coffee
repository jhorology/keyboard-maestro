host = require './host'
events = require 'events'
module.exports = ctx = new events()

NUM_TRACKS = 64
NUM_SENDS = 8
NUM_SCENES = 32

trackBank = undefined
host.on 'init', ->
  scripting = host.getPreferences()
    .getEnumSetting 'Scripting(affect on next restart)'
    , 'Scripting', ['off', 'on'], 'off'
  return if scripting isnt 'on'
  ctx.app = host.createApplication()
  ctx.trp = host.createTransport()
  ctx.grv = host.createGroove()
  trackBank = host.createMainTrackBank NUM_TRACKS, NUM_SENDS, NUM_SCENES
  ctx.mst = host.createMasterTrack NUM_SCENES
  tracks = host.createEffectTrackBank NUM_SENDS, NUM_SCENES
  ctx.st1 = tracks.getTrack(0)
  ctx.st2 = tracks.getTrack(1)
  ctx.st3 = tracks.getTrack(2)
  ctx.st4 = tracks.getTrack(3)
  ctx.st5 = tracks.getTrack(4)
  ctx.st6 = tracks.getTrack(5)
  ctx.st7 = tracks.getTrack(6)
  ctx.st8 = tracks.getTrack(7)
  ctx.msg = (s) -> host.showPopupNotification s
  ctx.trk = (id) -> trackBank.getTrack(id - 1)
  ctx.emit 'init'
