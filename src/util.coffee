bitwig = require './bitwig'
_ = require 'underscore'
JSON2 = require 'JSON2'

module.exports =
    init: () ->
        @application = bitwig.createApplication()
    
    midi: (s, d1, d2) ->
        # CC ch 16 for utility
        if s is 0xBF and d1 < this.handlers.length
            @handlers[d1].call @, d2

    handlers: [
        # 0 list all actions as JSON
        () -> @print()
    ]

    print: () ->
        json = @actions();
        bitwig.println JSON2.stringify(json)
        bitwig.println '''

copy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html

'''
        categories = _.groupBy json.actions, 'category'
        _.each _.keys(categories), (key) ->
            bitwig.println "#{key} : #{categories[key].length} actions."
        bitwig.println "total #{json.actions.length} actions."
    
    actions: () ->
        index = 0
        actions =
            hostVersion: String bitwig.getHostVersion()
            hostApiVersion: Number bitwig.getHostApiVersion()
            actions: _.map this.application.getActions(), (action) ->
                action =
                    id: String action.getId()
                    category: String action.getCategory().getId()
                    on:
                        ch: 1
                        cc: index >> 7
                        value: index & 0x7f
                index++
                return action
