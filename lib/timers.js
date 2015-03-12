// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Modified for use with browserify by Jan Schär, 2015
// Based on v0.12.0 of node

// Modified for use with bitwig jhorology, 2015
// Based on https://github.com/jscissr/timers-browserify-full

// keep local copies in case someone adds timers.setTimeout to global
var host = global.host;
var Date = global.Date;

var L = require('./_linklist');
var assert = require('./assert').ok;

var kOnTimeout = 'ontimeout';

// Timeout values > TIMEOUT_MAX are set to 1.
var TIMEOUT_MAX = 2147483647; // 2^31-1

var util = require('util');
var debug = util.debuglog('timer');

var TIMER_USING = 1;
var TIMER_CLOSING = 2;
var timers = new Array(512);

function getTimerId() {
    var id;
    for (id = 0; id < timers.length; id++) {
        if (!timers[id]) {
            timers[id] = TIMER_USING;
            return id;
        }
    }
    throw new Error('maximum number of timers has been reached');
}


function Timer() {
    this._id = null;
}

Timer.prototype.start = function(msecs) {
    var self = this;
    this._id = getTimerId();
    host.scheduleTask(function() {
        if (timers[self._id] === TIMER_USING)
            self[kOnTimeout]();
        timers[self._id] = null;
    }, null, msecs);
};

Timer.prototype.close = function() {
    if (this._id !== null) {
        timers[self._id] = TIMER_CLOSING;
    }
};

Timer.now = !!(typeof performance !== 'undefined' && performance.now) ?
    performance.now.bind(performance) : function() { return +new Date; };


// IDLE TIMEOUTS
//
// Because often many sockets will have the same idle timeout we will not
// use one timeout watcher per item. It is too much overhead.  Instead
// we'll use a single watcher for all sockets with the same timeout value
// and a linked list. This technique is described in the libev manual:
// http://pod.tst.eu/http://cvs.schmorp.de/libev/ev.pod#Be_smart_about_timeouts

// Object containing all lists, timers
// key = time in milliseconds
// value = list
var lists = {};

// the main function - creates lists on demand and the watchers associated
// with them.
function insert(item, msecs) {
    item._idleStart = Timer.now();
    item._idleTimeout = msecs;

    assert(!(msecs < 0));

    var list;

    if (lists[msecs]) {
        list = lists[msecs];
    } else {
        list = new Timer();
        list.start(msecs);

        L.init(list);

        lists[msecs] = list;
        list.msecs = msecs;
        list[kOnTimeout] = listOnTimeout;
    }

    L.append(list, item);
    assert(!L.isEmpty(list)); // list is not empty
}

function listOnTimeout() {
    var msecs = this.msecs;
    var list = this;

    debug('timeout callback %d', msecs);

    var now = Timer.now();
    debug('now: %s', now);

    var diff, first, threw;
    while (first = L.peek(list)) {
        diff = now - first._idleStart;
        if (diff < msecs) {
            list.start(msecs - diff);
            debug('%d list wait because diff is %d', msecs, diff);
            return;
        } else {
            L.remove(first);
            assert(first !== L.peek(list));

            if (!first._onTimeout) continue;

            // v0.4 compatibility: if the timer callback throws and the
            // domain or uncaughtException handler ignore the exception,
            // other timers that expire on this tick should still run.
            //
            // https://github.com/joyent/node/issues/2631
            var domain = first.domain;
            if (domain && domain._disposed)
                continue;

            try {
                if (domain && domain.enter)
                    domain.enter();
                threw = true;
                first._onTimeout();
                if (domain && domain.exit)
                    domain.exit();
                threw = false;
            } finally {
                if (threw) {
                    // We need to continue processing after domain error handling
                    // is complete, but not by using whatever domain was left over
                    // when the timeout threw its exception.
                    var oldDomain = process.domain;
                    process.domain = null;
                    process.nextTick(function() {
                        list[kOnTimeout]();
                    });
                    process.domain = oldDomain;
                }
            }
        }
    }

    debug('%d list empty', msecs);
    assert(L.isEmpty(list));
    list.close();
    delete lists[msecs];
}


var unenroll = exports.unenroll = function(item) {
    L.remove(item);

    var list = lists[item._idleTimeout];
    // if empty then stop the watcher
    debug('unenroll');
    if (list && L.isEmpty(list)) {
        debug('unenroll: list empty');
        list.close();
        delete lists[item._idleTimeout];
    }
    // if active is called later, then we want to make sure not to insert again
    item._idleTimeout = -1;
};


// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
    if (!util.isNumber(msecs)) {
        throw new TypeError('msecs must be a number');
    }

    if (msecs < 0 || !isFinite(msecs)) {
        throw new RangeError('msecs must be a non-negative finite number');
    }

    // if this item was already in a list somewhere
    // then we should unenroll it from that
    if (item._idleNext) unenroll(item);

    // Ensure that msecs fits into signed int32
    if (msecs > TIMEOUT_MAX) {
        msecs = TIMEOUT_MAX;
    }

    item._idleTimeout = msecs;
    L.init(item);
};


// call this whenever the item is active (not idle)
// it will reset its timeout.
exports.active = function(item) {
    var msecs = item._idleTimeout;
    if (msecs >= 0) {
        var list = lists[msecs];
        if (!list || L.isEmpty(list)) {
            insert(item, msecs);
        } else {
            item._idleStart = Timer.now();
            L.append(list, item);
        }
    }
};


/*
 * DOM-style timers
 */


exports.setTimeout = function(callback, after) {
    var timer;

    after *= 1; // coalesce to number or NaN

    if (!(after >= 1 && after <= TIMEOUT_MAX)) {
        after = 1; // schedule on next tick, follows browser behaviour
    }

    timer = new Timeout(after);

    if (arguments.length <= 2) {
        timer._onTimeout = callback;
    } else {
        /*
         * Sometimes setTimeout is called with arguments, EG
         *
         *   setTimeout(callback, 2000, "hello", "world")
         *
         * If that's the case we need to call the callback with
         * those args. The overhead of an extra closure is not
         * desired in the normal case.
         */
        var args = Array.prototype.slice.call(arguments, 2);
        timer._onTimeout = function() {
            callback.apply(timer, args);
        }
    }

    if (process.domain) timer.domain = process.domain;

    exports.active(timer);

    return timer;
};


exports.clearTimeout = function(timer) {
    if (timer && (timer[kOnTimeout] || timer._onTimeout)) {
        timer[kOnTimeout] = timer._onTimeout = null;
        if (timer instanceof Timeout) {
            timer.close(); // for after === 0
        } else {
            exports.unenroll(timer);
        }
    }
};


exports.setInterval = function(callback, repeat) {
    repeat *= 1; // coalesce to number or NaN

    if (!(repeat >= 1 && repeat <= TIMEOUT_MAX)) {
        repeat = 1; // schedule on next tick, follows browser behaviour
    }

    var timer = new Timeout(repeat);
    var args = Array.prototype.slice.call(arguments, 2);
    timer._onTimeout = wrapper;
    timer._repeat = true;

    if (process.domain) timer.domain = process.domain;
    exports.active(timer);

    return timer;

    function wrapper() {
        callback.apply(this, args);
        // If callback called clearInterval().
        if (timer._repeat === false) return;
        // If timer is unref'd (or was - it's permanently removed from the list.)
        timer._idleTimeout = repeat;
        exports.active(timer);
    }
};


exports.clearInterval = function(timer) {
    if (timer && timer._repeat) {
        timer._repeat = false;
        exports.clearTimeout(timer);
    }
};


var Timeout = function(after) {
    this._idleTimeout = after;
    this._idlePrev = this;
    this._idleNext = this;
    this._idleStart = null;
    this._onTimeout = null;
    this._repeat = false;
};


Timeout.prototype.unref = Timeout.prototype.ref = function() {};


Timeout.prototype.close = function() {
    this._onTimeout = null;
    exports.unenroll(this);
};


var immediateQueue = {};
L.init(immediateQueue);


function processImmediate() {
    var queue = immediateQueue;
    var domain, immediate;

    immediateQueue = {};
    L.init(immediateQueue);

    while (L.isEmpty(queue) === false) {
        immediate = L.shift(queue);
        domain = immediate.domain;

        if (domain && domain.enter)
            domain.enter();

        var threw = true;
        try {
            immediate._onImmediate();
            threw = false;
        } finally {
            if (threw) {
                if (!L.isEmpty(queue)) {
                    // Handle any remaining on next tick, assuming we're still
                    // alive to do so.
                    while (!L.isEmpty(immediateQueue)) {
                        L.append(queue, L.shift(immediateQueue));
                    }
                    immediateQueue = queue;
                    process.nextTick(processImmediate);
                }
            }
        }

        if (domain && domain.exit)
            domain.exit();
    }

    // Only round-trip to C++ land if we have to. Calling clearImmediate() on an
    // immediate that's in |queue| is okay. Worst case is we make a superfluous
    // call to NeedImmediateCallbackSetter().
    if (!L.isEmpty(immediateQueue)) {
        process.nextTick(processImmediate);
    }
}


function Immediate() { }

Immediate.prototype.domain = undefined;
Immediate.prototype._onImmediate = undefined;
Immediate.prototype._idleNext = undefined;
Immediate.prototype._idlePrev = undefined;


exports.setImmediate = function(callback) {
    var immediate = new Immediate();
    var args, index;

    L.init(immediate);

    immediate._onImmediate = callback;

    if (arguments.length > 1) {
        args = [];
        for (index = 1; index < arguments.length; index++)
            args.push(arguments[index]);

        immediate._onImmediate = function() {
            callback.apply(immediate, args);
        };
    }

    if (L.isEmpty(immediateQueue)) {
        process.nextTick(processImmediate);
    }

    if (process.domain)
        immediate.domain = process.domain;

    L.append(immediateQueue, immediate);

    return immediate;
};


exports.clearImmediate = function(immediate) {
    if (!immediate) return;

    immediate._onImmediate = undefined;

    L.remove(immediate);
};

// Internal APIs that need timeouts should use timers._unrefActive instead of
// timers.active as internal timeouts shouldn't hold the loop open

exports._unrefActive = exports.active;
