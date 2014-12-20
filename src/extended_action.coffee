bitwig = require './bitwig'

module.exports =
  init: ->
    @track = bitwig.createArrangerCursorTrack 4, 0

  midi: (s, d1, d2) ->
    index = (d1 << 7) + d2;
    # ch.2 for extended action
    if s is 0xB1 and index < @actions.length
      @actions[index].fn.call @

  actions: [
    ## cursor track
    {
      id: 'cursor track - activated - toggle'
      fn: -> @track.isActivated()?.toggle()
    }
    {
      id: 'cursor track - volume - +10%'
      fn: -> @track.getVolume()?.inc 10, 100
    }
    {
      id: 'cursor track - volume - +1%'
      fn: -> @track.getVolume()?.inc 1, 100
    }
    {
      id: 'cursor track - volume - -1%'
      fn: -> @track.getVolume()?.inc -1, 100
    }
    {
      id: 'cursor track - volume - -10%'
      fn: -> @track.getVolume()?.inc -10, 100
    }
    {
      id: 'cursor track - volume - reset'
      fn: -> @track.getVolume()?.reset()
    }
    {
      id: 'cursor track - pan - right 10%'
      fn: -> @track.getPan()?.inc 10, 200
    }
    {
      id: 'cursor track - pan - right 1%'
      fn: -> @track.getPan()?.inc 1, 200
    }
    {
      id: 'cursor track - pan - left 1%'
      fn: -> @track.getPan()?.inc -1, 200
    }
    {
      id: 'cursor track - pan - left 10%'
      fn: -> @track.getPan()?.inc -10, 200
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
      fn: -> @track.getSend(0)?.inc 10, 100
    }
    {
      id: 'cursor track - send S1 - +1%'
      fn: -> @track.getSend(0)?.inc 1, 100
    }
    {
      id: 'cursor track - send S1 - -1%'
      fn: -> @track.getSend(0)?.inc -1, 100
    }
    {
      id: 'cursor track - send S1 - -10%'
      fn: -> @track.getSend(0)?.inc -10, 100
    }
    {
      id: 'cursor track - send S1 - reset'
      fn: -> @track.getSend(0)?.reset()
    }
    {
      id: 'cursor track - send S2 - +10%'
      fn: -> @track.getSend(1)?.inc 10, 100
    }
    {
      id: 'cursor track - send S2 - +1%'
      fn: -> @track.getSend(1)?.inc 1, 100
    }
    {
      id: 'cursor track - send S2 - -1%'
      fn: -> @track.getSend(1)?.inc -1, 100
    }
    {
      id: 'cursor track - send S2 - -10%'
      fn: -> @track.getSend(1)?.inc -10, 100
    }
    {
      id: 'cursor track - send S2 - reset'
      fn: -> @track.getSend(1)?.reset()
    }
    {
      id: 'cursor track - send S3 - +10%'
      fn: -> @track.getSend(2)?.inc 10, 100
    }
    {
      id: 'cursor track - send S3 - +1%'
      fn: -> @track.getSend(2)?.inc 1, 100
    }
    {
      id: 'cursor track - send S3 - +1%'
      fn: -> @track.getSend(2)?.inc -1, 100
    }
    {
      id: 'cursor track - send S3 - +10%'
      fn: -> @track.getSend(2)?.inc -10, 100
    }
    {
      id: 'cursor track - send S3 - reset'
      fn: -> @track.getSend(2)?.reset()
    }
    {
      id: 'cursor track - send S4 - +10%'
      fn: -> @track.getSend(3)?.inc 10, 100
    }
    {
      id: 'cursor track - send S4 - +1%'
      fn: -> @track.getSend(3)?.inc 1, 100
    }
    {
      id: 'cursor track - send S4 - -1%'
      fn: -> @track.getSend(3)?.inc -1, 100
    }
    {
      id: 'cursor track - send S4 - -10%'
      fn: -> @track.getSend(3)?.inc -10, 100
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
      id: 'cursor track - clip laucner - preturn to arrangement'
      fn: -> @track.returnToArrangement()
    }
  ]
