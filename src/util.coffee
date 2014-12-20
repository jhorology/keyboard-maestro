bitwig = require './bitwig'
JSON2 = require 'JSON2'
extendedActions = require('./extended_action').actions

module.exports =
    init: () ->
        @application = bitwig.createApplication()

    midi: (s, d1, d2) ->
        # CC ch 16 for utility
        if s is 0xBF and d1 < @handlers.length
            @handlers[d1].call @, d2

    handlers: [
        # 0 list all actions as JSON
        -> @printActions()
    ]

    printActions: ->
        bitwig.println JSON2.stringify
            hostVersion: String bitwig.getHostVersion()
            hostApiVersion: Number bitwig.getHostApiVersion()
            actions: (
                for action, i in @application.getActions()
                    id: String action.getId()
                    category: String action.getCategory().getId()
                    on:
                        ch: 1
                        cc: i >> 7
                        value: i & 0x7f
             ).concat(
                for action, j in extendedActions
                    id: action.id
                    category: 'Extended'
                    on:
                        ch: 2
                        cc: j >> 7
                        value: j & 0x7f
             )

                        
        bitwig.println '''

copy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html

'''
        bitwig.println "total #{i} + #{j} actions."
