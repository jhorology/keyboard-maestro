var bitwig = require('./bitwig');
var _ = require('underscore');
var JSON2 = require('JSON2');

module.exports = {
    init: function() {
        this.application = bitwig.createApplication();
    },
    
    midi: function(s, d1, d2) {
        // CC ch 16 for utility
        s === 0xBF && d1 < this.handlers.length &&
            this.handlers[d1].call(this, d2);
    },

    handlers: [
        // CC# 0 list all actions as JSON
        function() {this.print();}
    ],

    print: function() {
        var json = this.actions();
        bitwig.println(JSON2.stringify(json));
        bitwig.println('\ncopy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html');
        var categories = _.groupBy(json.actions, 'category');
        _.each(_.keys(categories), function(key) {
            bitwig.println(key + ' : ' + categories[key].length + ' actions.');
        });
        bitwig.println('total ' + json.actions.length + ' actions.');
    },
    
    actions: function() {
        var index = 0;
        return {
            hostVersion: String(bitwig.getHostVersion()),
            hostApiVersion: Number(bitwig.getHostApiVersion()),
            actions: _.map(this.application.getActions(), function(action) {
                var obj = {};
                obj.id = String(action.getId());
                obj.category = String(action.getCategory().getId());
                obj.on = {ch:1, cc:index >> 7, value: index & 0x7f};
                index++;
                return obj;
            })
        };
    }
};
