# shim for node.js way in Bitwig Studio
require './bitwigify'

# host interface
require('./host').prepare
  vender: 'Stairways Software'
  name: 'Keyboard Maestro'
  version: '0.3'
  uuid: 'af04a470-6b45-11e4-9803-0800200c9a66'
  author: 'jhorology jhorology2014@gmail.com'
  midi:
    mac: [
      { in: ['Keyboard Maestro'], out: [] }
    ]

# function modules
require './util'
require './action'
require './extended'
