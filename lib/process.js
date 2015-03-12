// Modified for use with bitwig by jhorology, 2015
// Based on https://github.com/defunctzombie/node-process

// shim for using process in bitwig

var events = require('events');
var process = module.exports = new events();
var queue = [];

global.init = function() {
    process.emit('init');
};

global.flush = function() {
    drainQueue();
};

global.exit = function() {
    process.emit('exit');
};

function drainQueue() {
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
}
process.nextTick = function (fun) {
    queue.push(fun);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
