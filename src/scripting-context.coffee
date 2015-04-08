events    = require 'events'
Backbone  = require 'backbone'
_         = require 'underscore'
host      = require './host'
Bitmonkey = require './bitmonkey'

module.exports = ctx = new events()

class Tracks extends Backbone.Collection
  model: Bitmonkey.Track
  
ctx.PREF_CATEGORY = PREF_CATEGORY = 'Scripting (affect on reload)'

scripting = 'on'
numTracks = 32
numSends = 4
numScenes = 16
noteInput = undefined

host.on 'init', ->
  # how could get preference value in init()?
  # -----------------------------------
  # pref = host.getPreferences()
  # pref.getEnumSetting 'Scripting'
  # , PREF_CATEGORY, ['off', 'on'], 'off'
  #   .attribify 'value'
  #   .once 'change:value', (model, value) ->
  #     scripting = value

  # pref.getEnumSetting 'Number of Main Tracks'
  #   , PREF_CATEGORY, ['8', '16', '32', '64'], '32'
  #     .attribify 'value'
  #     .once 'change:value', (model, value) ->
  #       numTracks = parseInt(value)

  # pref.getEnumSetting 'Number of Sends(Effect Tracks)'
  #   , PREF_CATEGORY, ['2', '4', '8', '16'], '4'
  #     .attribify 'value'
  #     .once 'change:value', (model, value) ->
  #       numSends = parseInt(value)
  # pref.getEnumSetting 'Number of Scenes'
  #   , PREF_CATEGORY, ['8', '16', '32', '64'], '16'
  #     .attribify 'value'
  #     .once 'change:value', (model, value) ->
  #       numScenes = parseInt(value)
  #       console.info "scripting context scripting:#{scripting}"
  #       console.info "scripting context numScenes:#{numTracks}"
  #       console.info "scripting context numScenes:#{numSends}"
  #       console.info "scripting context numScenes:#{numScenes}"
  #       do initialize if scripting is 'on'
  #     , @

  ctx.numTracks = numTracks
  ctx.numSends = numSends
  ctx.numTracks = numScenes
  
  ctx.app = host.createApplication()
  ctx.trp = host.createTransport()
  ctx.grv = host.createGroove()
  ctx.cdv = host.createEditorCursorDevice numSends
  
  ctx.trs = new Tracks
  mainTrackBank = host.createMainTrackBank numTracks, numSends, numScenes
  ctx.trs.add(
    for index in [0...numTracks]
      ctx["mt#{index + 1}"] = mainTrackBank.getTrack index
        .set
          id: index + 1
          category: 'Main'
  )
  ctx.mst = host.createMasterTrack numScenes
    .set
      id: 'Master'
      category: 'Master'

  ctx.trs.add ctx.mst
  
  effectTrackBank = host.createEffectTrackBank numSends, numScenes
  ctx.trs.add(
    for index in [0...numSends]
      ctx["st#{index + 1}"] = effectTrackBank.getTrack index
        .set
          id: "S#{index + 1}"
          category: 'Effect'
  )
  ctx.msg = (s) -> host.showPopupNotification s
  # scripting channel 10ch only
  noteInput = host.getMidiInPort(0).createNoteInput 'Scripting','?9????'
  ctx.midi = (s, d1, d2) ->
    noteInput.sendRawMidiEvent s, d1, d2
  ctx.emit 'init'
