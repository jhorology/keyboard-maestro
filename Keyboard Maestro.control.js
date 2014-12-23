/*! keyboard-maestro - v0.3.0 - 2014-12-24 */
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
    var id, ver;
    ver = String(bitwig.getHostVersion());
    if (ver !== actions.version) {
      throw new Error("Invalid version. host:[" + ver + "] actions:[" + actions.version + "]");
    }
    this.application = bitwig.createApplication();
    return this.ids = (function() {
      var _results;
      _results = [];
      for (id in actions.ids) {
        _results.push(id);
      }
      return _results;
    })();
  },
  midi: function(s, d1, d2) {
    var index;
    if (s === 0xB0) {
      index = (d1 << 7) + d2;
      if (index < this.ids.length) {
        return this.application.getAction(this.ids[index]).invoke();
      }
    }
  }
};



},{"./actions":7,"./bitwig":8}],7:[function(require,module,exports){
exports.version = '1.1.3 RC 2';

exports.ids = {
  'New': '455E90F4-11B3-4564-93EC-40CE93117910',
  'Open': '6FA8D3BC-8ADC-4FD7-AA89-FF01F80D4AC1',
  'Save': '3AD9200D-674B-442D-AAFD-71EBAA36DBB4',
  'Save as': '5D698D51-F38C-47A1-8120-79FC62225407',
  'Close': 'C9679E21-01F7-4A07-9D93-16E61BEFC6C6',
  'Preferences': '0809E078-32EC-4B1D-9ADF-1CEFF6505F92',
  'Quit': 'E0C8AE87-1130-473C-9317-9A8A84ACB6A6',
  'Undo': '4419D4BA-414C-42C7-9D15-BFD44145DF50',
  'Redo': '1BA5D80A-C404-4D13-9D3F-45F3F878F8A1',
  'Cut': '531E2E1E-2BDC-4C47-A0E3-9434900B5EE5',
  'Cut Special': 'F59F924B-DCA7-445E-921E-2E2F1986C4CB',
  'Copy': 'F69D4F14-F235-4AFA-9253-161116A0D475',
  'Copy Special': '48663640-2600-4CE2-B637-4CC584BE1789',
  'Paste': 'E7307C5F-EAF0-4816-8865-8493117F4742',
  'Paste Special': '0DC0D718-1638-4C2C-878B-B064D9545208',
  'Duplicate': 'FD918254-D52F-4F34-B91F-13E56135A75B',
  'Duplicate Special': '139FFF06-884F-43D0-94A9-E15203549A1D',
  'Group': 'E9ADC918-8132-4644-8D9C-B7E6DCEFF413',
  'Ungroup': 'B82F4BAA-0CAA-412A-B3BD-5B69F52E023D',
  'Toggle Active': '34B4C1BD-73E4-493B-931F-9AB8C10BAB00',
  'Activate': 'C1E7EE22-6F9F-4B13-8DA4-34B31351738B',
  'Deactivate': '0C26B95A-A36D-4CFF-A420-2C429FA669A8',
  'Delete': '80981D0B-2C0B-4F37-B2F7-E3FBE4AD5C3F',
  'Delete Special': 'EAE71586-C0C1-4D57-B05E-E22B072EE734',
  'Select All': 'B57C53D8-29DE-4CE9-9E1E-2FE0665125CA',
  'Unselect All': '3E4FF2CE-2532-47EF-97EF-92FB73F024C2',
  'Rename': 'CD488565-4DAC-46A7-A75F-3932B9EF6283',
  'Click button': '4A341E18-8FFA-4ABA-A94E-774450ABE723',
  'Activate item': '3F3D33A7-213F-40B4-B4EF-B7C1E074D4CE',
  'Cancel Dialog': 'B80184F5-9AD4-472F-8E6B-D21BD01D743A',
  'Dialog: Yes': 'CA3260CA-3D23-4573-8400-4AD9F09520F6',
  'Dialog: No': '34C4F16C-FC84-403A-9BC0-3A4377968F2F',
  'Dialog: OK': 'BDAD6C3F-C939-4269-94D4-F401405F582F',
  'Delete character to left of cursor': 'FF3A46BB-286D-47D9-A459-88B9B283C434',
  'Delete character to right of cursor': '24ECD571-EF48-4311-81C8-C3DD59C63D89',
  'Insert new line': '97E601FF-1D1B-4EC0-81EC-66A34F05EB9B',
  'Commit text': '28F6D82D-F489-44EC-8E6C-8C2A68384EB6',
  'Reload': '871B3CE9-7ED8-487F-A9E3-8BBCC47AF562',
  'Previous history entry': '94AEF9F4-A93A-486F-AA8A-D63DF12A91EF',
  'Next history entry': 'F70EFCD5-183B-46FB-856F-90C2F313018C',
  'Move cursor left': 'BAE26DC2-C92D-40C6-913D-E88AFCAB2A68',
  'Move cursor right': 'C6E8F5EC-3DB6-4A39-B196-6F8A0360AADA',
  'Move cursor up': 'C4586C00-DF59-4B86-A8FC-F5031AF1B10A',
  'Move cursor down': '81D3AB2B-9027-40D7-B747-A8B11AE0A5CF',
  'Move cursor to start of document': '02E35FAF-A369-47BE-85AF-766794E94B79',
  'Move cursor to end of document': 'E40BF379-C36A-49A3-9464-031C2C949CFB',
  'Move cursor to start of line': 'F76CFEFF-C84B-4615-96B9-9BCA43CB8989',
  'Move cursor to end of line': '01F0DC29-B6E6-4930-B9D8-FDAECD8C4C02',
  'Move cursor word left': '830B44E1-C9C3-47D3-8D0E-EDF146A50BB5',
  'Move cursor word right': 'AC110484-EF1E-4165-B6A3-D6FB9D7BEDE6',
  'Move cursor and extend selection left': '12105243-99F9-4601-9140-0949B2EEE637',
  'Move cursor and extend selection right': '66433D41-A342-4A4C-91EA-40C95741D97A',
  'Move cursor and extend selection up': '50143210-9508-4C16-8A8C-898AD116D1D5',
  'Move cursor and extend selection down': 'C6AAAC12-7DBE-4FBC-BE0B-BAADBF7F7807',
  'Move cursor and extend selection to start of document': '6F59E689-7246-4EE8-883D-55CACCF9224E',
  'Move cursor and extend selection to end of document': '3BAD856D-E5F9-4682-9DBB-41FFA80C252B',
  'Move cursor and extend selection to start of document': '6F59E689-7246-4EE8-883D-55CACCF9224E',
  'Move cursor and extend selection to end of document': '3BAD856D-E5F9-4682-9DBB-41FFA80C252B',
  'Move cursor and extend selection word left': 'E3D1AA71-6382-429D-B717-B565C47C4C97',
  'Move cursor and extend selection word right': '19BEF918-8ECE-41F8-8DA2-3C928C6F5698',
  'Select first item': '35DAE3B4-0CD1-4917-AD18-66D6808EB902',
  'Select last item': '05119F21-4D45-4E35-8034-47C1809338AD',
  'move_selection_cursor_to_first_item': '3470BE56-CA83-40B6-94D8-2F7371E789EA',
  'move_selection_cursor_to_last_item': '8A570E89-3B67-44D5-ABCB-48694F4BA670',
  'move_selection_cursor_to_next_item': '6C3B96CC-923F-4D59-8BFC-207C0C989075',
  'move_selection_cursor_to_previous_item': '23F4E15F-3BD9-4483-8E5B-6B6A6389A831',
  'Extend selection range to first item': '209EF40B-628E-4E14-B245-6F6F1F9ADA27',
  'Extend selection range to last item': 'EE0B874E-946D-4843-B77B-ED127AF13E8C',
  'Extend selection to next item': 'BBB54760-FAF7-4F76-94D0-AB60988451C3',
  'Extend selection range to previous item': 'BC967234-E3B1-43D3-937A-98228A666C71',
  'Extend selection to first item': 'CEB58504-6FDF-4D8F-9C51-FA1B515F1188',
  'Extend selection to last item': '0A6EBA3E-4D80-4EE8-9B6D-DAD7F59C878B',
  'Select previous item': '58621FD0-CA79-421B-B4C0-3E3C37AEACC9',
  'Select next item': '465E1217-698F-4F56-BE3F-84B722A8CF97',
  'Extend selection to next item': 'BBB54760-FAF7-4F76-94D0-AB60988451C3',
  'Extend selection to previous item': '5A352D0C-DD01-4C6D-96C1-2B008C8C448E',
  'Toggle selection of item at cursor': '5CA48A16-15C8-4355-94CD-4737C0D5DC72',
  'Select item in next lane': 'FAD38154-0AF6-4A0E-85BB-31FAFACEC3B0',
  'Select item in previous lane': 'E73E505F-4C9D-484D-997F-7417FADBA037',
  'Select item in first lane': '4F3C74CC-3018-4D42-95FA-6B95540369DA',
  'Select item in last lane': 'B8BE1706-0AFF-4FB8-8D3D-CB44E6A947D7',
  'Move cursor to next lane': '10A4E2D0-B52E-4861-9C63-7305195F32A8',
  'Move cursor to previous lane': '3098964E-3BD9-4F31-9CFB-1CE1AEBA79C0',
  'Move cursor to first lane': '5F821617-5EAD-4614-AA00-964D9B47E953',
  'Move cursor to last lane': '5489BBD3-F80A-4430-AE5F-969ECF814884',
  'Extend selection to next lane': '84A019A3-8744-4BA7-9212-6DED22E24E5A',
  'Extend selection to previous lane': '1DAB956D-4BF8-435A-93C8-078313FB5CBF',
  'Extend selection to first lane': 'BB2A6F3D-4B70-4895-801F-171FB1A48C45',
  'Extend selection to last lane': '72801F9F-DB19-4C7B-8268-514DD339EAEB',
  'Extend selection range to next lane': '23BE3009-FE08-4C37-8504-1658B4E4E834',
  'Extend selection range to previous lane': '1C06EE4C-648C-4B45-B64B-F34DBBFA63D5',
  'Extend selection range to first lane': '8D7B8F1B-17D3-4EF7-B005-D1FDF768BFFA',
  'Extend selection range to last lane': '91C3C3BD-1EA0-4550-AA70-C1C34D31F9A6',
  'Select item to left': 'A715B935-880F-487E-BBDB-BA7E48F7BDE9',
  'Select item to right': 'F5DA0726-556A-47F1-9ED0-BB0D2E9BD2CD',
  'Select item above': '9DE02002-B70B-45B2-89C7-1B4103E764AA',
  'Select item below': 'A017213F-7F54-41E1-9774-0A43744C1528',
  'Move selection cursor left': '0FE42C76-CEB0-448B-8C9E-7F18CAAECBB1',
  'Move selection cursor right': 'E1FFB4AB-F3AB-44CC-8C84-1D024342A939',
  'Move selection cursor up': 'CBE84639-9A14-4702-82DC-C7320C76A932',
  'Move selection cursor down': 'E4E3CA29-5D32-4546-9855-F18761F2C35F',
  'Extend selection range to item to left': 'D78A5132-DE08-41A8-B9B4-E1AD3CA4A1A1',
  'Extend selection range to item to right': 'A6EED2D3-C5AD-4EB7-927B-766032DA363C',
  'Extend selection range to item above': '5F47819C-37AC-43AF-A11F-2047F470D425',
  'Extend selection range to item below': 'AE3491F1-DB78-4E42-B8D7-1D41540F82D1',
  'Extend selection to item to left': '9D8E9944-46F8-476A-8FEC-39D50E74B38E',
  'Extend selection to item to right': '54C5EC19-C511-41B2-A6AA-88DE7ED0AA08',
  'Extend selection to item above': 'F8D28DCF-6854-4E8F-82D1-EB7D0D361AA8',
  'Extend selection to item below': '00BAA2A6-B7AB-43EF-B5A2-5CCE6913D699',
  'Focus panel to the left': 'A798862B-1323-42C7-BA78-3ED87CBFAA05',
  'Focus panel to the right': '7A46DDBA-F5BC-499F-94EC-3BC6D616A790',
  'Focus panel above': '91864A8C-F453-414D-9794-706C40286E9E',
  'Focus panel below': '0BC8AE5D-7491-46C6-9244-E1C88BF161E5',
  'Focus next panel': 'E6750B94-CDF1-47AF-A0EC-8442A32AB9D1',
  'Focus previous panel': '49D77069-86D8-4AB4-9C01-60120723D2E3',
  'Focus next field': '5A819789-DAB4-4FEF-9170-7470F5AE54AE',
  'Focus previous field': '92560751-3736-4687-AF2C-88D45522F558',
  'Focus widget to the left': '0517EEBC-8390-439E-B143-04D9A55EEA94',
  'Focus widget to the right': '728207FC-D4D1-4C01-AE8A-6E14F1EE68C0',
  'Focus widget above': 'BB06397B-5345-479E-B4D1-3F8CD633B58E',
  'Focus widget below': 'AA01C33A-B9E8-408C-86AF-183AFAA09EEA',
  'Toggle expanded state': 'C2912933-9DEF-42B9-BBDA-967A740876F1',
  'Zoom In': 'A2F53693-725A-40A1-960E-4D2349F8D0D4',
  'Zoom Out': '187DB9AA-D897-4230-9D86-9F6B9726AC29',
  'Zoom to Fit': 'A409DF67-293C-46F0-B606-87CA8EEDBEAB',
  'Maximize window': 'CF1E5067-48C3-49E6-B472-7C69B8D811C4',
  'Minimize window': '08836CB9-0E67-4001-BCF7-0ED318412A32',
  'Full screen': 'C86F4BA9-D702-4BED-B1C3-E61195F95C0F',
  'Select Next Project': '0D526104-2308-4920-A24D-368BE00B1A04',
  'Select Previous Project': '3D1BED9B-D683-4365-8C31-DC7D1D8443EF',
  'select_next_tab': 'B2208FFB-6631-44D6-9E94-B735CD4EE16F',
  'select_previous_tab': 'CB8DAB9A-2CA0-4A20-BB1F-F1B0BE23C4B9',
  'Connect to Remote Project': '5B637A20-1E68-4147-A785-3AAB7083E9DD',
  'Show Controller Script Console': 'F307E7AC-806D-456B-ACA1-46C1B0C3B237',
  'help_user_guide': 'B768A17A-4836-4125-9D18-FCA4492B4100',
  'help_user_guide_jp': '75AA0299-524E-4EE0-B996-24298E1F8921',
  'check_for_updates': '6C69A7EE-E1BA-4E21-AC93-9A413860EE42',
  'invoke_action': 'E489E12F-E480-4040-86AF-37F3EC537BB1',
  'Collect and Save': 'B69863F6-FB37-4DFC-BF99-059546640536',
  'Activate Engine For Project': '59BCC7B1-92AF-479B-9287-73B2576CD023',
  'Create Instrument Track': '3A34D4BA-3FA4-49AC-BC3E-9254123283EA',
  'Create Audio Track': '616A9F6D-9681-435A-90AC-98769DF57E3E',
  'Create Effect Track': '1C93F5D0-A13A-403A-8412-33F0EA0BEC7A',
  'Create Scene': 'A0DEA1FB-682A-4FE5-BDB6-5E2E5E8C0D39',
  'Create Event': 'DD377D1A-D10A-4637-8333-D4A9AE0CAE38',
  'Select previous track': '1D9664B4-B7F8-4CFD-8C4F-4228A76DB79D',
  'Select next track': 'D1DD788B-0188-4608-B660-DB7BBEB74737',
  'focus_track_header_area': '67504A45-ABE8-4508-944A-F7A2B906D5FC',
  'toggle_clip_launcher': '3E8CD1D5-741A-4557-9304-CCDFE587322E',
  'focus_or_toggle_clip_launcher': '901E5883-DF31-4DDB-BBB0-7E9EE184888B',
  'Play Transport': '1AA3B23B-93AD-426B-8B47-0FC6148191EA',
  'Continue Play Transport': '92746EDD-E3D8-47D1-95CF-E05E1566AE06',
  'Play Transport From Start': '9BEDD409-0F42-473C-8A23-E04F5EBFA3C9',
  'Stop Transport': '5138E60E-C83D-4830-A44D-8B5128081273',
  'Play or Stop Transport': 'A7B0AD7A-747C-4F78-B76E-5B1C4806FBF4',
  'Play or Pause Transport': '53D291F3-71AD-4D25-8C35-53462D39E693',
  'Continue Playback or Stop': 'C1BB8103-1435-4EE1-81EB-B339D4527659',
  'Play From Start or Stop Transport': 'CA3C229E-8DF0-47E9-8208-1B2DEDC78130',
  'Toggle Record': '9C785C4C-9409-42A8-9F5E-8A0B75690092',
  'Tap Tempo': 'EF14F011-53DC-4ECD-B3CF-1CC9EE126082',
  'Export Audio': '10FBEA53-10EB-4EAB-A297-69B76566123F',
  'export_midi': 'E5A82841-70E2-4D40-8126-D80A0C996564',
  'Select Pointer Tool': '3E113B80-D2AE-4BD1-B686-66E8454FFA83',
  'select_time_selection_tool': 'C20A5F30-04A0-430D-B554-A401D089681C',
  'Select Pen Tool': '37535E9D-EE9E-43D5-BB48-E4FA87A1E5A2',
  'Select Eraser Tool': '931D8160-AB6F-4564-AA51-E6959754FDD7',
  'Select Knife Tool': 'DF33F10A-1209-4C3C-B739-7CE1B7E2AFF0',
  'toggle_browser_panel': '69A730E0-3EF7-4675-A9E0-EA7C14398735',
  'toggle_device_panel': '7A108699-D0CF-4D51-BD03-0A5444307599',
  'toggle_arranger': 'C85F80A5-CEB8-459D-9A97-64172BD78C72',
  'toggle_detail_editor': '713FF4D8-FDF9-425E-8FAE-DB19BAD0E8EE',
  'toggle_automation_editor': '80011511-47A3-487A-ABF3-8D2B02BF5018',
  'toggle_mixer': 'B2228BD8-9941-487D-84B0-058024C26F39',
  'toggle_inspector': 'D958AABB-E9A1-436D-A568-EFABBC01AE3F',
  'toggle_studio_io': '4E35299A-3DA6-42B2-9FFE-DA4C424BFF44',
  'toggle_song_panel': '8054FCEE-2B2B-4F46-B770-C9FB3EBF38C5',
  'focus_or_toggle_browser_panel': 'D51D37B9-0DFB-483A-B61B-89C1118BBF22',
  'focus_or_toggle_device_panel': '8815146B-3ED3-433A-8C9A-2262A3B8A206',
  'focus_or_toggle_arranger': '34BC8606-A677-412F-B329-D87A750872D8',
  'focus_or_toggle_detail_editor': '2DFFF858-C4D8-4953-9C9E-799C67DF6302',
  'focus_or_toggle_automation_editor': '7A3A161A-9D47-43EF-B8F6-0E42B0429CF6',
  'focus_or_toggle_mixer': 'F4C6C58B-C0B8-4CF5-9C68-1BC2F3E4A6F2',
  'focus_or_toggle_inspector': '2D1DB71B-191B-4CEC-8E10-FB1E8941764E',
  'focus_or_toggle_studio_io': 'A3842171-E9BA-423F-B02A-1DE9CFCA79BC',
  'focus_or_toggle_song_panel': 'E1539943-92B6-49DC-BED4-1C3CF7249D40',
  'Switch to Mode 1': '3CC21C52-9D83-4840-996E-FA3D787342CC',
  'Switch to Mode 2': '2A47BAD3-5182-4755-AA7B-F76DC3B4895D',
  'Switch to Mode 3': 'BA8B72C5-6BA3-4068-9D22-D77E74307738',
  'Switch to Mode 4': '78EA378B-211B-405F-A02F-856EB1F1CA50',
  'Select Next Mode': 'FC7F2D74-5927-479A-97AD-650BD3549B43',
  'Select Previous Mode': '94CB87D4-6EE2-428B-9014-CF1DE5A30450',
  'Toggle maximized editing mode': '89DFB091-BB28-49C6-AFFB-70FAD5C27F96',
  'Select sub panel 1': '6D22922F-D78C-4D8A-9B62-A95846ECB186',
  'Select sub panel 2': 'C29D25A8-A45C-4006-A68D-0AE6F87DC7CB',
  'Select sub panel 3': 'C6E0B098-65B4-4962-A46A-933676D4AB37',
  'Select sub panel 4': '776F4B9A-DDA4-4283-BF8B-5C5FCF38B025',
  'Select next sub panel': '6BC392ED-B766-4EAA-91AE-BBBF2CDD738D',
  'Select previous sub panel': '65DCADFB-529F-45B9-A2D5-1F3B84E71E87',
  'Show Track Inputs and Outputs': 'FF600291-FAB5-4582-81EE-276C03904252',
  'Show Sends': '324E3D20-4536-46D6-970F-B6274B4DF008',
  'Show Crossfades': 'F83991CE-2B48-4621-B338-01FD9A0FDA08',
  'Show Effect Tracks': 'C6204C84-0830-4444-97B4-E73D7C8E8DC4',
  'Split': '81C926BF-CCE7-4027-98F8-038136A51C1F',
  'Consolidate': 'F3B2EF6D-81BF-41A5-BB25-467DFEBEC4AC',
  'bounce_in_place': '709573AF-2A14-4227-AA09-14956D536733',
  'bounce': '7774C5E8-4913-47C5-92BB-31656273E58D',
  'Transpose Semitone Down': '253D4849-FD8F-47FE-93C3-F431E364B0A5',
  'Transpose Semitone Up': '66F81B7D-8EE6-495C-A5D2-831B7350218E',
  'Transpose Octave Down': '638AD000-6FF2-49F1-AB0C-259887FC69ED',
  'Transpose Octave Up': '99038043-F710-4990-B7DF-DCD1329B30C7',
  'Quantize': '5C81B286-2337-4AB1-B96B-DF2A6DA5286D',
  'legato': 'E59DAD35-F515-4C92-AC7D-965AA8C83AD2',
  'fixed_length': '9A701140-E54D-43B1-9013-3E4BE0E20DBD',
  'Loop Selection': '0C20E5DD-79B5-46E0-937B-591EB20E035F',
  'Toggle Track Timeline vs. Clip Content Editing': 'A6007505-D1AA-4F7F-A5F5-828464C0F6A4',
  'Toggle Arranger Cue Marker Visibility': '4E46A4C5-577B-40E4-97F1-57E3BCF2582F',
  'nudge_events_one_bar_earlier': '6F4494A9-25D6-42F6-91D2-839ADB616E3F',
  'nudge_events_one_step_earlier': '623EC344-D750-400B-AB4B-2B1775DACC0F',
  'nudge_events_one_bar_later': 'F5C80409-78FC-4689-B147-3A4BB79364FE',
  'nudge_events_one_step_later': 'EFB8F591-C209-4C96-9D5E-568CA39CA8A6',
  'make_events_one_bar_shorter': '5BA5CDA3-687E-4EF9-89E1-77D4BC59A88A',
  'make_events_one_step_shorter': 'E3F7AF35-AEF7-4BAD-8572-6BDC640F2C32',
  'make_events_one_bar_longer': 'C78BDE01-D080-4935-B32B-BE8EA18026B7',
  'make_events_one_step_longer': '56E06F40-7777-427A-9957-D6DFB9990D8F',
  'double_grid_size': '0DD86A63-8B7D-4F3B-9ABD-3A2EB22DEC00',
  'half_grid_size': '50096AE5-2482-4760-B974-4AEC7FC23E20',
  'toggle_object_snapping': 'EA9F287E-E0D1-4C32-B74F-E77AA96DED54',
  'toggle_absolute_grid_snapping': '29CC9A5A-ED3D-488B-A0D5-D4CA92C0F470',
  'toggle_relative_grid_snapping': '3AC47348-494F-4413-9EC7-CD90FAC58F14',
  'toggle_adaptive_grid': '00543B1F-BB8C-4A6A-AD3B-9296270CF5A9',
  'prev_grid_subdivision': 'FDFE5413-4ECC-44A4-8747-70F91FC4F891',
  'next_grid_subdivision': 'E9AE9A09-129C-44D6-8E32-09F56AEC2533',
  'adjust_event_value_step_up': 'BCF56C74-06B3-4290-B142-552F158E207D',
  'adjust_event_value_step_down': 'EBDC5ABD-1177-48F5-A216-28595D09631A',
  'adjust_event_value_fine_step_up': '0F47C3C0-D291-45E7-AC89-B75CE871A8FA',
  'adjust_event_value_fine_step_down': 'FFDF116B-4A94-431D-BA2E-E74157FB9518',
  'Create New Instrument': '9D9C7919-8DAB-4946-9058-5A661E76755D',
  'Create New Audio Effect': 'A0CC4EFA-4F66-4242-B0B4-8EA5CBDA124E',
  'Create New Note Effect': '09BA624B-A487-457D-866E-8193CAE80EBC',
  'Create New Detector': '31DA02FF-9BEC-47BD-9EEC-A0FA93D0380F',
  'Nudge Left': '7D8D7D02-A280-4374-9016-0D646BF1C0DA',
  'Nudge Right': 'E6704E1B-4042-4963-882D-688F80A5565A',
  'Nudge Up': '6E3E5412-9A56-4F96-9037-BA65CA1E8323',
  'Nudge Down': '603CB2AE-2C2F-4D54-A1F5-2821D152D3CF',
  'Nudge Left (coarse)': '9F3F3FD4-49BD-4715-9F6B-861913F8A2A4',
  'Nudge Right (coarse)': '3C3AA4F3-12B7-4FEA-A8F9-F7E337929A45',
  'Nudge Up (coarse)': 'A45D8CDC-81EC-43BF-8806-383A428D324F',
  'Nudge Down (coarse)': 'F0C988EC-A4AA-49AA-9C33-346CE26CCD4E',
  'Increase Width': '4FCF8987-DC30-4D45-AD2C-0AF53D063BEE',
  'Decrease Width': 'D1BD0FC1-8835-4C2C-A0F6-A42A55CDB650',
  'Increase Height': '1D46751F-597A-4C26-BEE0-7CE55132B38F',
  'Decrease Height': 'FA69F56C-DD70-4058-80F7-3B6C6A0D04FE',
  'Bring To Front': 'F8FC4E9C-57EE-4B94-9912-49E5D41A3A58',
  'Send To Back': '97B427E1-50F1-4A70-BD65-7B0EEA874151',
  'focus_browser_search_field': 'BDC9903E-9A75-4C13-81B0-7801BB8F95FA',
  'focus_file_overview': '25274FF8-4058-43B4-B6F3-7F5967279B5F',
  'focus_file_list': '022CC985-7B4D-4FAF-BDB9-A22504BAF44B',
  'toggle_preview_playback_of_selected_file': 'CDFBBBDF-4CE3-4FB1-82EC-AEB0B1F6E09C',
  'open_containing_folder': '645E1A44-5597-43EE-BF46-4B4E2BABF6AD',
  'edit_file_meta_data': '8A30B7D5-A9FB-4479-9A40-080B7BB1CF69',
  'Launch slot': '35659DCF-5BE9-47F2-88A1-6753E1EB7447',
  'slice_to_drum_track': 'A294375E-7CC7-4854-9595-1C648F529D05',
  'slice_to_multi_sampler_track': 'BF1EA992-1EDD-4F6F-B953-069C240E1245',
  'insert_silence': '81D9FA4E-B9B8-4AB4-BA58-A7961AA6C93B',
  'cut_and_pull': 'D453FD7B-04A1-4D57-B931-1B4CCD3B8C9A',
  'paste_and_push': '97A30254-A11D-4F69-B5CD-CC510ED83267',
  'duplicate_and_push': 'EDC7D10F-D787-4F74-AD6E-6FBDCCC6D3FD',
  'delete_and_pull': 'F79875CD-B6B1-4E71-AC1C-FC19B3046EA3',
  'toggle_folded_note_lanes': '4048C91A-5698-4148-9EAF-B554CFB9E514',
  'toggle_double_or_single_row_track_height': 'EF71E427-FB2A-4AE1-9765-75865FC86345',
  'unlock_all_layers': 'B3BCC847-001D-43ED-9612-C2032C676A0F',
  'toggle_layer_lock': 'AE09F30F-D0CC-41AA-A8CF-732CB7CF30F4',
  'toggle_layer_visibility': 'A036B219-3036-40CE-BE48-E609A8F91725'
};

exports.extended_ids = {
  'cursor track - activated - toggle': 'E46C6522-03F7-4056-9F94-FBE8D3674AFB',
  'cursor track - volume - +10%': '8802040A-2266-4F70-A19D-71C34E04D9B1',
  'cursor track - volume - +1%': 'C4EA90F9-34B5-4DF2-B218-4C7AE00DE7AE',
  'cursor track - volume - -1%': 'BAB65BCD-8C25-43A7-BE0D-5599DB12B7E8',
  'cursor track - volume - -10%': '2F2531B9-824E-4CC0-B5F2-F59959FFAAFB',
  'cursor track - volume - reset': 'E843DDFE-0D70-4FEE-B452-EB618A388956',
  'cursor track - pan - right 10%': 'A51FA179-0ED8-4667-9503-95081ECA987A',
  'cursor track - pan - right 1%': 'E3047EB3-7956-43BA-BAF3-E4C3ACA166AD',
  'cursor track - pan - left 1%': '09507833-DEC1-48BC-B77E-2E3CF4DB45A2',
  'cursor track - pan - left 10%': '83CE33B6-AA8C-4606-B256-586CAE21DD91',
  'cursor track - pan - reset': 'C8AE8B0C-5068-4E63-A7FF-32A2371353EE',
  'cursor track - mute - toggle': '9E00086E-78FB-4A6A-92D1-F52858C5EB62',
  'cursor track - solo - toggle': '49C65227-C8A4-48CD-8C98-24A63E4E2916',
  'cursor track - send S1 - +10%': 'F2940EAF-5950-427A-8DB6-5F371C61C135',
  'cursor track - send S1 - +1%': '92C3B055-295C-446D-9DE0-E0ED91FBF9AB',
  'cursor track - send S1 - -1%': '882E41F7-7A8C-474A-AB65-A65AC6213F7E',
  'cursor track - send S1 - -10%': '75852150-E10F-4619-8C06-8F7CD7AA03BD',
  'cursor track - send S1 - reset': '4A2C3ED8-2D95-4C46-8D5E-E887C71C3F1D',
  'cursor track - send S2 - +10%': '02AD4A52-836D-49ED-AADE-31ADB69A1A4C',
  'cursor track - send S2 - +1%': '7CB6EB8E-0DC4-4BBC-AC4F-163B26DF9ECD',
  'cursor track - send S2 - -1%': '36AEF03D-40DF-4432-93F2-DD35AA4A75BF',
  'cursor track - send S2 - -10%': 'B1CFFE09-F177-4DD8-B423-DBC495FE0D29',
  'cursor track - send S2 - reset': '0BDE4FA5-731B-411C-A894-93A4B80ABD9A',
  'cursor track - send S3 - +10%': 'B2ED547C-6CA7-43BF-9E01-50AC956A36A5',
  'cursor track - send S3 - +1%': '195C9AF8-0D5A-4DE9-8DBA-E431703426ED',
  'cursor track - send S3 - +1%': '195C9AF8-0D5A-4DE9-8DBA-E431703426ED',
  'cursor track - send S3 - +10%': 'B2ED547C-6CA7-43BF-9E01-50AC956A36A5',
  'cursor track - send S3 - reset': '40A8CEE1-D169-4C70-BE1B-434FFBAE438F',
  'cursor track - send S4 - +10%': '397464DB-2BF1-42BA-9CDE-943777CB45D9',
  'cursor track - send S4 - +1%': '72540A20-EAE0-4673-9BBD-37B3B96F528F',
  'cursor track - send S4 - -1%': '18976E8D-E117-4014-BB89-8F6A79DDFA18',
  'cursor track - send S4 - -10%': '529622EC-40A2-4AFD-BBB3-951C36A502FF',
  'cursor track - send S4 - reset': 'AA07EBDA-B1BF-4C47-8424-0E63887181A5',
  'cursor track - arm - toggle': '07DE9928-C4F5-4850-B3AC-4E9A60E6C156',
  'cursor track - monitor - toggle': '0BB913AE-7837-4E93-B1F4-5A3681896F73',
  'cursor track - auto monitor - toggle': '4CE6628C-FB16-4808-9D0A-5785FFC2E5DC',
  'cursor track - crossfade - mode A': '1CF1F98C-B30B-4168-A077-921D6CE6B1B6',
  'cursor track - crossfade - mode B': '98C38744-F3C5-48F3-B0E9-ADFB2B529A6C',
  'cursor track - crossfade - mode AB': '0457FF82-1A94-40DD-986E-9DA31D9ABC82',
  'cursor track - clip launcher - stop': 'A4F4B48D-F0D6-4F79-9A36-896D15C49415',
  'cursor track - clip laucner - preturn to arrangement': '3C05B39A-9E85-4252-A1F3-CE855696FF17'
};



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
    this.track = bitwig.createArrangerCursorTrack(4, 0);
    return this.track.addIsSelectedObserver((function(_this) {
      return function(selected) {
        return _this.trackSelected = selected;
      };
    })(this));
  },
  midi: function(s, d1, d2) {
    var index;
    if (s === 0xB1 && this.trackSelected) {
      index = (d1 << 7) + d2;
      if (index < this.actions.length) {
        return this.actions[index].fn.call(this);
      }
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
      id: 'cursor track - send S3 - +1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSend(2)) != null ? _ref.inc(-1, 101) : void 0;
      }
    }, {
      id: 'cursor track - send S3 - +10%',
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
      id: 'cursor track - clip laucner - preturn to arrangement',
      fn: function() {
        return this.track.returnToArrangement();
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
  var _ref;
  try {
    return (_ref = ids[id]) != null ? _ref : uuid.v4().toUpperCase();
  } catch (_error) {
    return uuid.v4().toUpperCase();
  }
};



},{"./actions":7,"./bitwig":8,"./extended_action":9,"JSON2":2,"uuid":5}]},{},[3,8,7,11,6,9,10]);
