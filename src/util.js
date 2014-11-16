(function(root, Bitwig, _) {
    'use strict';
    var util = {
        init: function() {
            this.application = Bitwig.createApplication();
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

        flush: function() {
        },

        exit: function() {
        },

        print: function() {
            root.println('...now generating actions JSON.\n');
            var json = this.actions();
            root.println(JSON.stringify(json));
            root.println('\ncopy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html');
            var categories = _.groupBy(json.actions, 'category');
            _.each(_.keys(categories), function(key) {
                root.println(key + ' : ' + categories[key].length + ' actions.');
            });
            root.println('total ' + json.actions.length + ' actions.');
        },
        
        actions: function() {
            var index = 0;
            return {
                hostVersion: String(Bitwig.getHostVersion()),
                hostApiVersion: Number(Bitwig.getHostApiVersion()),
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
    
    root.KeyboardMaestro || (root.KeyboardMaestro = {});
    root.KeyboardMaestro.util = util;
}(this, host, _));
