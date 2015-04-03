Backbone  = require 'backbone'
_         = require 'underscore'
Bitmonkey = require './bitmonkey'
ctx       = require './scripting-context'


# tracklet
# v:function($,v){ do something...},m:function($,v){do something...}
#
# property | type              | desc
# ---------|-------------------|-----------------------------------------------
#  name    | String            | reference name.
#  v       | function($, v)    | called on Volume changed. $=context, v=value(0..1)
#  p       | function($, v)    | called on pan changed, $=context, v=value(0..1)
#  s[1-n]  | function($, v)    | called on send changed, $=context, v=value(0..1)
#  a       | function($, v)    | called on arm on/off, $=context, v=on/off
#  s       | function($, v)    | called on solo on/off, $=context, v=on/off
#  m       | function($, v)    | called on mute on/off, $=context, v=on/off

class Sends extends Backbone.Collection
  model: Bitmonkey.AutomatableRangedValue
  
ctx.on 'init', ->
  ctx.trs.each (track) ->
    track
      .attribify 'name', 2048, '(empty)'
      .attribify 'volume', track.getVolume(), 'rawValue'
      .attribify 'pan', track.getPan(), 'rawValue'
      .attribify 'arm', track.getArm(), 'value'
      .attribify 'solo', track.getSolo(), 'value'
      .attribify 'mute', track.getMute(), 'value'
      .on 'change:name', (t, name) ->
        @tracklet = undefined
        if name isnt '(empty)'
          o = undefined
          try
            o = eval "({#{name}})"
          catch error
          if _.isObject o
            @tracklet = {}
            @tracklet.v = if _.isFunction(o.v) then o.v
            @tracklet.p = if _.isFunction(o.p) then o.p
            for i in [1..16]
              @tracklet["s#{i}"] = if _.isFunction(o["s#{i}"]) then o["s#{i}"]
            @tracklet.a = if _.isFunction(o.a) then o.a
            @tracklet.s = if _.isFunction(o.s) then o.s
            @tracklet.m = if _.isFunction(o.m) then o.m
      .on 'change:volume', (t, v) ->
        @tracklet?.v?.call ctx, ctx, v
      .on 'change:pan', (t, v) ->
        @tracklet?.p?.call ctx, ctx, v
      .on 'change:arm', (t, v) ->
        @tracklet?.a?.call ctx, ctx, v
      .on 'change:solo', (t, v) ->
        @tracklet?.s?.call ctx, ctx, v
      .on 'change:mute', (t, v) ->
        @tracklet?.m?.call ctx, ctx, v

    if track.get('category') is 'Main'
      sends = new Sends
      sends.add(
        for i in [0...ctx.numSends]
          track.getSend(i)
            .attribify 'rawValue'
            .set 'id', i + 1
      )
      track.set('sends', sends)
      sends.on 'change:rawValue', (s, v) ->
        @tracklet?["s#{s.get 'id'}"]?.call ctx, ctx, v
      , track
