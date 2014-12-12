// variables
var controllers;
var bitwig = require('./bitwig');
var _ = require('underscore');

bitwig.defineController(
    'Stairways Software',
    'Keyboard Maestro',
    '0.1',
    'af04a470-6b45-11e4-9803-0800200c9a66',
    'jhorology jhorology2014@gmail.com'
);

bitwig.defineMidiPorts(1, 0);
bitwig.platformIsMac() && bitwig.addDeviceNameBasedDiscoveryPair(['Keyboard Maestro'],[]);

global.init = function() {
    var in0 = bitwig.getMidiInPort(0);
    controllers = [
        require('./util'),
        require('./action')
    ];
    in0.setMidiCallback(function (s, d1, d2) {
        _.each(controllers, function(c) {
            _.isFunction(c.midi) && c.midi(s, d1, d2);
        });
    });
    _.each(controllers, function(c) {
        _.isFunction(c.init) && c.init();
    });
};

global.flush = function() {
    _.each(controllers, function(c) {
        _.isFunction(c.flush) && c.flush();
    });
};

global.exit = function() {
    _.each(controllers.reverse(), function(c) {
        _.isFunction(c.exit) && c.exit();
    });
    controllers = undefined;
};
