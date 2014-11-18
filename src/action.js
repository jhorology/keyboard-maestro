(function(root, Bitwig, $, _) {
    'use strict';
    var action = {
        init: function() {
            var ver = String(Bitwig.getHostVersion());
            if (ver !== $.ActionVersion) {
                throw new Error('Invalid version. host:[' + ver + ']' + ' actions:[' + $.ActionVersion + ']' );
            }
            this.application = Bitwig.createApplication();
        },
        
        midi: function(s, d1, d2) {
            var index = (d1 << 7) + d2;
            if (s=== 0xB0 && index < $.ActionIds.length) {
                this.application.getAction($.ActionIds[index]).invoke();
            }
        },
        
        flush: function() {
        },

        exit: function() {
        }
    };
    
    root.KeyboardMaestro || (root.KeyboardMaestro = {});
    root.KeyboardMaestro.action = action;
}(this, host, this.KeyboardMaestro, _));
