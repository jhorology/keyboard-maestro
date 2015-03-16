_       = require 'underscore'
host    = require './host'
ctx     = require './scripting-context'

NUM_SENDS = 4

# macrolet
# v:function($,v){ do something...},m:function($,on,v){do something...}
#
# property | type              | desc
# ---------|-------------------|-----------------------------------------------
#  v       | function($,v)     | called on value changed. $=context, v=value(0..1)
#  m       | function($, s, v) | calledi on mapping on/off, $=context, s=on/off, v=value(0..1)

process.on 'init', ->
  device = host.createEditorCursorDevice NUM_SENDS
  for index in [0..7]
    macro = device.getMacro(index)
    amount = macro.getAmount()
      .attribify 'name', 2048, ''
      .attribify 'rawValue'
      .on 'change:name', (a, name) ->
        @macrolet = undefined
        if match = /^(.+)(?= \(Macro [1-8]\))/.exec name
          o = undefined
          try
            o = eval "({#{match[1]}})"
          catch error
          if _.isObject(o)
            @macrolet = {}
            @macrolet.v = if _.isFunction(o.v) then o.v else undefined
            @macrolet.m = if _.isFunction(o.m) then o.m else undefined
      .on 'change:rawValue', (a, v) ->
        @macrolet?.v?.call ctx, ctx, v
        
    macro.getModulationSource()
      .attribify 'isMapping'
      .on 'change:isMapping', (ms, s) ->
        @macrolet?.m?.call ctx, ctx, s, @get('rawValue')
      , amount
        
