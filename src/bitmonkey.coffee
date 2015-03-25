Backbone = require 'backbone'
_        = require 'underscore'

# map api class to javascript class
classes = {}

# useless properties
propertyExcludes = [
  # java.lang.Object
  'class'
  'equals'
  'getClass'
  'hashCode'
  'notify'
  'notifyAll'
  'toString'
  'wait'
]

stringArrayAttrs = [
  'pageNames'
  'presetNames'
  'presetCategories'
  'presetCreators'
  'slots'
  'directParameterId'
]

#  Bitmonkey Model
# ============================
exports.Model =
class Model extends Backbone.Model
  constructor: (@api, opts) ->
    @_class()
    super null, opts

  # attribify attr,valueObject, valueSpecifire[,opts]
  # attribify attr[,observer params...]
  # attribify attr[,observer params...][, setter]
  attribify: (attr, args...) ->
#   args = Array::slice.call arguments
    if args.length > 0 and _.isObject args[0]
      # observe value object inherited from Value or RangedValue
      vo = args[0]
      opts = args[2] if args.length > 2
      opts or (opts = {})
      @["_#{args[1]}"]  attr, vo, opts
    else
      observer = @api["add#{attr[0].toUpperCase()}#{attr[1..]}Observer"]
      if not observer
        console.error "observer not found. attr:#{attr}"
      setter = undefined
      if args.length > 0 and _.isFunction args[args.length - 1]
        setter = args.pop()
      #
      cb = undefined
      if attr in stringArrayAttrs
        cb = (values...) =>
          # WTF! what a lack of consistency....
          if "#{values[0]}".indexOf("[Ljava.lang.String") is 0
            values = Array::slice.call values[0]
          values = (String s for s in values)
          @set attr, values, observed: on
      else if attr is 'color'
        cb = (r,g,b) => @set attr, {R: r, G: g, B: b}, observed: on
      else
        cb = (value) => @set attr, value, observed: on
      args.push cb
      observer.apply @api, args
      if setter
        @on "change:#{attr}", (model, value, opts) ->
          setter.call model, value, opts unless opts.observed
    @

  _class: ->
    # _wapped is a class variable.
    return if @constructor._wrapped
    console.info "# wrap class:#{@api}" if DEBUG
    for prop of @api
      try
        continue if prop in propertyExcludes
        continue if @constructor::[prop] and prop isnt 'set'
        continue if not _.isFunction @api[prop]
        # confilict with backbone model
        fn = if prop is 'set' then '_set' else prop
        @constructor::[fn] = @_function prop
      catch error
        console.info "  ## unsupported property:#{prop} error:#{error}" if DEBUG
    @constructor._wrapped = true

  _function: (fn) ->
    # return java type of function
    match = /(\S+) \w+\(([^\)]*)\)/.exec "#{@api[fn]}".split('\n',2)[1]
    returnType = match[1]
    paramTypes = match[2].split ','

    # void method
    if returnType is 'void'
      # observer ?
      if match = /add(\w+)(?=Observer)/.exec fn
        # callback function to last paramater
        if paramTypes.length > 0 and paramTypes.indexOf('org.mozilla.javascript.Callable') is 0
          return (params...) ->
            params.unshift params.pop()
            @api[fn].apply @api, params
            @ # returning instance is useful.
        else
          return ->
            @api[fn].apply @api, arguments
            @ # returning instance is useful.
      else
        return ->
          @api[fn].apply @api, arguments
          @ # returning instance is useful.
    # return type of array?
    isArray = returnType.indexOf('[]', returnType.length - 2) isnt -1
    returnType = returnType[..-3] if isArray
    if returnType is 'java.lang.String'
      # java string to javascript string
      if isArray
        return -> String obj for obj in @api[fn].apply @api, arguments
      else
        return -> String @api[fn].apply @api, arguments

    # API class?
    
    if clazz = classes[returnType]
      if isArray
        return -> new clazz api for api in @api[fn].apply @api, arguments
      else
        return -> new clazz @api[fn].apply @api, arguments
    if returnType.indexOf('com.bitwig.') is 0
      console.info "  ## unwrap class:#{returnType} function:#{fn}(#{paramTypes})" if DEBUG
    return -> @api[fn].apply @api, arguments

  _value: (attr, vo, opts) ->
    if opts?.range
      vo.addValueObserver opts.range, (value) =>
        @set attr, value, observed: on
      @on "change:#{attr}", (model, value, opts) ->
        vo.api.set value, opts.resolution unless opts.observed
    else
      vo.addValueObserver (value) =>
        @set attr, value, observed: on
      @on "change:#{attr}", (model, value, opts) ->
        vo.api.set value unless opts.observed
    @

  _rawValue: (attr, vo, opts) ->
    vo.addRawValueObserver (value) =>
      @set attr, value, observed: on
    @on "change:#{attr}", (model, value, opts) ->
      vo.setRaw value unless opts.observed
    @

  _name: (attr, vo, opts) ->
    vo.addNameObserver opts.maxChars, opts.fallback, (value) =>
      @set attr, value, observed: on
    @

  _valueDisplay: (attr, vo, opts) ->
    _.defaults opts,
      maxChars: 12
      fallback: ''
    vo.addValueDisplayObserver opts.maxChars, opts.fallback, (value) =>
      @set attr, value, observed: on

  _beatTime: (attr, vo, opts) ->
    _.defaults opts,
      separator: ' - '
      barsLen: 1
      beatsLen: 1
      subdivisionLen: 1
      ticksLen: 0
    vo.addTimeObserver opts.separator, opts.barLen, opts.beatsLen, opts.subdivisionLen, opts.ticksLen, (value) =>
      @set attr, value, observed: true
    @

#  Host
# ============================
exports.Host = class Host extends Model

  prepare: (@def) ->
    @defineController @def.vender, @def.name
    , @def.version, @def.uuid, @def.author
    @numInPorts = 1
    @numOutPorts = 0
    defineMidi = (pairs) =>
      for pair in pairs
        @numInPorts = pair.in.length if @numInPorts < pair.in.length
        @numOutPorts = pair.out.length if @numOutPorts < pair.out.length
      @defineMidiPorts @numInPorts, @numOutPorts
      for pair in pairs
        @addDeviceNameBasedDiscoveryPair pair.in, pair.out

    defineMidi @def.midi.mac if @platformIsMac()
    defineMidi @def.midi.windows if @platformIsWindows()
    defineMidi @def.midi.linux if @platformIsLinux()

    process.on 'init', =>
      for key, value of @def.notification
        host.getNotificationSettings()["setShouldShow#{key[0].toUpperCase()}#{key[1..]}Notifications"] value

      for index in [0...@numInPorts]
        port = @getMidiInPort(index)
        port.setMidiCallback (s, d1, d2) =>
          @trigger 'midi', port, s, d1, d2
        port.setSysexCallback (d) =>
          @trigger 'sysex', port, d
      @trigger 'init'
    @

#  Action
# ============================
exports.Action =
classes['com.bitwig.base.control_surface.iface.Action'] =
class Action extends Model

#  Action
# ============================
exports.ActionCategory =
classes['com.bitwig.base.control_surface.iface.ActionCategory'] =
class ActionCategory extends Model

#  Application
# ============================
exports.Application =
classes['com.bitwig.base.control_surface.iface.Application'] =
class Application extends Model

#  Arranger
# ============================
exports.Arranger =
classes['com.bitwig.base.control_surface.iface.Arranger'] =
class Arranger extends Model

#  AutomatableRangedValue
# ============================
exports.AutomatableRangedValue =
classes['com.bitwig.base.control_surface.iface.AutomatableRangedValue'] =
class AutomatableRangedValue extends Model

#  BeatTime
# ============================
exports.BeatTime =
classes['com.bitwig.base.control_surface.iface.BeatTime'] =
class BeatTime extends Model

#  BooleanValue
# ============================
exports.BooleanValue =
classes['com.bitwig.base.control_surface.iface.BooleanValue'] =
classes['com.bitwig.flt.control_surface.intention.values.BoolIntention'] =
class BooleanValue extends Model

#  Channel
# ============================
exports.Channel =
classes['com.bitwig.base.control_surface.iface.Channel'] =
class Channel extends Model

#  Clip
# ============================
exports.Clip =
classes['com.bitwig.base.control_surface.iface.Clip'] =
classes['com.bitwig.flt.control_surface.intention.sections.CursorClipSection'] =
class Clip extends Model

#  ClipLauncherScenesOrSlots
# ============================
exports.ClipLauncherScenesOrSlots =
classes['com.bitwig.base.control_surface.iface.ClipLauncherScenesOrSlots'] =
classes['com.bitwig.flt.control_surface.intention.sections.ClipLauncherScenesOrSlotsSection'] =
class ClipLauncherScenesOrSlots extends Model

#  ClipLauncherSlots
# ============================
exports.ClipLauncherSlots =
classes['com.bitwig.base.control_surface.iface.ClipLauncherSlots'] =
classes['com.bitwig.flt.control_surface.intention.sections.ClipLauncherSlotsSection'] =
class ClipLauncherSlots extends Model

#  DirectParameter
# ============================
exports.DirectParameter =
class DirectParameter extends Backbone.Model

#  DirectParameter
# ============================
exports.DirectParameterCollection =
class DirectParameterCollection extends Backbone.Collection
  model: DirectParameter

#  Device
# ============================
exports.Device =
classes['com.bitwig.base.control_surface.iface.Device'] =
class Device extends Model
  useDirectParameter: (opts) ->
    opts or (opts = {})
    _.defaults opts,
      maxNameChars: 64
      maxValueDisplayChars: 32
    @addDirectParameterIdObserver (ids) =>
      params = new DirectParameterCollection
      params.add id: String(id) for id in ids
      @set 'directParameters', params
    @addDirectParameterNameObserver opts.maxNameChars, (id, name) =>
      @get 'directParameters'
        .add {id: id, name: name}, {merge: on}
    @addDirectParameterNormalizedValueObserver (id, value) =>
      @get 'directParameters'
        .add {id: id, normalizedValue: value}, {merge: on}
    @_observer =
      @addDirectParameterValueDisplayObserver opts.maxValueDisplayChars, (id, value) =>
        @get 'directParameters'
          .add {id: id, valueDisplay: value}, {merge: on}
    @

  observeDirectParameters: (params) ->
    @_observer.setObservedParameterIds params?.pluck('id')

      
#  CursorDevice
# ============================
exports.CursorDevice =
classes['com.bitwig.base.control_surface.iface.CursorDevice'] =
class CursorDevice extends Device

#  CursorDeviceLayer
# ============================
exports.CursorDeviceLayer =
classes['com.bitwig.base.control_surface.iface.CursorDeviceLayer'] =
class CursorDeviceLayer extends Model

#  CursorDeviceSlot
# ============================
exports.CursorDeviceSlot =
classes['com.bitwig.base.control_surface.iface.CursorDeviceSlot'] =
class CursorDeviceLayer extends Model

#  Track
# ============================
exports.Track =
classes['com.bitwig.base.control_surface.iface.Track'] =
class Track extends Model

  #  CursorTrack
# ============================
exports.CursorTrack =
classes['com.bitwig.base.control_surface.iface.CursorTrack'] =
classes['com.bitwig.flt.control_surface.intention.sections.CursorTrackSection'] =
class CursorTrack extends Track

#  DeviceBank
# ============================
exports.DeviceBank =
classes['com.bitwig.base.control_surface.iface.DeviceBank'] =
class DeviceBank extends Model

#  DeviceChain
# ============================
exports.DeviceChain =
classes['com.bitwig.base.control_surface.iface.DeviceChain'] =
class DeviceChain extends Model

#  DeviceSlot
# ============================
exports.DeviceSlot =
classes['com.bitwig.base.control_surface.iface.DeviceSlot'] =
class DeviceSlot extends Model

#  DeviceLayerBank
# ============================
exports.DeviceLayerBank =
classes['com.bitwig.base.control_surface.iface.DeviceLayerBank'] =
class DeviceLayerBank extends Model

#  DirectParameterValueDisplayObserver
# ============================
exports.DirectParameterValueDisplayObserver =
classes['com.bitwig.base.control_surface.iface.DirectParameterValueDisplayObserver'] =
class DirectParameterValueDisplayObserver extends Model

#  DocumentState
# ============================
exports.DocumentState =
classes['com.bitwig.base.control_surface.iface.DocumentState'] =
class DocumentState extends Model

#  DrumPadBank
# ============================
exports.DrumPadBank =
classes['com.bitwig.base.control_surface.iface.DrumPadBank'] =
class DrumPadBank extends Model

#  EnumValue
# ============================
exports.EnumValue =
classes['com.bitwig.base.control_surface.iface.EnumValue'] =
class EnumValue extends Model

#  Groove
# ============================
exports.Groove =
classes['com.bitwig.base.control_surface.iface.Groove'] =
class Groove extends Model

#  IntegerValue
# ============================
exports.IntegerValue =
classes['com.bitwig.base.control_surface.iface.IntegerValue'] =
class IntegerValue extends Model

#  Macro
# ============================
exports.Macro =
classes['com.bitwig.base.control_surface.iface.Macro'] =
class Macro extends Model

#  MasterTrack
# ============================
exports.MasterTrack =
classes['com.bitwig.flt.control_surface.intention.sections.MasterTrackSection'] =
class MasterTrack extends Track

#  MidiIn
# ============================
exports.MidiIn =
classes['com.bitwig.base.control_surface.iface.MidiIn'] =
class MidiIn extends Model

#  MidiOut
# ============================
exports.MidiOut =
classes['com.bitwig.base.control_surface.iface.MidiOut'] =
class MidiOut extends Model

#  Mixer
# ============================
exports.Mixer =
classes['com.bitwig.base.control_surface.iface.Mixer'] =
class Mixer extends Model

#  ModulationSource
# ============================
exports.ModulationSource =
classes['com.bitwig.base.control_surface.iface.ModulationSource'] =
class ModulationSource extends Model

#  NoteInput
# ============================
exports.NoteInput =
classes['com.bitwig.base.control_surface.iface.NoteInput'] =
class NoteInput extends Model

#  NotificationSettings
# ============================
exports.NotificationSettings =
classes['com.bitwig.base.control_surface.iface.NotificationSettings'] =
classes['com.bitwig.flt.control_surface.intention.sections.NotificationSettingsIntention'] =
class NotificationSettings extends Model

#  Preferences
# ============================
exports.Preferences =
classes['com.bitwig.base.control_surface.iface.Preferences'] =
class Preferences extends Model

#  Project
# ============================
exports.Project =
classes['com.bitwig.base.control_surface.iface.Project'] =
class Project extends Model

#  RangedValue
# ============================
exports.RangedValue =
classes['com.bitwig.base.control_surface.iface.RangedValue'] =
class RangedValue extends Model

#  RemoteSocket
# ============================
exports.RemoteSocket =
classes['com.bitwig.base.control_surface.iface.RemoteSocket'] =
class RemoteSocket extends Model
  initialize: ->

#  SceneBank
# ============================
exports.SceneBank =
classes['com.bitwig.base.control_surface.iface.SceneBank'] =
class SceneBank extends Model

#  SoloValue
# ============================
exports.SoloValue =
classes['com.bitwig.base.control_surface.iface.SoloValue'] =
classes['com.bitwig.flt.control_surface.intention.values.SoloIntention'] =
class SoloValue extends Model

#  SourceSelector
# ============================
exports.SourceSelector =
classes['com.bitwig.base.control_surface.iface.SourceSelector'] =
class SourceSelector extends Model

#  StringValue
# ============================
exports.StringValue =
classes['com.bitwig.base.control_surface.iface.StringValue'] =
class StringValue extends Model

#  TimeSignatureValue
# ============================
exports.TimeSignatureValue =
classes['com.bitwig.base.control_surface.iface.TimeSignatureValue'] =
class TimeSignatureValue extends Model


#  Track
# ============================
exports.TrackBank =
classes['com.bitwig.base.control_surface.iface.TrackBank'] =
classes['com.bitwig.flt.control_surface.intention.sections.AbstractTrackBankSection'] =
class TrackBank extends Model

#  Transport
# ============================
exports.Transport =
classes['com.bitwig.base.control_surface.iface.Transport'] =
class Transport extends Model

  incTempo: (delta, slow) ->
    @increaseTempo delta, if slow then 64700 else 647
    @

  incTempoSlow: (delta) ->
    @incTempo delta, on
    @

  incTempoFast: (delta) ->
    @incTempo delta, off
    @

#  UserControlBank
# ============================
exports.UserControlBank =
classes['com.bitwig.base.control_surface.iface.UserControlBank'] =
classes['com.bitwig.flt.control_surface.intention.sections.UserControlSection'] =
class UserControlBank extends Model

#  Value
# ============================
exports.Value =
classes['com.bitwig.base.control_surface.iface.Value'] =
class Value extends Model
