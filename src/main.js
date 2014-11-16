(function(root, Bitwig, $, _) {
    'use strict';

    // variables
    var controllers;

    Bitwig.defineController(
        'Stairways Software',
        'Keyboard Maestro',
        '0.1',
        'af04a470-6b45-11e4-9803-0800200c9a66',
        'jhorology jhorology2014@gmail.com'
    );
    Bitwig.defineMidiPorts(1, 0);
    Bitwig.platformIsMac() && Bitwig.addDeviceNameBasedDiscoveryPair(['Keyboard Maestro'],[]);

    root.init = function() {
        var in0 = Bitwig.getMidiInPort(0);
        in0.setMidiCallback(midi);
        controllers = [
            $.util,
            $.action
        ];
        _.each(controllers, function(c) {
            _.isFunction(c.init) && c.init();
        });
    };

    root.flush = function() {
        _.each(controllers, function(c) {
            _.isFunction(c.flush) && c.flush();
        });
    };

    root.exit = function() {
        _.each(controllers.reverse(), function(c) {
            _.isFunction(c.exit) && c.exit();
        });
        controllers = undefined;
    };

    function midi(s, d1, d2) {
        _.each(controllers, function(c) {
            _.isFunction(c.midi) && c.midi(s, d1, d2);
        });
    }

}(this, host, this.KeyboardMaestro, _));
