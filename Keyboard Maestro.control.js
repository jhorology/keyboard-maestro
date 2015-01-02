/*! keyboard-maestro - v0.3.0 - 2015-01-02 */
// workaround for browserify's global.
var window = this;
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// cycle.js
// 2011-08-24

/*jslint evil: true, regexp: true */

/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/

(function (exports) {

if (typeof exports.decycle !== 'function') {
    exports.decycle = function decycle(object) {
        'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

        var objects = [],   // Keep a reference to each unique object or array
            paths = [];     // Keep the path to each unique object or array

        return (function derez(value, path) {

// The derez recurses through the object, producing the deep copy.

            var i,          // The loop counter
                name,       // Property name
                nu;         // The new object or array

            switch (typeof value) {
            case 'object':

// typeof null === 'object', so get out if this value is not really an object.

                if (!value) {
                    return null;
                }

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return {$ref: paths[i]};
                    }
                }

// Otherwise, accumulate the unique value and its path.

                objects.push(value);
                paths.push(path);

// If it is an array, replicate the array.

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name],
                                path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            case 'number':
            case 'string':
            case 'boolean':
                return value;
            }
        }(object, '$'));
    };
}


if (typeof exports.retrocycle !== 'function') {
    exports.retrocycle = function retrocycle($) {
        'use strict';

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px =
            /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}
}) (
  (typeof exports !== 'undefined') ? 
    exports : 
    (window.JSON ? 
      (window.JSON) :
      (window.JSON = {})
    )
);

},{}],2:[function(require,module,exports){
// For use in Node.js

var JSON2 = require('./json2');
var cycle = require('./cycle');

JSON2.decycle = cycle.decycle;
JSON2.retrocycle = cycle.retrocycle;

module.exports = JSON2;

},{"./cycle":1,"./json2":3}],3:[function(require,module,exports){
/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


(function (JSON) {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    /* DDOPSON-2012-04-16 - mutating global prototypes is NOT allowed for a well-behaved module.  
     * It's also unneeded, since Date already defines toJSON() to the same ISOwhatever format below
     * Thus, we skip this logic for the CommonJS case where 'exports' is defined
     */
    if (typeof exports === 'undefined') {
      if (typeof Date.prototype.toJSON !== 'function') {
          Date.prototype.toJSON = function (key) {

              return isFinite(this.valueOf())
                  ? this.getUTCFullYear()     + '-' +
                      f(this.getUTCMonth() + 1) + '-' +
                      f(this.getUTCDate())      + 'T' +
                      f(this.getUTCHours())     + ':' +
                      f(this.getUTCMinutes())   + ':' +
                      f(this.getUTCSeconds())   + 'Z'
                  : null;
          };
      }
      
      if (typeof String.prototype.toJSON !== 'function') {
        String.prototype.toJSON = function (key) { return this.valueOf(); };
      }

      if (typeof Number.prototype.toJSON !== 'function') {
        Number.prototype.toJSON = function (key) { return this.valueOf(); };
      }
      
      if (typeof Boolean.prototype.toJSON !== 'function') {
        Boolean.prototype.toJSON = function (key) { return this.valueOf(); };
      }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
})(
    
    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.
    
  (typeof exports !== 'undefined') ? 
    exports : 
    (window.JSON ? 
      (window.JSON) :
      (window.JSON = {})
    )
);

},{}],4:[function(require,module,exports){
(function (global){

var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

},{"./rng":4}],6:[function(require,module,exports){
var actions, bitwig;

bitwig = require('./bitwig');

actions = require('./actions');

module.exports = {
  init: function() {
    var ver;
    ver = String(bitwig.getHostVersion());
    if (ver !== actions.version) {
      throw new Error("Invalid version. host:[" + ver + "] actions:[" + actions.version + "]");
    }
    return this.application = bitwig.createApplication();
  },
  midi: function(s, d1, d2) {
    var index;
    if (s === 0xB0) {
      index = (d1 << 7) + d2;
      if (index < actions.ids.length) {
        return this.application.getAction(actions.ids[index].id).invoke();
      }
    }
  }
};



},{"./actions":7,"./bitwig":8}],7:[function(require,module,exports){
exports.version = '1.1.3';

exports.ids = [
  {
    id: 'New',
    uuid: '455E90F4-11B3-4564-93EC-40CE93117910'
  }, {
    id: 'Open',
    uuid: '6FA8D3BC-8ADC-4FD7-AA89-FF01F80D4AC1'
  }, {
    id: 'Save',
    uuid: '3AD9200D-674B-442D-AAFD-71EBAA36DBB4'
  }, {
    id: 'Save as',
    uuid: '5D698D51-F38C-47A1-8120-79FC62225407'
  }, {
    id: 'Close',
    uuid: 'C9679E21-01F7-4A07-9D93-16E61BEFC6C6'
  }, {
    id: 'Preferences',
    uuid: '0809E078-32EC-4B1D-9ADF-1CEFF6505F92'
  }, {
    id: 'Quit',
    uuid: 'E0C8AE87-1130-473C-9317-9A8A84ACB6A6'
  }, {
    id: 'Undo',
    uuid: '4419D4BA-414C-42C7-9D15-BFD44145DF50'
  }, {
    id: 'Redo',
    uuid: '1BA5D80A-C404-4D13-9D3F-45F3F878F8A1'
  }, {
    id: 'Cut',
    uuid: '531E2E1E-2BDC-4C47-A0E3-9434900B5EE5'
  }, {
    id: 'Cut Special',
    uuid: 'F59F924B-DCA7-445E-921E-2E2F1986C4CB'
  }, {
    id: 'Copy',
    uuid: 'F69D4F14-F235-4AFA-9253-161116A0D475'
  }, {
    id: 'Copy Special',
    uuid: '48663640-2600-4CE2-B637-4CC584BE1789'
  }, {
    id: 'Paste',
    uuid: 'E7307C5F-EAF0-4816-8865-8493117F4742'
  }, {
    id: 'Paste Special',
    uuid: '0DC0D718-1638-4C2C-878B-B064D9545208'
  }, {
    id: 'Duplicate',
    uuid: 'FD918254-D52F-4F34-B91F-13E56135A75B'
  }, {
    id: 'Duplicate Special',
    uuid: '139FFF06-884F-43D0-94A9-E15203549A1D'
  }, {
    id: 'Group',
    uuid: 'E9ADC918-8132-4644-8D9C-B7E6DCEFF413'
  }, {
    id: 'Ungroup',
    uuid: 'B82F4BAA-0CAA-412A-B3BD-5B69F52E023D'
  }, {
    id: 'Toggle Active',
    uuid: '34B4C1BD-73E4-493B-931F-9AB8C10BAB00'
  }, {
    id: 'Activate',
    uuid: 'C1E7EE22-6F9F-4B13-8DA4-34B31351738B'
  }, {
    id: 'Deactivate',
    uuid: '0C26B95A-A36D-4CFF-A420-2C429FA669A8'
  }, {
    id: 'Delete',
    uuid: '80981D0B-2C0B-4F37-B2F7-E3FBE4AD5C3F'
  }, {
    id: 'Delete Special',
    uuid: 'EAE71586-C0C1-4D57-B05E-E22B072EE734'
  }, {
    id: 'Select All',
    uuid: 'B57C53D8-29DE-4CE9-9E1E-2FE0665125CA'
  }, {
    id: 'Unselect All',
    uuid: '3E4FF2CE-2532-47EF-97EF-92FB73F024C2'
  }, {
    id: 'Rename',
    uuid: 'CD488565-4DAC-46A7-A75F-3932B9EF6283'
  }, {
    id: 'Click button',
    uuid: '4A341E18-8FFA-4ABA-A94E-774450ABE723'
  }, {
    id: 'Activate item',
    uuid: '3F3D33A7-213F-40B4-B4EF-B7C1E074D4CE'
  }, {
    id: 'Cancel Dialog',
    uuid: 'B80184F5-9AD4-472F-8E6B-D21BD01D743A'
  }, {
    id: 'Dialog: Yes',
    uuid: 'CA3260CA-3D23-4573-8400-4AD9F09520F6'
  }, {
    id: 'Dialog: No',
    uuid: '34C4F16C-FC84-403A-9BC0-3A4377968F2F'
  }, {
    id: 'Dialog: OK',
    uuid: 'BDAD6C3F-C939-4269-94D4-F401405F582F'
  }, {
    id: 'Delete character to left of cursor',
    uuid: 'FF3A46BB-286D-47D9-A459-88B9B283C434'
  }, {
    id: 'Delete character to right of cursor',
    uuid: '24ECD571-EF48-4311-81C8-C3DD59C63D89'
  }, {
    id: 'Insert new line',
    uuid: '97E601FF-1D1B-4EC0-81EC-66A34F05EB9B'
  }, {
    id: 'Commit text',
    uuid: '28F6D82D-F489-44EC-8E6C-8C2A68384EB6'
  }, {
    id: 'Reload',
    uuid: '871B3CE9-7ED8-487F-A9E3-8BBCC47AF562'
  }, {
    id: 'Previous history entry',
    uuid: '94AEF9F4-A93A-486F-AA8A-D63DF12A91EF'
  }, {
    id: 'Next history entry',
    uuid: 'F70EFCD5-183B-46FB-856F-90C2F313018C'
  }, {
    id: 'Move cursor left',
    uuid: 'BAE26DC2-C92D-40C6-913D-E88AFCAB2A68'
  }, {
    id: 'Move cursor right',
    uuid: 'C6E8F5EC-3DB6-4A39-B196-6F8A0360AADA'
  }, {
    id: 'Move cursor up',
    uuid: 'C4586C00-DF59-4B86-A8FC-F5031AF1B10A'
  }, {
    id: 'Move cursor down',
    uuid: '81D3AB2B-9027-40D7-B747-A8B11AE0A5CF'
  }, {
    id: 'Move cursor to start of document',
    uuid: '02E35FAF-A369-47BE-85AF-766794E94B79'
  }, {
    id: 'Move cursor to end of document',
    uuid: 'E40BF379-C36A-49A3-9464-031C2C949CFB'
  }, {
    id: 'Move cursor to start of line',
    uuid: 'F76CFEFF-C84B-4615-96B9-9BCA43CB8989'
  }, {
    id: 'Move cursor to end of line',
    uuid: '01F0DC29-B6E6-4930-B9D8-FDAECD8C4C02'
  }, {
    id: 'Move cursor word left',
    uuid: '830B44E1-C9C3-47D3-8D0E-EDF146A50BB5'
  }, {
    id: 'Move cursor word right',
    uuid: 'AC110484-EF1E-4165-B6A3-D6FB9D7BEDE6'
  }, {
    id: 'Move cursor and extend selection left',
    uuid: '12105243-99F9-4601-9140-0949B2EEE637'
  }, {
    id: 'Move cursor and extend selection right',
    uuid: '66433D41-A342-4A4C-91EA-40C95741D97A'
  }, {
    id: 'Move cursor and extend selection up',
    uuid: '50143210-9508-4C16-8A8C-898AD116D1D5'
  }, {
    id: 'Move cursor and extend selection down',
    uuid: 'C6AAAC12-7DBE-4FBC-BE0B-BAADBF7F7807'
  }, {
    id: 'Move cursor and extend selection to start of document',
    uuid: '6F59E689-7246-4EE8-883D-55CACCF9224E'
  }, {
    id: 'Move cursor and extend selection to end of document',
    uuid: '3BAD856D-E5F9-4682-9DBB-41FFA80C252B'
  }, {
    id: 'Move cursor and extend selection to start of document',
    uuid: '6F59E689-7246-4EE8-883D-55CACCF9224E'
  }, {
    id: 'Move cursor and extend selection to end of document',
    uuid: '3BAD856D-E5F9-4682-9DBB-41FFA80C252B'
  }, {
    id: 'Move cursor and extend selection word left',
    uuid: 'E3D1AA71-6382-429D-B717-B565C47C4C97'
  }, {
    id: 'Move cursor and extend selection word right',
    uuid: '19BEF918-8ECE-41F8-8DA2-3C928C6F5698'
  }, {
    id: 'Select first item',
    uuid: '35DAE3B4-0CD1-4917-AD18-66D6808EB902'
  }, {
    id: 'Select last item',
    uuid: '05119F21-4D45-4E35-8034-47C1809338AD'
  }, {
    id: 'move_selection_cursor_to_first_item',
    uuid: '3470BE56-CA83-40B6-94D8-2F7371E789EA'
  }, {
    id: 'move_selection_cursor_to_last_item',
    uuid: '8A570E89-3B67-44D5-ABCB-48694F4BA670'
  }, {
    id: 'move_selection_cursor_to_next_item',
    uuid: '6C3B96CC-923F-4D59-8BFC-207C0C989075'
  }, {
    id: 'move_selection_cursor_to_previous_item',
    uuid: '23F4E15F-3BD9-4483-8E5B-6B6A6389A831'
  }, {
    id: 'Extend selection range to first item',
    uuid: '209EF40B-628E-4E14-B245-6F6F1F9ADA27'
  }, {
    id: 'Extend selection range to last item',
    uuid: 'EE0B874E-946D-4843-B77B-ED127AF13E8C'
  }, {
    id: 'Extend selection to next item',
    uuid: 'BBB54760-FAF7-4F76-94D0-AB60988451C3'
  }, {
    id: 'Extend selection range to previous item',
    uuid: 'BC967234-E3B1-43D3-937A-98228A666C71'
  }, {
    id: 'Extend selection to first item',
    uuid: 'CEB58504-6FDF-4D8F-9C51-FA1B515F1188'
  }, {
    id: 'Extend selection to last item',
    uuid: '0A6EBA3E-4D80-4EE8-9B6D-DAD7F59C878B'
  }, {
    id: 'Select previous item',
    uuid: '58621FD0-CA79-421B-B4C0-3E3C37AEACC9'
  }, {
    id: 'Select next item',
    uuid: '465E1217-698F-4F56-BE3F-84B722A8CF97'
  }, {
    id: 'Extend selection to next item',
    uuid: 'BBB54760-FAF7-4F76-94D0-AB60988451C3'
  }, {
    id: 'Extend selection to previous item',
    uuid: '5A352D0C-DD01-4C6D-96C1-2B008C8C448E'
  }, {
    id: 'Toggle selection of item at cursor',
    uuid: '5CA48A16-15C8-4355-94CD-4737C0D5DC72'
  }, {
    id: 'Select item in next lane',
    uuid: 'FAD38154-0AF6-4A0E-85BB-31FAFACEC3B0'
  }, {
    id: 'Select item in previous lane',
    uuid: 'E73E505F-4C9D-484D-997F-7417FADBA037'
  }, {
    id: 'Select item in first lane',
    uuid: '4F3C74CC-3018-4D42-95FA-6B95540369DA'
  }, {
    id: 'Select item in last lane',
    uuid: 'B8BE1706-0AFF-4FB8-8D3D-CB44E6A947D7'
  }, {
    id: 'Move cursor to next lane',
    uuid: '10A4E2D0-B52E-4861-9C63-7305195F32A8'
  }, {
    id: 'Move cursor to previous lane',
    uuid: '3098964E-3BD9-4F31-9CFB-1CE1AEBA79C0'
  }, {
    id: 'Move cursor to first lane',
    uuid: '5F821617-5EAD-4614-AA00-964D9B47E953'
  }, {
    id: 'Move cursor to last lane',
    uuid: '5489BBD3-F80A-4430-AE5F-969ECF814884'
  }, {
    id: 'Extend selection to next lane',
    uuid: '84A019A3-8744-4BA7-9212-6DED22E24E5A'
  }, {
    id: 'Extend selection to previous lane',
    uuid: '1DAB956D-4BF8-435A-93C8-078313FB5CBF'
  }, {
    id: 'Extend selection to first lane',
    uuid: 'BB2A6F3D-4B70-4895-801F-171FB1A48C45'
  }, {
    id: 'Extend selection to last lane',
    uuid: '72801F9F-DB19-4C7B-8268-514DD339EAEB'
  }, {
    id: 'Extend selection range to next lane',
    uuid: '23BE3009-FE08-4C37-8504-1658B4E4E834'
  }, {
    id: 'Extend selection range to previous lane',
    uuid: '1C06EE4C-648C-4B45-B64B-F34DBBFA63D5'
  }, {
    id: 'Extend selection range to first lane',
    uuid: '8D7B8F1B-17D3-4EF7-B005-D1FDF768BFFA'
  }, {
    id: 'Extend selection range to last lane',
    uuid: '91C3C3BD-1EA0-4550-AA70-C1C34D31F9A6'
  }, {
    id: 'Select item to left',
    uuid: 'A715B935-880F-487E-BBDB-BA7E48F7BDE9'
  }, {
    id: 'Select item to right',
    uuid: 'F5DA0726-556A-47F1-9ED0-BB0D2E9BD2CD'
  }, {
    id: 'Select item above',
    uuid: '9DE02002-B70B-45B2-89C7-1B4103E764AA'
  }, {
    id: 'Select item below',
    uuid: 'A017213F-7F54-41E1-9774-0A43744C1528'
  }, {
    id: 'Move selection cursor left',
    uuid: '0FE42C76-CEB0-448B-8C9E-7F18CAAECBB1'
  }, {
    id: 'Move selection cursor right',
    uuid: 'E1FFB4AB-F3AB-44CC-8C84-1D024342A939'
  }, {
    id: 'Move selection cursor up',
    uuid: 'CBE84639-9A14-4702-82DC-C7320C76A932'
  }, {
    id: 'Move selection cursor down',
    uuid: 'E4E3CA29-5D32-4546-9855-F18761F2C35F'
  }, {
    id: 'Extend selection range to item to left',
    uuid: 'D78A5132-DE08-41A8-B9B4-E1AD3CA4A1A1'
  }, {
    id: 'Extend selection range to item to right',
    uuid: 'A6EED2D3-C5AD-4EB7-927B-766032DA363C'
  }, {
    id: 'Extend selection range to item above',
    uuid: '5F47819C-37AC-43AF-A11F-2047F470D425'
  }, {
    id: 'Extend selection range to item below',
    uuid: 'AE3491F1-DB78-4E42-B8D7-1D41540F82D1'
  }, {
    id: 'Extend selection to item to left',
    uuid: '9D8E9944-46F8-476A-8FEC-39D50E74B38E'
  }, {
    id: 'Extend selection to item to right',
    uuid: '54C5EC19-C511-41B2-A6AA-88DE7ED0AA08'
  }, {
    id: 'Extend selection to item above',
    uuid: 'F8D28DCF-6854-4E8F-82D1-EB7D0D361AA8'
  }, {
    id: 'Extend selection to item below',
    uuid: '00BAA2A6-B7AB-43EF-B5A2-5CCE6913D699'
  }, {
    id: 'Focus panel to the left',
    uuid: 'A798862B-1323-42C7-BA78-3ED87CBFAA05'
  }, {
    id: 'Focus panel to the right',
    uuid: '7A46DDBA-F5BC-499F-94EC-3BC6D616A790'
  }, {
    id: 'Focus panel above',
    uuid: '91864A8C-F453-414D-9794-706C40286E9E'
  }, {
    id: 'Focus panel below',
    uuid: '0BC8AE5D-7491-46C6-9244-E1C88BF161E5'
  }, {
    id: 'Focus next panel',
    uuid: 'E6750B94-CDF1-47AF-A0EC-8442A32AB9D1'
  }, {
    id: 'Focus previous panel',
    uuid: '49D77069-86D8-4AB4-9C01-60120723D2E3'
  }, {
    id: 'Focus next field',
    uuid: '5A819789-DAB4-4FEF-9170-7470F5AE54AE'
  }, {
    id: 'Focus previous field',
    uuid: '92560751-3736-4687-AF2C-88D45522F558'
  }, {
    id: 'Focus widget to the left',
    uuid: '0517EEBC-8390-439E-B143-04D9A55EEA94'
  }, {
    id: 'Focus widget to the right',
    uuid: '728207FC-D4D1-4C01-AE8A-6E14F1EE68C0'
  }, {
    id: 'Focus widget above',
    uuid: 'BB06397B-5345-479E-B4D1-3F8CD633B58E'
  }, {
    id: 'Focus widget below',
    uuid: 'AA01C33A-B9E8-408C-86AF-183AFAA09EEA'
  }, {
    id: 'Toggle expanded state',
    uuid: 'C2912933-9DEF-42B9-BBDA-967A740876F1'
  }, {
    id: 'Zoom In',
    uuid: 'A2F53693-725A-40A1-960E-4D2349F8D0D4'
  }, {
    id: 'Zoom Out',
    uuid: '187DB9AA-D897-4230-9D86-9F6B9726AC29'
  }, {
    id: 'Zoom to Fit',
    uuid: 'A409DF67-293C-46F0-B606-87CA8EEDBEAB'
  }, {
    id: 'Maximize window',
    uuid: 'CF1E5067-48C3-49E6-B472-7C69B8D811C4'
  }, {
    id: 'Minimize window',
    uuid: '08836CB9-0E67-4001-BCF7-0ED318412A32'
  }, {
    id: 'Full screen',
    uuid: 'C86F4BA9-D702-4BED-B1C3-E61195F95C0F'
  }, {
    id: 'Select Next Project',
    uuid: '0D526104-2308-4920-A24D-368BE00B1A04'
  }, {
    id: 'Select Previous Project',
    uuid: '3D1BED9B-D683-4365-8C31-DC7D1D8443EF'
  }, {
    id: 'select_next_tab',
    uuid: 'B2208FFB-6631-44D6-9E94-B735CD4EE16F'
  }, {
    id: 'select_previous_tab',
    uuid: 'CB8DAB9A-2CA0-4A20-BB1F-F1B0BE23C4B9'
  }, {
    id: 'Connect to Remote Project',
    uuid: '5B637A20-1E68-4147-A785-3AAB7083E9DD'
  }, {
    id: 'Show Controller Script Console',
    uuid: 'F307E7AC-806D-456B-ACA1-46C1B0C3B237'
  }, {
    id: 'help_user_guide',
    uuid: 'B768A17A-4836-4125-9D18-FCA4492B4100'
  }, {
    id: 'help_user_guide_jp',
    uuid: '75AA0299-524E-4EE0-B996-24298E1F8921'
  }, {
    id: 'check_for_updates',
    uuid: '6C69A7EE-E1BA-4E21-AC93-9A413860EE42'
  }, {
    id: 'invoke_action',
    uuid: 'E489E12F-E480-4040-86AF-37F3EC537BB1'
  }, {
    id: 'Collect and Save',
    uuid: 'B69863F6-FB37-4DFC-BF99-059546640536'
  }, {
    id: 'Activate Engine For Project',
    uuid: '59BCC7B1-92AF-479B-9287-73B2576CD023'
  }, {
    id: 'Create Instrument Track',
    uuid: '3A34D4BA-3FA4-49AC-BC3E-9254123283EA'
  }, {
    id: 'Create Audio Track',
    uuid: '616A9F6D-9681-435A-90AC-98769DF57E3E'
  }, {
    id: 'Create Effect Track',
    uuid: '1C93F5D0-A13A-403A-8412-33F0EA0BEC7A'
  }, {
    id: 'Create Scene',
    uuid: 'A0DEA1FB-682A-4FE5-BDB6-5E2E5E8C0D39'
  }, {
    id: 'Create Event',
    uuid: 'DD377D1A-D10A-4637-8333-D4A9AE0CAE38'
  }, {
    id: 'Select previous track',
    uuid: '1D9664B4-B7F8-4CFD-8C4F-4228A76DB79D'
  }, {
    id: 'Select next track',
    uuid: 'D1DD788B-0188-4608-B660-DB7BBEB74737'
  }, {
    id: 'focus_track_header_area',
    uuid: '67504A45-ABE8-4508-944A-F7A2B906D5FC'
  }, {
    id: 'toggle_clip_launcher',
    uuid: '3E8CD1D5-741A-4557-9304-CCDFE587322E'
  }, {
    id: 'focus_or_toggle_clip_launcher',
    uuid: '901E5883-DF31-4DDB-BBB0-7E9EE184888B'
  }, {
    id: 'Play Transport',
    uuid: '1AA3B23B-93AD-426B-8B47-0FC6148191EA'
  }, {
    id: 'Continue Play Transport',
    uuid: '92746EDD-E3D8-47D1-95CF-E05E1566AE06'
  }, {
    id: 'Play Transport From Start',
    uuid: '9BEDD409-0F42-473C-8A23-E04F5EBFA3C9'
  }, {
    id: 'Stop Transport',
    uuid: '5138E60E-C83D-4830-A44D-8B5128081273'
  }, {
    id: 'Play or Stop Transport',
    uuid: 'A7B0AD7A-747C-4F78-B76E-5B1C4806FBF4'
  }, {
    id: 'Play or Pause Transport',
    uuid: '53D291F3-71AD-4D25-8C35-53462D39E693'
  }, {
    id: 'Continue Playback or Stop',
    uuid: 'C1BB8103-1435-4EE1-81EB-B339D4527659'
  }, {
    id: 'Play From Start or Stop Transport',
    uuid: 'CA3C229E-8DF0-47E9-8208-1B2DEDC78130'
  }, {
    id: 'Toggle Record',
    uuid: '9C785C4C-9409-42A8-9F5E-8A0B75690092'
  }, {
    id: 'Tap Tempo',
    uuid: 'EF14F011-53DC-4ECD-B3CF-1CC9EE126082'
  }, {
    id: 'Export Audio',
    uuid: '10FBEA53-10EB-4EAB-A297-69B76566123F'
  }, {
    id: 'export_midi',
    uuid: 'E5A82841-70E2-4D40-8126-D80A0C996564'
  }, {
    id: 'Select Pointer Tool',
    uuid: '3E113B80-D2AE-4BD1-B686-66E8454FFA83'
  }, {
    id: 'select_time_selection_tool',
    uuid: 'C20A5F30-04A0-430D-B554-A401D089681C'
  }, {
    id: 'Select Pen Tool',
    uuid: '37535E9D-EE9E-43D5-BB48-E4FA87A1E5A2'
  }, {
    id: 'Select Eraser Tool',
    uuid: '931D8160-AB6F-4564-AA51-E6959754FDD7'
  }, {
    id: 'Select Knife Tool',
    uuid: 'DF33F10A-1209-4C3C-B739-7CE1B7E2AFF0'
  }, {
    id: 'toggle_browser_panel',
    uuid: '69A730E0-3EF7-4675-A9E0-EA7C14398735'
  }, {
    id: 'toggle_device_panel',
    uuid: '7A108699-D0CF-4D51-BD03-0A5444307599'
  }, {
    id: 'toggle_arranger',
    uuid: 'C85F80A5-CEB8-459D-9A97-64172BD78C72'
  }, {
    id: 'toggle_detail_editor',
    uuid: '713FF4D8-FDF9-425E-8FAE-DB19BAD0E8EE'
  }, {
    id: 'toggle_automation_editor',
    uuid: '80011511-47A3-487A-ABF3-8D2B02BF5018'
  }, {
    id: 'toggle_mixer',
    uuid: 'B2228BD8-9941-487D-84B0-058024C26F39'
  }, {
    id: 'toggle_inspector',
    uuid: 'D958AABB-E9A1-436D-A568-EFABBC01AE3F'
  }, {
    id: 'toggle_studio_io',
    uuid: '4E35299A-3DA6-42B2-9FFE-DA4C424BFF44'
  }, {
    id: 'toggle_song_panel',
    uuid: '8054FCEE-2B2B-4F46-B770-C9FB3EBF38C5'
  }, {
    id: 'focus_or_toggle_browser_panel',
    uuid: 'D51D37B9-0DFB-483A-B61B-89C1118BBF22'
  }, {
    id: 'focus_or_toggle_device_panel',
    uuid: '8815146B-3ED3-433A-8C9A-2262A3B8A206'
  }, {
    id: 'focus_or_toggle_arranger',
    uuid: '34BC8606-A677-412F-B329-D87A750872D8'
  }, {
    id: 'focus_or_toggle_detail_editor',
    uuid: '2DFFF858-C4D8-4953-9C9E-799C67DF6302'
  }, {
    id: 'focus_or_toggle_automation_editor',
    uuid: '7A3A161A-9D47-43EF-B8F6-0E42B0429CF6'
  }, {
    id: 'focus_or_toggle_mixer',
    uuid: 'F4C6C58B-C0B8-4CF5-9C68-1BC2F3E4A6F2'
  }, {
    id: 'focus_or_toggle_inspector',
    uuid: '2D1DB71B-191B-4CEC-8E10-FB1E8941764E'
  }, {
    id: 'focus_or_toggle_studio_io',
    uuid: 'A3842171-E9BA-423F-B02A-1DE9CFCA79BC'
  }, {
    id: 'focus_or_toggle_song_panel',
    uuid: 'E1539943-92B6-49DC-BED4-1C3CF7249D40'
  }, {
    id: 'Switch to Mode 1',
    uuid: '3CC21C52-9D83-4840-996E-FA3D787342CC'
  }, {
    id: 'Switch to Mode 2',
    uuid: '2A47BAD3-5182-4755-AA7B-F76DC3B4895D'
  }, {
    id: 'Switch to Mode 3',
    uuid: 'BA8B72C5-6BA3-4068-9D22-D77E74307738'
  }, {
    id: 'Switch to Mode 4',
    uuid: '78EA378B-211B-405F-A02F-856EB1F1CA50'
  }, {
    id: 'Select Next Mode',
    uuid: 'FC7F2D74-5927-479A-97AD-650BD3549B43'
  }, {
    id: 'Select Previous Mode',
    uuid: '94CB87D4-6EE2-428B-9014-CF1DE5A30450'
  }, {
    id: 'Toggle maximized editing mode',
    uuid: '89DFB091-BB28-49C6-AFFB-70FAD5C27F96'
  }, {
    id: 'Select sub panel 1',
    uuid: '6D22922F-D78C-4D8A-9B62-A95846ECB186'
  }, {
    id: 'Select sub panel 2',
    uuid: 'C29D25A8-A45C-4006-A68D-0AE6F87DC7CB'
  }, {
    id: 'Select sub panel 3',
    uuid: 'C6E0B098-65B4-4962-A46A-933676D4AB37'
  }, {
    id: 'Select sub panel 4',
    uuid: '776F4B9A-DDA4-4283-BF8B-5C5FCF38B025'
  }, {
    id: 'Select next sub panel',
    uuid: '6BC392ED-B766-4EAA-91AE-BBBF2CDD738D'
  }, {
    id: 'Select previous sub panel',
    uuid: '65DCADFB-529F-45B9-A2D5-1F3B84E71E87'
  }, {
    id: 'Show Track Inputs and Outputs',
    uuid: 'FF600291-FAB5-4582-81EE-276C03904252'
  }, {
    id: 'Show Sends',
    uuid: '324E3D20-4536-46D6-970F-B6274B4DF008'
  }, {
    id: 'Show Crossfades',
    uuid: 'F83991CE-2B48-4621-B338-01FD9A0FDA08'
  }, {
    id: 'Show Effect Tracks',
    uuid: 'C6204C84-0830-4444-97B4-E73D7C8E8DC4'
  }, {
    id: 'Split',
    uuid: '81C926BF-CCE7-4027-98F8-038136A51C1F'
  }, {
    id: 'Consolidate',
    uuid: 'F3B2EF6D-81BF-41A5-BB25-467DFEBEC4AC'
  }, {
    id: 'bounce_in_place',
    uuid: '709573AF-2A14-4227-AA09-14956D536733'
  }, {
    id: 'bounce',
    uuid: '7774C5E8-4913-47C5-92BB-31656273E58D'
  }, {
    id: 'Transpose Semitone Down',
    uuid: '253D4849-FD8F-47FE-93C3-F431E364B0A5'
  }, {
    id: 'Transpose Semitone Up',
    uuid: '66F81B7D-8EE6-495C-A5D2-831B7350218E'
  }, {
    id: 'Transpose Octave Down',
    uuid: '638AD000-6FF2-49F1-AB0C-259887FC69ED'
  }, {
    id: 'Transpose Octave Up',
    uuid: '99038043-F710-4990-B7DF-DCD1329B30C7'
  }, {
    id: 'Quantize',
    uuid: '5C81B286-2337-4AB1-B96B-DF2A6DA5286D'
  }, {
    id: 'legato',
    uuid: 'E59DAD35-F515-4C92-AC7D-965AA8C83AD2'
  }, {
    id: 'fixed_length',
    uuid: '9A701140-E54D-43B1-9013-3E4BE0E20DBD'
  }, {
    id: 'Loop Selection',
    uuid: '0C20E5DD-79B5-46E0-937B-591EB20E035F'
  }, {
    id: 'Toggle Track Timeline vs. Clip Content Editing',
    uuid: 'A6007505-D1AA-4F7F-A5F5-828464C0F6A4'
  }, {
    id: 'Toggle Arranger Cue Marker Visibility',
    uuid: '4E46A4C5-577B-40E4-97F1-57E3BCF2582F'
  }, {
    id: 'nudge_events_one_bar_earlier',
    uuid: '6F4494A9-25D6-42F6-91D2-839ADB616E3F'
  }, {
    id: 'nudge_events_one_step_earlier',
    uuid: '623EC344-D750-400B-AB4B-2B1775DACC0F'
  }, {
    id: 'nudge_events_one_bar_later',
    uuid: 'F5C80409-78FC-4689-B147-3A4BB79364FE'
  }, {
    id: 'nudge_events_one_step_later',
    uuid: 'EFB8F591-C209-4C96-9D5E-568CA39CA8A6'
  }, {
    id: 'make_events_one_bar_shorter',
    uuid: '5BA5CDA3-687E-4EF9-89E1-77D4BC59A88A'
  }, {
    id: 'make_events_one_step_shorter',
    uuid: 'E3F7AF35-AEF7-4BAD-8572-6BDC640F2C32'
  }, {
    id: 'make_events_one_bar_longer',
    uuid: 'C78BDE01-D080-4935-B32B-BE8EA18026B7'
  }, {
    id: 'make_events_one_step_longer',
    uuid: '56E06F40-7777-427A-9957-D6DFB9990D8F'
  }, {
    id: 'double_grid_size',
    uuid: '0DD86A63-8B7D-4F3B-9ABD-3A2EB22DEC00'
  }, {
    id: 'half_grid_size',
    uuid: '50096AE5-2482-4760-B974-4AEC7FC23E20'
  }, {
    id: 'toggle_object_snapping',
    uuid: 'EA9F287E-E0D1-4C32-B74F-E77AA96DED54'
  }, {
    id: 'toggle_absolute_grid_snapping',
    uuid: '29CC9A5A-ED3D-488B-A0D5-D4CA92C0F470'
  }, {
    id: 'toggle_relative_grid_snapping',
    uuid: '3AC47348-494F-4413-9EC7-CD90FAC58F14'
  }, {
    id: 'toggle_adaptive_grid',
    uuid: '00543B1F-BB8C-4A6A-AD3B-9296270CF5A9'
  }, {
    id: 'prev_grid_subdivision',
    uuid: 'FDFE5413-4ECC-44A4-8747-70F91FC4F891'
  }, {
    id: 'next_grid_subdivision',
    uuid: 'E9AE9A09-129C-44D6-8E32-09F56AEC2533'
  }, {
    id: 'adjust_event_value_step_up',
    uuid: 'BCF56C74-06B3-4290-B142-552F158E207D'
  }, {
    id: 'adjust_event_value_step_down',
    uuid: 'EBDC5ABD-1177-48F5-A216-28595D09631A'
  }, {
    id: 'adjust_event_value_fine_step_up',
    uuid: '0F47C3C0-D291-45E7-AC89-B75CE871A8FA'
  }, {
    id: 'adjust_event_value_fine_step_down',
    uuid: 'FFDF116B-4A94-431D-BA2E-E74157FB9518'
  }, {
    id: 'Create New Instrument',
    uuid: '9D9C7919-8DAB-4946-9058-5A661E76755D'
  }, {
    id: 'Create New Audio Effect',
    uuid: 'A0CC4EFA-4F66-4242-B0B4-8EA5CBDA124E'
  }, {
    id: 'Create New Note Effect',
    uuid: '09BA624B-A487-457D-866E-8193CAE80EBC'
  }, {
    id: 'Create New Detector',
    uuid: '31DA02FF-9BEC-47BD-9EEC-A0FA93D0380F'
  }, {
    id: 'Nudge Left',
    uuid: '7D8D7D02-A280-4374-9016-0D646BF1C0DA'
  }, {
    id: 'Nudge Right',
    uuid: 'E6704E1B-4042-4963-882D-688F80A5565A'
  }, {
    id: 'Nudge Up',
    uuid: '6E3E5412-9A56-4F96-9037-BA65CA1E8323'
  }, {
    id: 'Nudge Down',
    uuid: '603CB2AE-2C2F-4D54-A1F5-2821D152D3CF'
  }, {
    id: 'Nudge Left (coarse)',
    uuid: '9F3F3FD4-49BD-4715-9F6B-861913F8A2A4'
  }, {
    id: 'Nudge Right (coarse)',
    uuid: '3C3AA4F3-12B7-4FEA-A8F9-F7E337929A45'
  }, {
    id: 'Nudge Up (coarse)',
    uuid: 'A45D8CDC-81EC-43BF-8806-383A428D324F'
  }, {
    id: 'Nudge Down (coarse)',
    uuid: 'F0C988EC-A4AA-49AA-9C33-346CE26CCD4E'
  }, {
    id: 'Increase Width',
    uuid: '4FCF8987-DC30-4D45-AD2C-0AF53D063BEE'
  }, {
    id: 'Decrease Width',
    uuid: 'D1BD0FC1-8835-4C2C-A0F6-A42A55CDB650'
  }, {
    id: 'Increase Height',
    uuid: '1D46751F-597A-4C26-BEE0-7CE55132B38F'
  }, {
    id: 'Decrease Height',
    uuid: 'FA69F56C-DD70-4058-80F7-3B6C6A0D04FE'
  }, {
    id: 'Bring To Front',
    uuid: 'F8FC4E9C-57EE-4B94-9912-49E5D41A3A58'
  }, {
    id: 'Send To Back',
    uuid: '97B427E1-50F1-4A70-BD65-7B0EEA874151'
  }, {
    id: 'focus_browser_search_field',
    uuid: 'BDC9903E-9A75-4C13-81B0-7801BB8F95FA'
  }, {
    id: 'focus_file_overview',
    uuid: '25274FF8-4058-43B4-B6F3-7F5967279B5F'
  }, {
    id: 'focus_file_list',
    uuid: '022CC985-7B4D-4FAF-BDB9-A22504BAF44B'
  }, {
    id: 'toggle_preview_playback_of_selected_file',
    uuid: 'CDFBBBDF-4CE3-4FB1-82EC-AEB0B1F6E09C'
  }, {
    id: 'open_containing_folder',
    uuid: '645E1A44-5597-43EE-BF46-4B4E2BABF6AD'
  }, {
    id: 'edit_file_meta_data',
    uuid: '8A30B7D5-A9FB-4479-9A40-080B7BB1CF69'
  }, {
    id: 'Launch slot',
    uuid: '35659DCF-5BE9-47F2-88A1-6753E1EB7447'
  }, {
    id: 'slice_to_drum_track',
    uuid: 'A294375E-7CC7-4854-9595-1C648F529D05'
  }, {
    id: 'slice_to_multi_sampler_track',
    uuid: 'BF1EA992-1EDD-4F6F-B953-069C240E1245'
  }, {
    id: 'insert_silence',
    uuid: '81D9FA4E-B9B8-4AB4-BA58-A7961AA6C93B'
  }, {
    id: 'cut_and_pull',
    uuid: 'D453FD7B-04A1-4D57-B931-1B4CCD3B8C9A'
  }, {
    id: 'paste_and_push',
    uuid: '97A30254-A11D-4F69-B5CD-CC510ED83267'
  }, {
    id: 'duplicate_and_push',
    uuid: 'EDC7D10F-D787-4F74-AD6E-6FBDCCC6D3FD'
  }, {
    id: 'delete_and_pull',
    uuid: 'F79875CD-B6B1-4E71-AC1C-FC19B3046EA3'
  }, {
    id: 'toggle_folded_note_lanes',
    uuid: '4048C91A-5698-4148-9EAF-B554CFB9E514'
  }, {
    id: 'toggle_double_or_single_row_track_height',
    uuid: 'EF71E427-FB2A-4AE1-9765-75865FC86345'
  }, {
    id: 'unlock_all_layers',
    uuid: 'B3BCC847-001D-43ED-9612-C2032C676A0F'
  }, {
    id: 'toggle_layer_lock',
    uuid: 'AE09F30F-D0CC-41AA-A8CF-732CB7CF30F4'
  }, {
    id: 'toggle_layer_visibility',
    uuid: 'A036B219-3036-40CE-BE48-E609A8F91725'
  }
];

exports.extended_ids = [
  {
    id: 'cursor track - activated - toggle',
    uuid: 'E46C6522-03F7-4056-9F94-FBE8D3674AFB'
  }, {
    id: 'cursor track - volume - +10%',
    uuid: '8802040A-2266-4F70-A19D-71C34E04D9B1'
  }, {
    id: 'cursor track - volume - +1%',
    uuid: 'C4EA90F9-34B5-4DF2-B218-4C7AE00DE7AE'
  }, {
    id: 'cursor track - volume - -1%',
    uuid: 'BAB65BCD-8C25-43A7-BE0D-5599DB12B7E8'
  }, {
    id: 'cursor track - volume - -10%',
    uuid: '2F2531B9-824E-4CC0-B5F2-F59959FFAAFB'
  }, {
    id: 'cursor track - volume - reset',
    uuid: 'E843DDFE-0D70-4FEE-B452-EB618A388956'
  }, {
    id: 'cursor track - pan - right 10%',
    uuid: 'A51FA179-0ED8-4667-9503-95081ECA987A'
  }, {
    id: 'cursor track - pan - right 1%',
    uuid: 'E3047EB3-7956-43BA-BAF3-E4C3ACA166AD'
  }, {
    id: 'cursor track - pan - left 1%',
    uuid: '09507833-DEC1-48BC-B77E-2E3CF4DB45A2'
  }, {
    id: 'cursor track - pan - left 10%',
    uuid: '83CE33B6-AA8C-4606-B256-586CAE21DD91'
  }, {
    id: 'cursor track - pan - reset',
    uuid: 'C8AE8B0C-5068-4E63-A7FF-32A2371353EE'
  }, {
    id: 'cursor track - mute - toggle',
    uuid: '9E00086E-78FB-4A6A-92D1-F52858C5EB62'
  }, {
    id: 'cursor track - solo - toggle',
    uuid: '49C65227-C8A4-48CD-8C98-24A63E4E2916'
  }, {
    id: 'cursor track - send S1 - +10%',
    uuid: 'F2940EAF-5950-427A-8DB6-5F371C61C135'
  }, {
    id: 'cursor track - send S1 - +1%',
    uuid: '92C3B055-295C-446D-9DE0-E0ED91FBF9AB'
  }, {
    id: 'cursor track - send S1 - -1%',
    uuid: '882E41F7-7A8C-474A-AB65-A65AC6213F7E'
  }, {
    id: 'cursor track - send S1 - -10%',
    uuid: '75852150-E10F-4619-8C06-8F7CD7AA03BD'
  }, {
    id: 'cursor track - send S1 - reset',
    uuid: '4A2C3ED8-2D95-4C46-8D5E-E887C71C3F1D'
  }, {
    id: 'cursor track - send S2 - +10%',
    uuid: '02AD4A52-836D-49ED-AADE-31ADB69A1A4C'
  }, {
    id: 'cursor track - send S2 - +1%',
    uuid: '7CB6EB8E-0DC4-4BBC-AC4F-163B26DF9ECD'
  }, {
    id: 'cursor track - send S2 - -1%',
    uuid: '36AEF03D-40DF-4432-93F2-DD35AA4A75BF'
  }, {
    id: 'cursor track - send S2 - -10%',
    uuid: 'B1CFFE09-F177-4DD8-B423-DBC495FE0D29'
  }, {
    id: 'cursor track - send S2 - reset',
    uuid: '0BDE4FA5-731B-411C-A894-93A4B80ABD9A'
  }, {
    id: 'cursor track - send S3 - +10%',
    uuid: 'B2ED547C-6CA7-43BF-9E01-50AC956A36A5'
  }, {
    id: 'cursor track - send S3 - +1%',
    uuid: '195C9AF8-0D5A-4DE9-8DBA-E431703426ED'
  }, {
    id: 'cursor track - send S3 - -1%',
    uuid: '195C9AF8-0D5A-4DE9-8DBA-E431703426ED'
  }, {
    id: 'cursor track - send S3 - -10%',
    uuid: 'B2ED547C-6CA7-43BF-9E01-50AC956A36A5'
  }, {
    id: 'cursor track - send S3 - reset',
    uuid: '40A8CEE1-D169-4C70-BE1B-434FFBAE438F'
  }, {
    id: 'cursor track - send S4 - +10%',
    uuid: '397464DB-2BF1-42BA-9CDE-943777CB45D9'
  }, {
    id: 'cursor track - send S4 - +1%',
    uuid: '72540A20-EAE0-4673-9BBD-37B3B96F528F'
  }, {
    id: 'cursor track - send S4 - -1%',
    uuid: '18976E8D-E117-4014-BB89-8F6A79DDFA18'
  }, {
    id: 'cursor track - send S4 - -10%',
    uuid: '529622EC-40A2-4AFD-BBB3-951C36A502FF'
  }, {
    id: 'cursor track - send S4 - reset',
    uuid: 'AA07EBDA-B1BF-4C47-8424-0E63887181A5'
  }, {
    id: 'cursor track - arm - toggle',
    uuid: '07DE9928-C4F5-4850-B3AC-4E9A60E6C156'
  }, {
    id: 'cursor track - monitor - toggle',
    uuid: '0BB913AE-7837-4E93-B1F4-5A3681896F73'
  }, {
    id: 'cursor track - auto monitor - toggle',
    uuid: '4CE6628C-FB16-4808-9D0A-5785FFC2E5DC'
  }, {
    id: 'cursor track - crossfade - mode A',
    uuid: '1CF1F98C-B30B-4168-A077-921D6CE6B1B6'
  }, {
    id: 'cursor track - crossfade - mode B',
    uuid: '98C38744-F3C5-48F3-B0E9-ADFB2B529A6C'
  }, {
    id: 'cursor track - crossfade - mode AB',
    uuid: '0457FF82-1A94-40DD-986E-9DA31D9ABC82'
  }, {
    id: 'cursor track - clip launcher - stop',
    uuid: 'A4F4B48D-F0D6-4F79-9A36-896D15C49415'
  }, {
    id: 'cursor track - clip laucner - return to arrangement',
    uuid: '3C05B39A-9E85-4252-A1F3-CE855696FF17'
  }, {
    id: 'cursor device - enable state - toggle',
    uuid: 'A3735F3D-E90E-4A80-BE7E-6BA19BAAEF4A'
  }, {
    id: 'cursor device - window - toggle',
    uuid: '3D4CFEA9-36B1-42CA-A0E9-3E55534BFDCB'
  }, {
    id: 'cursor device - expanded - toggle',
    uuid: '3A30CE3D-BD01-4A0B-823F-832A04A57101'
  }, {
    id: 'cursor device - macro section - toggle',
    uuid: '4508D271-7D92-477B-9585-C6B95F8E09DD'
  }, {
    id: 'cursor device - paramater page section - toggle',
    uuid: 'EC91056F-58C6-48F9-916F-EE08C6B1C533'
  }, {
    id: 'cursor device - paramater page - prev',
    uuid: '237606D5-A8DD-4057-B07D-8A324EE3DEC3'
  }, {
    id: 'cursor device - paramater page - next',
    uuid: 'CEF29766-3A11-4E6F-A3B1-192CF8844070'
  }, {
    id: 'cursor device - preset - prev',
    uuid: 'C813C3E6-79C0-4546-82CB-25A077FA3AF6'
  }, {
    id: 'cursor device - preset - next',
    uuid: 'B17A9547-4DAD-49DF-9C1C-56CB8A2E6086'
  }, {
    id: 'cursor device - preset category - prev',
    uuid: '0EB7C0A9-C448-487A-9AE5-DB4D8D27BC15'
  }, {
    id: 'cursor device - preset category - next',
    uuid: 'D12F9C92-650F-4AFD-9848-DAEC87ABDBF0'
  }, {
    id: 'cursor device - preset creator - prev',
    uuid: 'D39A4B2C-6EF5-4DFA-BAC9-AB51A8F45216'
  }, {
    id: 'cursor device - preset creator - next',
    uuid: '45060C5A-5FE3-4630-AB5F-27EF1475B622'
  }, {
    id: 'cursor device - macro/param indication - toggle',
    uuid: 'C870E9E8-F643-4CCD-9C12-475797AD3724'
  }, {
    id: 'cursor device - macro/param 1 - up',
    uuid: '50F15E2B-1D9E-4FB8-B22E-D27536105880'
  }, {
    id: 'cursor device - macro/param 1 - down',
    uuid: 'D870A3DC-B843-49F9-8E03-ED5648F46332'
  }, {
    id: 'cursor device - macro/param 2 - up',
    uuid: 'B8F1A43E-580C-4E03-9035-B05AF89DA70D'
  }, {
    id: 'cursor device - macro/param 2 - down',
    uuid: 'E868F403-7C23-4013-AC9B-29F9644E905A'
  }, {
    id: 'cursor device - macro/param 3 - up',
    uuid: '712624BD-5EE3-4CE2-84B3-6884066C2B1A'
  }, {
    id: 'cursor device - macro/param 3 - down',
    uuid: '6DCD5A2F-69C2-4921-8FA1-78A84BB5B577'
  }, {
    id: 'cursor device - macro/param 4 - up',
    uuid: 'E2DC1C30-1F50-42A3-ACBE-69C3C7842C74'
  }, {
    id: 'cursor device - macro/param 4 - down',
    uuid: 'B3C88E60-3840-49F5-A2B9-CC916E2713A4'
  }, {
    id: 'cursor device - macro/param 5 - up',
    uuid: '22A1B168-7788-4E3A-804A-41166E3EDEEB'
  }, {
    id: 'cursor device - macro/param 5 - down',
    uuid: 'C44B5C21-7B8C-4C4D-956F-FA149436B783'
  }, {
    id: 'cursor device - macro/param 6 - up',
    uuid: 'A04CF371-315A-4E0B-9F3F-5AF6D8CA892F'
  }, {
    id: 'cursor device - macro/param 6 - down',
    uuid: '901D2185-E8F6-405E-BD4A-0766A5998D84'
  }, {
    id: 'cursor device - macro/param 7 - up',
    uuid: 'FA17115E-65BB-41E8-B189-1D8EE4C8BD49'
  }, {
    id: 'cursor device - macro/param 7 - down',
    uuid: 'FEEBEEC5-08C0-4B9C-B2DD-5C6034BBF07C'
  }, {
    id: 'cursor device - macro/param 8 - up',
    uuid: '47A9ACFF-BA5A-4665-9A23-77F9B2D3814A'
  }, {
    id: 'cursor device - macro/param 8 - down',
    uuid: '9E5951AE-BFA8-46DB-AAD2-DFCCAA4ABF51'
  }, {
    id: 'cursor device - macro 1 mapping - toggle',
    uuid: 'DEF6F21E-69CD-439D-A960-00521F0D5188'
  }, {
    id: 'cursor device - macro 2 mapping - toggle',
    uuid: 'AB6DF8D0-22B3-479D-8E94-691E8EE24176'
  }, {
    id: 'cursor device - macro 3 mapping - toggle',
    uuid: '8C547C35-3381-4FB0-8035-89032A63A33F'
  }, {
    id: 'cursor device - macro 4 mapping - toggle',
    uuid: 'FBEA09C3-BB87-4AB6-9D44-63AA4816B7E1'
  }, {
    id: 'cursor device - macro 5 mapping - toggle',
    uuid: '14A9CA92-5216-4031-9644-63BCDA0ED2C6'
  }, {
    id: 'cursor device - macro 6 mapping - toggle',
    uuid: 'AF28DC01-DE07-4C3A-BA0A-9A986E9DC7F6'
  }, {
    id: 'cursor device - macro 7 mapping - toggle',
    uuid: 'B7590CA8-5E1B-427E-B0DB-766CA9D207E6'
  }, {
    id: 'cursor device - macro 8 mapping - toggle',
    uuid: '4409766C-F91F-4243-BDDA-15467CD21B78'
  }
];



},{}],8:[function(require,module,exports){
(function (global){
global.loadAPI(1);

module.exports = global.host;



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
var bitwig;

bitwig = require('./bitwig');

module.exports = {
  init: function() {
    var index;
    this.track = bitwig.createArrangerCursorTrack(4, 0);
    this.device = bitwig.createEditorCursorDevice();
    this.track.addIsSelectedInMixerObserver((function(_this) {
      return function(selected) {
        return _this.trackSelected = selected;
      };
    })(this));
    this.device.addHasSelectedDeviceObserver((function(_this) {
      return function(selected) {
        return _this.deviceSelected = selected;
      };
    })(this));
    this.macroValues = (function() {
      var _i, _results;
      _results = [];
      for (index = _i = 0; _i <= 7; index = ++_i) {
        _results.push(this.device.getMacro(index).getAmount());
      }
      return _results;
    }).call(this);
    this.macroSources = (function() {
      var _i, _results;
      _results = [];
      for (index = _i = 0; _i <= 7; index = ++_i) {
        _results.push(this.device.getMacro(index).getModulationSource());
      }
      return _results;
    }).call(this);
    this.macroIndicated = false;
    this.parameterValues = (function() {
      var _i, _results;
      _results = [];
      for (index = _i = 0; _i <= 7; index = ++_i) {
        _results.push(this.device.getParameter(index));
      }
      return _results;
    }).call(this);
    return this.parameterIndicated = false;
  },
  midi: function(s, d1, d2) {
    var index;
    if (s === 0xB1 && this.trackSelected) {
      index = (d1 << 7) + d2;
      if (this.actions[index].id.indexOf('cursor track') === 0 && !this.trackSelected) {
        return;
      }
      if (this.actions[index].id.indexOf('cursor device') === 0 && !this.deviceSelected) {
        return;
      }
      if (index < this.actions.length) {
        return this.actions[index].fn.call(this);
      }
    }
  },
  deviceValue: function(i, delta) {
    if (this.macroIndicated) {
      this.macroValues[i].inc(delta, 101);
    }
    if (this.parameterIndicated) {
      return this.parameterValues[i].inc(delta, 101);
    }
  },
  actions: [
    {
      id: 'cursor track - activated - toggle',
      fn: function() {
        var _ref;
        return (_ref = this.track.isActivated()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - volume - +10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(10, 101) : void 0;
      }
    }, {
      id: 'cursor track - volume - +1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(1, 101) : void 0;
      }
    }, {
      id: 'cursor track - volume - -1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(-1, 101) : void 0;
      }
    }, {
      id: 'cursor track - volume - -10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(-10, 101) : void 0;
      }
    }, {
      id: 'cursor track - volume - reset',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - pan - right 10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(10, 201) : void 0;
      }
    }, {
      id: 'cursor track - pan - right 1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(1, 201) : void 0;
      }
    }, {
      id: 'cursor track - pan - left 1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(-1, 201) : void 0;
      }
    }, {
      id: 'cursor track - pan - left 10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(-10, 201) : void 0;
      }
    }, {
      id: 'cursor track - pan - reset',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - mute - toggle',
      fn: function() {
        var _ref;
        return (_ref = this.track.getMute()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - solo - toggle',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSolo()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - send S1 - +10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(0)) != null ? _ref.inc(10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S1 - +1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(0)) != null ? _ref.inc(1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S1 - -1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(0)) != null ? _ref.inc(-1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S1 - -10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(0)) != null ? _ref.inc(-10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S1 - reset',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(0)) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - send S2 - +10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(1)) != null ? _ref.inc(10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S2 - +1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(1)) != null ? _ref.inc(1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S2 - -1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(1)) != null ? _ref.inc(-1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S2 - -10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(1)) != null ? _ref.inc(-10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S2 - reset',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(1)) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - send S3 - +10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(2)) != null ? _ref.inc(10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S3 - +1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(2)) != null ? _ref.inc(1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S3 - -1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(2)) != null ? _ref.inc(-1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S3 - -10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(2)) != null ? _ref.inc(-10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S3 - reset',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(2)) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - send S4 - +10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(3)) != null ? _ref.inc(10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S4 - +1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(3)) != null ? _ref.inc(1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S4 - -1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(3)) != null ? _ref.inc(-1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S4 - -10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(3)) != null ? _ref.inc(-10, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S4 - reset',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(3)) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - arm - toggle',
      fn: function() {
        var _ref;
        return (_ref = this.track.getArm()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - monitor - toggle',
      fn: function() {
        var _ref;
        return (_ref = this.track.getMonitor()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - auto monitor - toggle',
      fn: function() {
        var _ref;
        return (_ref = this.track.getAutoMonitor()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - crossfade - mode A',
      fn: function() {
        var _ref;
        return (_ref = this.track.getCrossFadeMode()) != null ? _ref.set('A') : void 0;
      }
    }, {
      id: 'cursor track - crossfade - mode B',
      fn: function() {
        var _ref;
        return (_ref = this.track.getCrossFadeMode()) != null ? _ref.set('B') : void 0;
      }
    }, {
      id: 'cursor track - crossfade - mode AB',
      fn: function() {
        var _ref;
        return (_ref = this.track.getCrossFadeMode()) != null ? _ref.set('AB') : void 0;
      }
    }, {
      id: 'cursor track - clip launcher - stop',
      fn: function() {
        return this.track.stop();
      }
    }, {
      id: 'cursor track - clip laucner - return to arrangement',
      fn: function() {
        return this.track.returnToArrangement();
      }
    }, {
      id: 'cursor device - enable state - toggle',
      fn: function() {
        return this.device.toggleEnabledState();
      }
    }, {
      id: 'cursor device - window - toggle',
      fn: function() {
        return this.device.isWindowOpen().toggle();
      }
    }, {
      id: 'cursor device - expanded - toggle',
      fn: function() {
        return this.device.isExpanded().toggle();
      }
    }, {
      id: 'cursor device - macro section - toggle',
      fn: function() {
        return this.device.isMacroSectionVisible().toggle();
      }
    }, {
      id: 'cursor device - paramater page section - toggle',
      fn: function() {
        return this.device.isParameterPageSectionVisible().toggle();
      }
    }, {
      id: 'cursor device - paramater page - prev',
      fn: function() {
        return this.device.previousParameterPage();
      }
    }, {
      id: 'cursor device - paramater page - next',
      fn: function() {
        return this.device.nextParameterPage();
      }
    }, {
      id: 'cursor device - preset - prev',
      fn: function() {
        return this.device.switchToPreviousPreset();
      }
    }, {
      id: 'cursor device - preset - next',
      fn: function() {
        return this.device.switchToNextPreset();
      }
    }, {
      id: 'cursor device - preset category - prev',
      fn: function() {
        return this.device.switchToPreviousPresetCategory();
      }
    }, {
      id: 'cursor device - preset category - next',
      fn: function() {
        return this.device.switchToNextPresetCategory();
      }
    }, {
      id: 'cursor device - preset creator - prev',
      fn: function() {
        return this.device.switchToPreviousPresetCreator();
      }
    }, {
      id: 'cursor device - preset creator - next',
      fn: function() {
        return this.device.switchToNextPresetCreator();
      }
    }, {
      id: 'cursor device - macro/param indication - toggle',
      fn: function() {
        var macro, param, _i, _j, _len, _len1, _ref, _ref1, _results;
        this.macroIndicated = !this.macroIndicated;
        this.parameterIndicated = !this.macroIndicated;
        this.device.isMacroSectionVisible().set(this.macroIndicated);
        _ref = this.macroValues;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          macro = _ref[_i];
          macro.setIndication(this.macroIndicated);
        }
        this.device.isParameterPageSectionVisible().set(this.parameterIndicated);
        _ref1 = this.parameterValues;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          param = _ref1[_j];
          _results.push(param.setIndication(this.parameterIndicated));
        }
        return _results;
      }
    }, {
      id: 'cursor device - macro/param 1 - up',
      fn: function() {
        return this.deviceValue(0, 1);
      }
    }, {
      id: 'cursor device - macro/param 1 - down',
      fn: function() {
        return this.deviceValue(0, -1);
      }
    }, {
      id: 'cursor device - macro/param 2 - up',
      fn: function() {
        return this.deviceValue(1, 1);
      }
    }, {
      id: 'cursor device - macro/param 2 - down',
      fn: function() {
        return this.deviceValue(1, -1);
      }
    }, {
      id: 'cursor device - macro/param 3 - up',
      fn: function() {
        return this.deviceValue(2, 1);
      }
    }, {
      id: 'cursor device - macro/param 3 - down',
      fn: function() {
        return this.deviceValue(2, -1);
      }
    }, {
      id: 'cursor device - macro/param 4 - up',
      fn: function() {
        return this.deviceValue(3, 1);
      }
    }, {
      id: 'cursor device - macro/param 4 - down',
      fn: function() {
        return this.deviceValue(3, -1);
      }
    }, {
      id: 'cursor device - macro/param 5 - up',
      fn: function() {
        return this.deviceValue(4, 1);
      }
    }, {
      id: 'cursor device - macro/param 5 - down',
      fn: function() {
        return this.deviceValue(4, -1);
      }
    }, {
      id: 'cursor device - macro/param 6 - up',
      fn: function() {
        return this.deviceValue(5, 1);
      }
    }, {
      id: 'cursor device - macro/param 6 - down',
      fn: function() {
        return this.deviceValue(5, -1);
      }
    }, {
      id: 'cursor device - macro/param 7 - up',
      fn: function() {
        return this.deviceValue(6, 1);
      }
    }, {
      id: 'cursor device - macro/param 7 - down',
      fn: function() {
        return this.deviceValue(6, -1);
      }
    }, {
      id: 'cursor device - macro/param 8 - up',
      fn: function() {
        return this.deviceValue(7, 1);
      }
    }, {
      id: 'cursor device - macro/param 8 - down',
      fn: function() {
        return this.deviceValue(7, -1);
      }
    }, {
      id: 'cursor device - macro 1 mapping - toggle',
      fn: function() {
        return this.macroSources[0].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 2 mapping - toggle',
      fn: function() {
        return this.macroSources[1].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 3 mapping - toggle',
      fn: function() {
        return this.macroSources[2].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 4 mapping - toggle',
      fn: function() {
        return this.macroSources[3].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 5 mapping - toggle',
      fn: function() {
        return this.macroSources[4].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 6 mapping - toggle',
      fn: function() {
        return this.macroSources[5].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 7 mapping - toggle',
      fn: function() {
        return this.macroSources[6].toggleIsMapping();
      }
    }, {
      id: 'cursor device - macro 8 mapping - toggle',
      fn: function() {
        return this.macroSources[7].toggleIsMapping();
      }
    }
  ]
};



},{"./bitwig":8}],10:[function(require,module,exports){
(function (global){
var bitwig, controllers;

bitwig = require('./bitwig');

controllers = [require('./util'), require('./action'), require('./extended_action')];

bitwig.defineController('Stairways Software', 'Keyboard Maestro', '0.2', 'af04a470-6b45-11e4-9803-0800200c9a66', 'jhorology jhorology2014@gmail.com');

bitwig.defineMidiPorts(1, 0);

if (bitwig.platformIsMac()) {
  bitwig.addDeviceNameBasedDiscoveryPair(['Keyboard Maestro'], []);
}

global.init = function() {
  var c, _i, _len, _results;
  bitwig.getMidiInPort(0).setMidiCallback(function(s, d1, d2) {
    var c, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = controllers.length; _i < _len; _i++) {
      c = controllers[_i];
      _results.push(typeof c.midi === "function" ? c.midi(s, d1, d2) : void 0);
    }
    return _results;
  });
  _results = [];
  for (_i = 0, _len = controllers.length; _i < _len; _i++) {
    c = controllers[_i];
    _results.push(typeof c.init === "function" ? c.init() : void 0);
  }
  return _results;
};

global.flush = function() {
  var c, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = controllers.length; _i < _len; _i++) {
    c = controllers[_i];
    _results.push(typeof c.flush === "function" ? c.flush() : void 0);
  }
  return _results;
};

global.exit = function() {
  var c, _i, _len, _ref, _results;
  _ref = controllers.reverse();
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    c = _ref[_i];
    _results.push(typeof c.exit === "function" ? c.exit() : void 0);
  }
  return _results;
};



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./action":6,"./bitwig":8,"./extended_action":9,"./util":11}],11:[function(require,module,exports){
var JSON2, actions, bitwig, createOrReuseUuid, extendedActions, uuid;

bitwig = require('./bitwig');

JSON2 = require('JSON2');

uuid = require('uuid');

actions = require('./actions');

extendedActions = require('./extended_action').actions;

module.exports = {
  init: function() {
    return this.application = bitwig.createApplication();
  },
  midi: function(s, d1, d2) {
    if (s === 0xBF && d1 < this.handlers.length) {
      return this.handlers[d1].call(this, d2);
    }
  },
  handlers: [
    function() {
      return this.printActions();
    }
  ],
  printActions: function() {
    var action, i, id, j;
    bitwig.println(JSON2.stringify({
      hostVersion: String(bitwig.getHostVersion()),
      hostApiVersion: Number(bitwig.getHostApiVersion()),
      actions: ((function() {
        var _i, _len, _ref, _results;
        _ref = this.application.getActions();
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          action = _ref[i];
          id = String(action.getId());
          _results.push({
            id: id,
            uuid: createOrReuseUuid(actions.ids, id),
            category: String(action.getCategory().getId()),
            on: {
              ch: 1,
              cc: i >> 7,
              value: i & 0x7f
            }
          });
        }
        return _results;
      }).call(this)).concat((function() {
        var _i, _len, _results;
        _results = [];
        for (j = _i = 0, _len = extendedActions.length; _i < _len; j = ++_i) {
          action = extendedActions[j];
          _results.push({
            id: action.id,
            uuid: createOrReuseUuid(actions.extended_ids, action.id),
            category: 'extended',
            on: {
              ch: 2,
              cc: j >> 7,
              value: j & 0x7f
            }
          });
        }
        return _results;
      })())
    }));
    bitwig.println('\ncopy above line and paste in http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html\n');
    return bitwig.println("total " + i + " + " + j + " actions.");
  }
};

createOrReuseUuid = function(ids, id) {
  var action, _i, _len;
  for (_i = 0, _len = ids.length; _i < _len; _i++) {
    action = ids[_i];
    if (action.id === id) {
      return action.uuid;
    }
  }
  return uuid.v4().toUpperCase();
};



},{"./actions":7,"./bitwig":8,"./extended_action":9,"JSON2":2,"uuid":5}]},{},[10]);
