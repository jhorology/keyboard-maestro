bitwig = require './bitwig'
JSON2 = require 'JSON2'

module.exports =
    init: () ->
        @application = bitwig.createApplication()
    
    midi: (s, d1, d2) ->
        # CC ch 16 for utility
        if s is 0xBF and d1 < @handlers.length
            @handlers[d1].call @, d2

    handlers: [
        # 0 list all actions as JSON
        () -> @print()
    ]

    print: () ->
        json =
            hostVersion: String bitwig.getHostVersion()
            hostApiVersion: Number bitwig.getHostApiVersion()
            actions: for action, i in @application.getActions()
                id: String action.getId()
                category: String action.getCategory().getId()
                on:
                    ch: 1
                    cc: i >> 7
                    value: i & 0x7f
        bitwig.println JSON2.stringify(json)
        bitwig.println '''

copy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html

'''
        bitwig.println "total #{json.actions.length} actions."
