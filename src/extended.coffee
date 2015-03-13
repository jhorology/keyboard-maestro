host = require './host'

track =
device =
macroValues =
macroSources =
macroIndicated =
parameterValues =
parameterIndicated = undefined
NUM_SENDS = 4

process.on 'init', ->
  host.getNotificationSettings()
    .setShouldShowSelectionNotifications true
    .setShouldShowChannelSelectionNotifications true
    .setShouldShowTrackSelectionNotifications true
    .setShouldShowDeviceSelectionNotifications true
    .setShouldShowDeviceLayerSelectionNotifications true
    .setShouldShowPresetNotifications true
    .setShouldShowMappingNotifications true
    .setShouldShowValueNotifications true

  track = host.createArrangerCursorTrack NUM_SENDS, 0
  device = host.createEditorCursorDevice NUM_SENDS
  track.attribify 'isSelectedInMixer'
  device.attribify 'hasSelectedDevice'
  device.attribify 'isMacroSectionVisible', device.isMacroSectionVisible(), 'value'
  device.attribify 'isParameterPageSectionVisible', device.isParameterPageSectionVisible(), 'value'

  macroValues = for index in [0..7]
    device.getMacro(index).getAmount()
  macroSources = for index in [0..7]
    device.getMacro(index).getModulationSource()
  macroIndicated = false
  parameterValues = for index in [0..7]
    device.getParameter index
      .attribify 'name', 32, ''
      .attribify 'valueDisplay', 32, ''
  parameterIndicated = false

  host.on 'midi', (port, s, d1, d2) ->
    # ch.2 for extended action
    if s is 0xB1 and track.get('isSelectedInMixer')
      index = (d1 << 7) + d2
      return if actions[index].id.indexOf('cursor track') is 0 and not track.get('isSelectedInMixer')
      return if actions[index].id.indexOf('cursor device') is 0 and not device.get('hasSelectedDevice')
      actions[index].fn.call null if index < actions.length

deviceValue = (i, delta) ->
  if macroIndicated
    macroValues[i].inc delta, 101
  else if  parameterIndicated
    parameterValues[i].inc delta, 101
      # workarround for VST parameter dosen't display correctly.
      .once 'change:valueDisplay', (o, value) ->
        host.showPopupNotification "#{o.get('name')}: #{value}"
      
exports.actions = actions = [
  ## cursor track
  {
    id: 'cursor track - activated - toggle'
    fn: -> track.isActivated()?.toggle()
  }
  {
    id: 'cursor track - volume - up'
    fn: -> track.getVolume()?.inc 1, 101
  }
  {
    id: 'cursor track - volume - down'
    fn: -> track.getVolume()?.inc -1, 101
  }
  {
    id: 'cursor track - volume - reset'
    fn: -> track.getVolume()?.reset()
  }
  {
    id: 'cursor track - pan - right'
    fn: -> track.getPan()?.inc 1, 201
  }
  {
    id: 'cursor track - pan - left'
    fn: -> track.getPan()?.inc -1, 201
  }
  {
    id: 'cursor track - pan - reset'
    fn: -> track.getPan()?.reset()
  }
  {
    id: 'cursor track - mute - toggle'
    fn: -> track.getMute()?.toggle()
  }
  {
    id: 'cursor track - solo - toggle'
    fn: -> track.getSolo()?.toggle()
  }
  {
    id: 'cursor track - send S1 - up'
    fn: -> track.getSend(0)?.inc 1, 101
  }
  {
    id: 'cursor track - send S1 - down'
    fn: -> track.getSend(0)?.inc -1, 101
  }
  {
    id: 'cursor track - send S1 - reset'
    fn: -> track.getSend(0)?.reset()
  }
  {
    id: 'cursor track - send S2 - up'
    fn: -> track.getSend(1)?.inc 1, 101
  }
  {
    id: 'cursor track - send S2 - down'
    fn: -> track.getSend(1)?.inc -1, 101
  }
  {
    id: 'cursor track - send S2 - reset'
    fn: -> track.getSend(1)?.reset()
  }
  {
    id: 'cursor track - send S3 - up'
    fn: -> track.getSend(2)?.inc 1, 101
  }
  {
    id: 'cursor track - send S3 - down'
    fn: -> track.getSend(2)?.inc -1, 101
  }
  {
    id: 'cursor track - send S3 - reset'
    fn: -> track.getSend(2)?.reset()
  }
  {
    id: 'cursor track - send S4 - up'
    fn: -> track.getSend(3)?.inc 1, 101
  }
  {
    id: 'cursor track - send S4 - down'
    fn: -> track.getSend(3)?.inc -1, 101
  }
  {
    id: 'cursor track - send S4 - reset'
    fn: -> track.getSend(3)?.reset()
  }
  {
    id: 'cursor track - arm - toggle'
    fn: -> track.getArm()?.toggle()
  }
  {
    id: 'cursor track - monitor - toggle'
    fn: -> track.getMonitor()?.toggle()
  }
  {
    id: 'cursor track - auto monitor - toggle'
    fn: -> track.getAutoMonitor()?.toggle()
  }
  {
    id: 'cursor track - crossfade - mode A'
    fn: -> track.getCrossFadeMode()?.set 'A'
  }
  {
    id: 'cursor track - crossfade - mode B'
    fn: -> track.getCrossFadeMode()?.set 'B'
  }
  {
    id: 'cursor track - crossfade - mode AB'
    fn: -> track.getCrossFadeMode()?.set 'AB'
  }
  {
    id: 'cursor track - clip launcher - stop'
    fn: -> track.stop()
  }
  {
    id: 'cursor track - clip laucner - return to arrangement'
    fn: -> track.returnToArrangement()
  }
  {
    id: 'cursor device - enable state - toggle'
    fn: -> device.toggleEnabledState()
  }
  {
    id: 'cursor device - window - toggle'
    fn: -> device.isWindowOpen().toggle()
  }
  {
    id: 'cursor device - expanded - toggle'
    fn: -> device.isExpanded().toggle()
  }
  {
    id: 'cursor device - macro section - toggle'
    fn: -> device.isMacroSectionVisible().toggle()
  }
  {
    id: 'cursor device - paramater page section - toggle'
    fn: -> device.isParameterPageSectionVisible().toggle()
  }
  {
    id: 'cursor device - paramater page - prev'
    fn: -> device.previousParameterPage()
  }
  {
    id: 'cursor device - paramater page - next'
    fn: -> device.nextParameterPage()
  }
  {
    id: 'cursor device - preset - prev'
    fn: ->
      device.switchToPreviousPreset()
  }
  {
    id: 'cursor device - preset - next'
    fn: ->
      device.switchToNextPreset()
  }
  {
    id: 'cursor device - preset category - prev'
    fn: ->
      device.switchToPreviousPresetCategory()
  }
  {
    id: 'cursor device - preset category - next'
    fn: ->
      device.switchToNextPresetCategory()
  }
  {
    id: 'cursor device - preset creator - prev'
    fn: ->
      device.switchToPreviousPresetCreator()
  }
  {
    id: 'cursor device - preset creator - next'
    fn: ->
      device.switchToNextPresetCreator()
  }
  {
    id: 'cursor device - macro/param indication - toggle'
    fn: ->
      macroIndicated = not macroIndicated
      parameterIndicated = not macroIndicated
      device.set 'isMacroSectionVisible', macroIndicated
      macro.setIndication macroIndicated for macro in macroValues
      device.set 'isParameterPageSectionVisible', parameterIndicated
      param.setIndication parameterIndicated for param in parameterValues
  }
  {
    id: 'cursor device - macro/param 1 - up'
    fn: -> deviceValue 0, 1
  }
  {
    id: 'cursor device - macro/param 1 - down'
    fn: -> deviceValue 0, -1
  }
  {
    id: 'cursor device - macro/param 2 - up'
    fn: -> deviceValue 1, 1
  }
  {
    id: 'cursor device - macro/param 2 - down'
    fn: -> deviceValue 1, -1
  }
  {
    id: 'cursor device - macro/param 3 - up'
    fn: -> deviceValue 2, 1
  }
  {
    id: 'cursor device - macro/param 3 - down'
    fn: -> deviceValue 2, -1
  }
  {
    id: 'cursor device - macro/param 4 - up'
    fn: -> deviceValue 3, 1
  }
  {
    id: 'cursor device - macro/param 4 - down'
    fn: -> deviceValue 3, -1
  }
  {
    id: 'cursor device - macro/param 5 - up'
    fn: -> deviceValue 4, 1
  }
  {
    id: 'cursor device - macro/param 5 - down'
    fn: -> deviceValue 4, -1
  }
  {
    id: 'cursor device - macro/param 6 - up'
    fn: -> deviceValue 5, 1
  }
  {
    id: 'cursor device - macro/param 6 - down'
    fn: -> deviceValue 5, -1
  }
  {
    id: 'cursor device - macro/param 7 - up'
    fn: -> deviceValue 6, 1
  }
  {
    id: 'cursor device - macro/param 7 - down'
    fn: -> deviceValue 6, -1
  }
  {
    id: 'cursor device - macro/param 8 - up'
    fn: -> deviceValue 7, 1
  }
  {
    id: 'cursor device - macro/param 8 - down'
    fn: -> deviceValue 7, -1
  }
  {
    id: 'cursor device - macro 1 mapping - toggle'
    fn: -> macroSources[0].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 2 mapping - toggle'
    fn: -> macroSources[1].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 3 mapping - toggle'
    fn: -> macroSources[2].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 4 mapping - toggle'
    fn: -> macroSources[3].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 5 mapping - toggle'
    fn: -> macroSources[4].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 6 mapping - toggle'
    fn: -> macroSources[5].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 7 mapping - toggle'
    fn: -> macroSources[6].toggleIsMapping()
  }
  {
    id: 'cursor device - macro 8 mapping - toggle'
    fn: -> macroSources[7].toggleIsMapping()
  }
]
