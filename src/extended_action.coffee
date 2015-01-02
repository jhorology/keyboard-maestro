bitwig = require './bitwig'

module.exports =
  init: ->
    @track = bitwig.createArrangerCursorTrack 4, 0
    @device = bitwig.createEditorCursorDevice()
    @track.addIsSelectedInMixerObserver (selected) =>
      @trackSelected = selected
    @device.addHasSelectedDeviceObserver (selected) =>
      @deviceSelected = selected
    @macroValues = for index in [0..7]
      @device.getMacro(index).getAmount()
    @macroSources = for index in [0..7]
      @device.getMacro(index).getModulationSource()
    @macroIndicated = false
    @parameterValues = for index in [0..7]
      @device.getParameter index
    @parameterIndicated = false

  midi: (s, d1, d2) ->
    # ch.2 for extended action
    if s is 0xB1 and @trackSelected
      index = (d1 << 7) + d2
      return if @actions[index].id.indexOf('cursor track') is 0 and not @trackSelected
      return if @actions[index].id.indexOf('cursor device') is 0 and not @deviceSelected
      @actions[index].fn.call @ if index < @actions.length

  deviceValue: (i, delta) ->
    @macroValues[i].inc delta, 101 if @macroIndicated
    @parameterValues[i].inc delta, 101 if @parameterIndicated
    
  actions: [
    ## cursor track
    {
      id: 'cursor track - activated - toggle'
      fn: -> @track.isActivated()?.toggle()
    }
    {
      id: 'cursor track - volume - +10%'
      fn: -> @track.getVolume()?.inc 10, 101
    }
    {
      id: 'cursor track - volume - +1%'
      fn: -> @track.getVolume()?.inc 1, 101
    }
    {
      id: 'cursor track - volume - -1%'
      fn: -> @track.getVolume()?.inc -1, 101
    }
    {
      id: 'cursor track - volume - -10%'
      fn: -> @track.getVolume()?.inc -10, 101
    }
    {
      id: 'cursor track - volume - reset'
      fn: -> @track.getVolume()?.reset()
    }
    {
      id: 'cursor track - pan - right 10%'
      fn: -> @track.getPan()?.inc 10, 201
    }
    {
      id: 'cursor track - pan - right 1%'
      fn: -> @track.getPan()?.inc 1, 201
    }
    {
      id: 'cursor track - pan - left 1%'
      fn: -> @track.getPan()?.inc -1, 201
    }
    {
      id: 'cursor track - pan - left 10%'
      fn: -> @track.getPan()?.inc -10, 201
    }
    {
      id: 'cursor track - pan - reset'
      fn: -> @track.getPan()?.reset()
    }
    {
      id: 'cursor track - mute - toggle'
      fn: -> @track.getMute()?.toggle()
    }
    {
      id: 'cursor track - solo - toggle'
      fn: -> @track.getSolo()?.toggle()
    }
    {
      id: 'cursor track - send S1 - +10%'
      fn: -> @track.getSend(0)?.inc 10, 101
    }
    {
      id: 'cursor track - send S1 - +1%'
      fn: -> @track.getSend(0)?.inc 1, 101
    }
    {
      id: 'cursor track - send S1 - -1%'
      fn: -> @track.getSend(0)?.inc -1, 101
    }
    {
      id: 'cursor track - send S1 - -10%'
      fn: -> @track.getSend(0)?.inc -10, 101
    }
    {
      id: 'cursor track - send S1 - reset'
      fn: -> @track.getSend(0)?.reset()
    }
    {
      id: 'cursor track - send S2 - +10%'
      fn: -> @track.getSend(1)?.inc 10, 101
    }
    {
      id: 'cursor track - send S2 - +1%'
      fn: -> @track.getSend(1)?.inc 1, 101
    }
    {
      id: 'cursor track - send S2 - -1%'
      fn: -> @track.getSend(1)?.inc -1, 101
    }
    {
      id: 'cursor track - send S2 - -10%'
      fn: -> @track.getSend(1)?.inc -10, 101
    }
    {
      id: 'cursor track - send S2 - reset'
      fn: -> @track.getSend(1)?.reset()
    }
    {
      id: 'cursor track - send S3 - +10%'
      fn: -> @track.getSend(2)?.inc 10, 101
    }
    {
      id: 'cursor track - send S3 - +1%'
      fn: -> @track.getSend(2)?.inc 1, 101
    }
    {
      id: 'cursor track - send S3 - -1%'
      fn: -> @track.getSend(2)?.inc -1, 101
    }
    {
      id: 'cursor track - send S3 - -10%'
      fn: -> @track.getSend(2)?.inc -10, 101
    }
    {
      id: 'cursor track - send S3 - reset'
      fn: -> @track.getSend(2)?.reset()
    }
    {
      id: 'cursor track - send S4 - +10%'
      fn: -> @track.getSend(3)?.inc 10, 101
    }
    {
      id: 'cursor track - send S4 - +1%'
      fn: -> @track.getSend(3)?.inc 1, 101
    }
    {
      id: 'cursor track - send S4 - -1%'
      fn: -> @track.getSend(3)?.inc -1, 101
    }
    {
      id: 'cursor track - send S4 - -10%'
      fn: -> @track.getSend(3)?.inc -10, 101
    }
    {
      id: 'cursor track - send S4 - reset'
      fn: -> @track.getSend(3)?.reset()
    }
    {
      id: 'cursor track - arm - toggle'
      fn: -> @track.getArm()?.toggle()
    }
    {
      id: 'cursor track - monitor - toggle'
      fn: -> @track.getMonitor()?.toggle()
    }
    {
      id: 'cursor track - auto monitor - toggle'
      fn: -> @track.getAutoMonitor()?.toggle()
    }
    {
      id: 'cursor track - crossfade - mode A'
      fn: -> @track.getCrossFadeMode()?.set 'A'
    }
    {
      id: 'cursor track - crossfade - mode B'
      fn: -> @track.getCrossFadeMode()?.set 'B'
    }
    {
      id: 'cursor track - crossfade - mode AB'
      fn: -> @track.getCrossFadeMode()?.set 'AB'
    }
    {
      id: 'cursor track - clip launcher - stop'
      fn: -> @track.stop()
    }
    {
      id: 'cursor track - clip laucner - return to arrangement'
      fn: -> @track.returnToArrangement()
    }
    {
      id: 'cursor device - enable state - toggle'
      fn: -> @device.toggleEnabledState()
    }
    {
      id: 'cursor device - window - toggle'
      fn: -> @device.isWindowOpen().toggle()
    }
    {
      id: 'cursor device - expanded - toggle'
      fn: -> @device.isExpanded().toggle()
    }
    {
      id: 'cursor device - macro section - toggle'
      fn: -> @device.isMacroSectionVisible().toggle()
    }
    {
      id: 'cursor device - paramater page section - toggle'
      fn: -> @device.isParameterPageSectionVisible().toggle()
    }
    {
      id: 'cursor device - paramater page - prev'
      fn: -> @device.previousParameterPage()
    }
    {
      id: 'cursor device - paramater page - next'
      fn: -> @device.nextParameterPage()
    }
    {
      id: 'cursor device - preset - prev'
      fn: -> @device.switchToPreviousPreset()
    }
    {
      id: 'cursor device - preset - next'
      fn: -> @device.switchToNextPreset()
    }
    {
      id: 'cursor device - preset category - prev'
      fn: -> @device.switchToPreviousPresetCategory()
    }
    {
      id: 'cursor device - preset category - next'
      fn: -> @device.switchToNextPresetCategory()
    }
    {
      id: 'cursor device - preset creator - prev'
      fn: -> @device.switchToPreviousPresetCreator()
    }
    {
      id: 'cursor device - preset creator - next'
      fn: -> @device.switchToNextPresetCreator()
    }
    {
      id: 'cursor device - macro/param indication - toggle'
      fn: ->
        @macroIndicated = not @macroIndicated
        @parameterIndicated = not @macroIndicated
        @device.isMacroSectionVisible().set @macroIndicated
        macro.setIndication @macroIndicated for macro in @macroValues
        @device.isParameterPageSectionVisible().set @parameterIndicated
        param.setIndication @parameterIndicated for param in @parameterValues
    }
    {
      id: 'cursor device - macro/param 1 - up'
      fn: -> @deviceValue 0, 1
    }
    {
      id: 'cursor device - macro/param 1 - down'
      fn: -> @deviceValue 0, -1
    }
    {
      id: 'cursor device - macro/param 2 - up'
      fn: -> @deviceValue 1, 1
    }
    {
      id: 'cursor device - macro/param 2 - down'
      fn: -> @deviceValue 1, -1
    }
    {
      id: 'cursor device - macro/param 3 - up'
      fn: -> @deviceValue 2, 1
    }
    {
      id: 'cursor device - macro/param 3 - down'
      fn: -> @deviceValue 2, -1
    }
    {
      id: 'cursor device - macro/param 4 - up'
      fn: -> @deviceValue 3, 1
    }
    {
      id: 'cursor device - macro/param 4 - down'
      fn: -> @deviceValue 3, -1
    }
    {
      id: 'cursor device - macro/param 5 - up'
      fn: -> @deviceValue 4, 1
    }
    {
      id: 'cursor device - macro/param 5 - down'
      fn: -> @deviceValue 4, -1
    }
    {
      id: 'cursor device - macro/param 6 - up'
      fn: -> @deviceValue 5, 1
    }
    {
      id: 'cursor device - macro/param 6 - down'
      fn: -> @deviceValue 5, -1
    }
    {
      id: 'cursor device - macro/param 7 - up'
      fn: -> @deviceValue 6, 1
    }
    {
      id: 'cursor device - macro/param 7 - down'
      fn: -> @deviceValue 6, -1
    }
    {
      id: 'cursor device - macro/param 8 - up'
      fn: -> @deviceValue 7, 1
    }
    {
      id: 'cursor device - macro/param 8 - down'
      fn: -> @deviceValue 7, -1
    }
    {
      id: 'cursor device - macro 1 mapping - toggle'
      fn: -> @macroSources[0].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 2 mapping - toggle'
      fn: -> @macroSources[1].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 3 mapping - toggle'
      fn: -> @macroSources[2].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 4 mapping - toggle'
      fn: -> @macroSources[3].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 5 mapping - toggle'
      fn: -> @macroSources[4].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 6 mapping - toggle'
      fn: -> @macroSources[5].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 7 mapping - toggle'
      fn: -> @macroSources[6].toggleIsMapping()
    }
    {
      id: 'cursor device - macro 8 mapping - toggle'
      fn: -> @macroSources[7].toggleIsMapping()
    }
  ]
