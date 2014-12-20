bitwig = require './bitwig'

controllers = [
  require './util'
  require './action'
  require './extended_action'
]

bitwig.defineController(
  'Stairways Software',
  'Keyboard Maestro',
  '0.2',
  'af04a470-6b45-11e4-9803-0800200c9a66',
  'jhorology jhorology2014@gmail.com'
)

bitwig.defineMidiPorts 1, 0
bitwig.addDeviceNameBasedDiscoveryPair ['Keyboard Maestro'],[] if bitwig.platformIsMac()

global.init = ->
  bitwig.getMidiInPort(0).setMidiCallback (s, d1, d2) ->
    c.midi?(s, d1, d2) for c in controllers
  c.init?() for c in controllers

global.flush = ->
  c.flush?() for c in controllers

global.exit = ->
  c.exit?() for c in controllers.reverse()
