bitwig = require './bitwig'
_ = require 'underscore'

controllers = [
    require('./util'),
    require('./action')
]

bitwig.defineController(
    'Stairways Software',
    'Keyboard Maestro',
    '0.1',
    'af04a470-6b45-11e4-9803-0800200c9a66',
    'jhorology jhorology2014@gmail.com'
)

bitwig.defineMidiPorts 1, 0
bitwig.addDeviceNameBasedDiscoveryPair ['Keyboard Maestro'],[] if bitwig.platformIsMac()

global.init = () ->
    in0 = bitwig.getMidiInPort(0)
    bitwig.getMidiInPort(0).setMidiCallback (s, d1, d2) ->
        _.each controllers, (c) ->
            c.midi s, d1, d2 if _.isFunction(c.midi)
            
    _.each controllers, (c) ->
        c.init() if _.isFunction(c.init)

global.flush = () ->
    _.each controllers, (c) ->
        c.flush() if _.isFunction(c.flush)

global.exit = () ->
    _.each controllers.reverse(), (c) ->
        c.exit() if _.isFunction(c.exit)
