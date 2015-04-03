_       = require 'underscore'
ctx     = require './scripting-context'

# macrolet
# v:function($,v){ do something...},m:function($,s,v){do something...}
#
# property | type              | desc
# ---------|-------------------|-----------------------------------------------
#  v       | function($,v)     | called on value changed. $=context, v=value(0..1)
#  m       | function($, s, v) | called on mapping on/off, $=context, s=on/off, v=value(0..1)
ctx.on 'init', ->
  for index in [0..7]
    macro = ctx.cdv.getMacro index
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
          if _.isObject o
            @macrolet = {}
            @macrolet.v = if _.isFunction(o.v) then o.v
            @macrolet.m = if _.isFunction(o.m) then o.m
      .on 'change:rawValue', (a, v) ->
        @macrolet?.v?.call ctx, ctx, v
        
    macro.getModulationSource()
      .attribify 'isMapping'
      .on 'change:isMapping', (ms, s) ->
        @macrolet?.m?.call ctx, ctx, s, @get 'rawValue'
      , amount
        
