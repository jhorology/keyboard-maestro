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
        {
            id: 'cursor track - toggle activated'
            fn: -> @track.isActivated()?.toggle()
        }
        {
            id: 'cursor track - up volume 10%'
            fn: -> @track.getVolume()?.inc 10, 100
        }
        {
            id: 'cursor track - up volume 1%'
            fn: -> @track.getVolume()?.inc 1, 100
        }
        {
            id: 'cursor track - down volume 1%'
            fn: -> @track.getVolume()?.inc -1, 100
        }
        {
            id: 'cursor track - down volume 10%'
            fn: -> @track.getVolume()?.inc -10, 100
        }
        {
            id: 'cursor track - reset volume'
            fn: -> @track.getVolume()?.reset()
        }
        {
            id: 'cursor track - pan right 10%'
            fn: -> @track.getPan()?.inc 10, 100
        }
        {
            id: 'cursor track - pan right 1%'
            fn: -> @track.getPan()?.inc 1, 100
        }
        {
            id: 'cursor track - pan left 1%'
            fn: -> @track.getPan()?.inc -1, 100
        }
        {
            id: 'cursor track - pan left 10%'
            fn: -> @track.getPan()?.inc -10, 100
        }
        {
            id: 'cursor track - reset pan'
            fn: -> @track.getVolume()?.reset()
        }
        {
            id: 'cursor track - toggle mute'
            fn: -> @track.getMute()?.toggle()
        }
        {
            id: 'cursor track - toggle solo'
            fn: -> @track.getSolo()?.toggle()
        }
    ]
