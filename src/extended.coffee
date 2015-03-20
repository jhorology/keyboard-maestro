host = require './host'

track =
device =
deviceSlot =
deviceLayer =
drumPadBank =
macroValues =
macroSources =
modSources =
macroIndicated =
parameterValues =
parameterIndicated = undefined
NUM_SENDS = 4
RESOLUTIONS = [
  11
  16
  32
  51
  64
  101
  128
  201
  256
  1001
  1024
]
resolutionIndex = 5
resolution = 101

process.on 'init', ->
  track = host.createArrangerCursorTrack NUM_SENDS, 0
    .attribify 'isSelectedInMixer'
    .attribify 'position'
  
  device = host.createEditorCursorDevice NUM_SENDS
  device
    .attribify 'hasSelectedDevice'
    .attribify 'isMacroSectionVisible'
    , device.isMacroSectionVisible(), 'value'
    .attribify 'isParameterPageSectionVisible'
    , device.isParameterPageSectionVisible(), 'value'
    .attribify 'isNested', device.isNested(), 'value'
    .attribify 'slots'
    .attribify 'pageNames'
    .attribify 'selectedPage', -1
    .attribify 'presetCategories'
    .attribify 'presetCategory', 128, ''
    .attribify 'presetCreators'
    .attribify 'presetCreator', 128, ''
    .attribify 'hasLayers', device.hasLayers(), 'value'
    .attribify 'hasDrumPads', device.hasDrumPads(), 'value'
    
  deviceSlot = device.getCursorSlot()
    .attribify 'name', 32, ''
    .attribify 'isSelectedInEditor'
    
  deviceLayer = device.createCursorLayer()
  deviceLayer
    .attribify 'name', 32, ''
    .attribify 'isSelectedInEditor'
    .attribify 'isSelectedInMixer'

  drumPadBank = device.createDrumPadBank 16
    
  macroValues = for index in [0..7]
    device.getMacro(index).getAmount()
  macroSources = for index in [0..7]
    device.getMacro(index).getModulationSource()
  modSources = for index in [0..7]
    device.getModulationSource(index)
  macroIndicated = false
  parameterValues = for index in [0..7]
    device.getParameter index
      .attribify 'name', 32, ''
      .attribify 'valueDisplay', 32, ''
  parameterIndicated = false

  host.on 'midi', (port, s, d1, d2) ->
    # ch.2 for extended action
    return if s isnt 0xB1
    index = (d1 << 7) + d2
    if actions[index].id.lastIndexOf('cursor track', 0) is 0
      return if not track.get 'isSelectedInMixer'
    else if actions[index].id.lastIndexOf('cursor device', 0) is 0
      return if not device.get 'hasSelectedDevice'
    actions[index].fn.call null if index < actions.length

deviceValue = (i, delta) ->
  if macroIndicated
    macroValues[i].inc delta, resolution
  else if  parameterIndicated
    parameterValues[i].inc delta, resolution
      # workarround for VST parameter dosen't display correctly.
      .once 'change:valueDisplay', (o, value) ->
        host.showPopupNotification "#{o.get 'name'}: #{value}"
      
exports.actions = actions = [
  ## cursor track
  {
    id: 'cursor track - activated - toggle'
    fn: -> track.isActivated()?.toggle()
  }
  {
    id: 'cursor track - volume - up'
    fn: -> track.getVolume()?.inc 1, resolution
  }
  {
    id: 'cursor track - volume - down'
    fn: -> track.getVolume()?.inc -1, resolution
  }
  {
    id: 'cursor track - volume - reset'
    fn: -> track.getVolume()?.reset()
  }
  {
    id: 'cursor track - pan - right'
    fn: -> track.getPan()?.inc 1, resolution * 2 - 1
  }
  {
    id: 'cursor track - pan - left'
    fn: -> track.getPan()?.inc -1, resolution * 2 - 1
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
    fn: -> track.getSend(0)?.inc 1, resolution
  }
  {
    id: 'cursor track - send S1 - down'
    fn: -> track.getSend(0)?.inc -1, resolution
  }
  {
    id: 'cursor track - send S1 - reset'
    fn: -> track.getSend(0)?.reset()
  }
  {
    id: 'cursor track - send S2 - up'
    fn: -> track.getSend(1)?.inc 1, resolution
  }
  {
    id: 'cursor track - send S2 - down'
    fn: -> track.getSend(1)?.inc -1, resolution
  }
  {
    id: 'cursor track - send S2 - reset'
    fn: -> track.getSend(1)?.reset()
  }
  {
    id: 'cursor track - send S3 - up'
    fn: -> track.getSend(2)?.inc 1, resolution
  }
  {
    id: 'cursor track - send S3 - down'
    fn: -> track.getSend(2)?.inc -1, resolution
  }
  {
    id: 'cursor track - send S3 - reset'
    fn: -> track.getSend(2)?.reset()
  }
  {
    id: 'cursor track - send S4 - up'
    fn: -> track.getSend(3)?.inc 1, resolution
  }
  {
    id: 'cursor track - send S4 - down'
    fn: -> track.getSend(3)?.inc -1, resolution
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
    fn: ->
      page = device.get 'selectedPage'
      names = device.get 'pageNames'
      if names.length > 0 and page is 0
        device.setParameterPage names.length - 1
      else
        device.previousParameterPage()
  }
  {
    id: 'cursor device - paramater page - next'
    fn: ->
      page = device.get 'selectedPage'
      names = device.get 'pageNames'
      if names.length > 0 and page is names.length - 1
        device.setParameterPage 0
      else
        device.nextParameterPage()
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
      name = device.get 'presetCategory'
      names = device.get 'presetCategories'
      if names.length > 0
        if name is names[0]
          device.setPresetCategory names.length - 1
            # workaround for doesn't display correctly
            .once 'change:presetCategory', (d, name) ->
              host.showPopupNotification "Preset Category: #{name}"
        else
          device.switchToPreviousPresetCategory()
          # workaround for doesn't display correctly
          if name is names[names.length - 1]
            device.once 'change:presetCategory', (d, name) ->
              host.showPopupNotification "Preset Category: #{name}"
  }
  {
    id: 'cursor device - preset category - next'
    fn: ->
      name = device.get 'presetCategory'
      names = device.get 'presetCategories'
      if names.length > 0
        if name is names[names.length - 1]
          device.setPresetCategory 0
            # workaround for doesn't display correctly
            .once 'change:presetCategory', (d, name) ->
              host.showPopupNotification "Preset Category: #{name}"
        else
          device.switchToNextPresetCategory()
  }
  {
    id: 'cursor device - preset creator - prev'
    fn: ->
      name = device.get 'presetCreator'
      names = device.get 'presetCreators'
      if names.length > 0
        if name is names[0]
          device.setPresetCreator names.length - 1
            # workaround for doesn't display correctly
            .once 'change:presetCreator', (d, name) ->
              host.showPopupNotification "Preset Creator: #{name}"
        else
          device.switchToPreviousPresetCreator()
          # workaround for doesn't display correctly
          if name is names[names.length - 1]
            device.once 'change:presetCreator', (d, name) ->
              host.showPopupNotification "Preset Creator: #{name}"
  }
  {
    id: 'cursor device - preset creator - next'
    fn: ->
      name = device.get 'presetCreator'
      names = device.get 'presetCreators'
      if names.length > 0
        if name is names[names.length - 1]
          device.setPresetCreator 0
            # workaround for doesn't display correctly
            .once 'change:presetCreator', (d, name) ->
              host.showPopupNotification "Preset Creator: #{name}"
        else
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
  {
    id: 'cursor device - macro 1 mapping - toggle'
    fn: -> macroSources[0].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 1 mapping - toggle'
    fn: -> modSources[0].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 2 mapping - toggle'
    fn: -> modSources[1].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 3 mapping - toggle'
    fn: -> modSources[2].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 4 mapping - toggle'
    fn: -> modSources[3].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 5 mapping - toggle'
    fn: -> modSources[4].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 6 mapping - toggle'
    fn: -> modSources[5].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 7 mapping - toggle'
    fn: -> modSources[6].toggleIsMapping()
  }
  {
    id: 'cursor device - MOD 8 mapping - toggle'
    fn: -> modSources[7].toggleIsMapping()
  }
  
  ## cursor device - chain slot
  {
    id: 'cursor device - chain slot - open/next/close'
    fn: ->
      slots = device.get 'slots'
      return if slots.length is 0
      slot = deviceSlot.get 'name'
      if slot is ''
        # open chain slot
        deviceSlot.selectSlot slots[0]
      else if slot is slots[slots.length - 1]
        # close chain slot
        
        # unaveilable to close/unselect slot
        # index = slots.indexOf(slot)
        # deviceSlot.selectSlot slots[index]
        
        deviceSlot.selectSlot slots[0]
      else
        # select next chain slot
        index = slots.indexOf(slot) + 1
        deviceSlot.selectSlot slots[index]
  }
  {
    id: 'cursor device - chain slot - select first device in slot'
    fn: ->
      slot = deviceSlot.get 'name'
      if slot is ''
        device.selectNext()
      else
        device.selectFirstInSlot slot
  }
  {
    id: 'experimental - cursor device - layer - select first layer'
    fn: ->
      # doesen't sync with UI
      if device.get 'hasLayers'
        device.selectFirstInLayer 0
      else
        device.selectNext()
  }
  {
    id: 'cursor device - chain/layer - select parent device'
    fn: ->
      if device.get 'isNested'
        device.selectParent()
      else
        device.selectPrevious()
  }
  {
    id: 'experimental - cursor device - Drum Pads - page dowm'
    fn: ->
      # doesen't sync with UI
      if device.get 'hasDrumPads'
        drumPadBank.scrollChannelsPageDown()
  }
  {
    id: 'experimental - cursor device - Drum Pads - page up'
    fn: ->
      # doesen't sync with UI
      if device.get 'hasDrumPads'
        drumPadBank.scrollChannelsPageUp()
  }

  ## RangedValue resolution
  {
    id: 'delta value - inc'
    fn: ->
      resolutionIndex-- if resolutionIndex > 0
      resolution = RESOLUTIONS[resolutionIndex]
      host.showPopupNotification "delta value: 1/#{resolution-1}"
  }
  {
    id: 'delta value - dec'
    fn: ->
      resolutionIndex++ if resolutionIndex < RESOLUTIONS.length - 1
      resolution = RESOLUTIONS[resolutionIndex]
      host.showPopupNotification "delta value: 1/#{resolution-1}"
  }
]
