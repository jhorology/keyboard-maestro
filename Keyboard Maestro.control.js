/*! keyboard-maestro - v0.2.0 - 2014-12-20 */
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
    index = (d1 << 7) + d2;
    if (s === 0xB0 && index < actions.ids.length) {
      return this.application.getAction(actions.ids[index]).invoke();
    }
  }
};



},{"./actions":5,"./bitwig":6}],5:[function(require,module,exports){
exports.version = '1.1.3 RC 1';

exports.ids = ['New', 'Open', 'Save', 'Save as', 'Close', 'Preferences', 'Quit', 'Undo', 'Redo', 'Cut', 'Cut Special', 'Copy', 'Copy Special', 'Paste', 'Paste Special', 'Duplicate', 'Duplicate Special', 'Group', 'Ungroup', 'Toggle Active', 'Activate', 'Deactivate', 'Delete', 'Delete Special', 'Select All', 'Unselect All', 'Rename', 'Click button', 'Activate item', 'Cancel Dialog', 'Dialog: Yes', 'Dialog: No', 'Dialog: OK', 'Delete character to left of cursor', 'Delete character to right of cursor', 'Insert new line', 'Commit text', 'Reload', 'Previous history entry', 'Next history entry', 'Move cursor left', 'Move cursor right', 'Move cursor up', 'Move cursor down', 'Move cursor to start of document', 'Move cursor to end of document', 'Move cursor to start of line', 'Move cursor to end of line', 'Move cursor word left', 'Move cursor word right', 'Move cursor and extend selection left', 'Move cursor and extend selection right', 'Move cursor and extend selection up', 'Move cursor and extend selection down', 'Move cursor and extend selection to start of document', 'Move cursor and extend selection to end of document', 'Move cursor and extend selection to start of document', 'Move cursor and extend selection to end of document', 'Move cursor and extend selection word left', 'Move cursor and extend selection word right', 'Select first item', 'Select last item', 'move_selection_cursor_to_first_item', 'move_selection_cursor_to_last_item', 'move_selection_cursor_to_next_item', 'move_selection_cursor_to_previous_item', 'Extend selection range to first item', 'Extend selection range to last item', 'Extend selection to next item', 'Extend selection range to previous item', 'Extend selection to first item', 'Extend selection to last item', 'Select previous item', 'Select next item', 'Extend selection to next item', 'Extend selection to previous item', 'Toggle selection of item at cursor', 'Select item in next lane', 'Select item in previous lane', 'Select item in first lane', 'Select item in last lane', 'Move cursor to next lane', 'Move cursor to previous lane', 'Move cursor to first lane', 'Move cursor to last lane', 'Extend selection to next lane', 'Extend selection to previous lane', 'Extend selection to first lane', 'Extend selection to last lane', 'Extend selection range to next lane', 'Extend selection range to previous lane', 'Extend selection range to first lane', 'Extend selection range to last lane', 'Select item to left', 'Select item to right', 'Select item above', 'Select item below', 'Move selection cursor left', 'Move selection cursor right', 'Move selection cursor up', 'Move selection cursor down', 'Extend selection range to item to left', 'Extend selection range to item to right', 'Extend selection range to item above', 'Extend selection range to item below', 'Extend selection to item to left', 'Extend selection to item to right', 'Extend selection to item above', 'Extend selection to item below', 'Focus panel to the left', 'Focus panel to the right', 'Focus panel above', 'Focus panel below', 'Focus next panel', 'Focus previous panel', 'Focus next field', 'Focus previous field', 'Focus widget to the left', 'Focus widget to the right', 'Focus widget above', 'Focus widget below', 'Toggle expanded state', 'Zoom In', 'Zoom Out', 'Zoom to Fit', 'Maximize window', 'Minimize window', 'Full screen', 'Select Next Project', 'Select Previous Project', 'select_next_tab', 'select_previous_tab', 'Connect to Remote Project', 'Show Controller Script Console', 'help_user_guide', 'help_user_guide_jp', 'check_for_updates', 'invoke_action', 'Collect and Save', 'Activate Engine For Project', 'Create Instrument Track', 'Create Audio Track', 'Create Effect Track', 'Create Scene', 'Create Event', 'Select previous track', 'Select next track', 'focus_track_header_area', 'toggle_clip_launcher', 'focus_or_toggle_clip_launcher', 'Play Transport', 'Continue Play Transport', 'Play Transport From Start', 'Stop Transport', 'Play or Stop Transport', 'Play or Pause Transport', 'Continue Playback or Stop', 'Play From Start or Stop Transport', 'Toggle Record', 'Tap Tempo', 'Export Audio', 'export_midi', 'Select Pointer Tool', 'select_time_selection_tool', 'Select Pen Tool', 'Select Eraser Tool', 'Select Knife Tool', 'toggle_browser_panel', 'toggle_device_panel', 'toggle_arranger', 'toggle_detail_editor', 'toggle_automation_editor', 'toggle_mixer', 'toggle_inspector', 'toggle_studio_io', 'toggle_song_panel', 'focus_or_toggle_browser_panel', 'focus_or_toggle_device_panel', 'focus_or_toggle_arranger', 'focus_or_toggle_detail_editor', 'focus_or_toggle_automation_editor', 'focus_or_toggle_mixer', 'focus_or_toggle_inspector', 'focus_or_toggle_studio_io', 'focus_or_toggle_song_panel', 'Switch to Mode 1', 'Switch to Mode 2', 'Switch to Mode 3', 'Switch to Mode 4', 'Select Next Mode', 'Select Previous Mode', 'Toggle maximized editing mode', 'Select sub panel 1', 'Select sub panel 2', 'Select sub panel 3', 'Select sub panel 4', 'Select next sub panel', 'Select previous sub panel', 'Show Track Inputs and Outputs', 'Show Sends', 'Show Crossfades', 'Show Effect Tracks', 'Split', 'Consolidate', 'bounce_in_place', 'bounce', 'Transpose Semitone Down', 'Transpose Semitone Up', 'Transpose Octave Down', 'Transpose Octave Up', 'Quantize', 'legato', 'fixed_length', 'Loop Selection', 'Toggle Track Timeline vs. Clip Content Editing', 'Toggle Arranger Cue Marker Visibility', 'nudge_events_one_bar_earlier', 'nudge_events_one_step_earlier', 'nudge_events_one_bar_later', 'nudge_events_one_step_later', 'make_events_one_bar_shorter', 'make_events_one_step_shorter', 'make_events_one_bar_longer', 'make_events_one_step_longer', 'double_grid_size', 'half_grid_size', 'toggle_object_snapping', 'toggle_absolute_grid_snapping', 'toggle_relative_grid_snapping', 'toggle_adaptive_grid', 'prev_grid_subdivision', 'next_grid_subdivision', 'adjust_event_value_step_up', 'adjust_event_value_step_down', 'adjust_event_value_fine_step_up', 'adjust_event_value_fine_step_down', 'Create New Instrument', 'Create New Audio Effect', 'Create New Note Effect', 'Create New Detector', 'Nudge Left', 'Nudge Right', 'Nudge Up', 'Nudge Down', 'Nudge Left (coarse)', 'Nudge Right (coarse)', 'Nudge Up (coarse)', 'Nudge Down (coarse)', 'Increase Width', 'Decrease Width', 'Increase Height', 'Decrease Height', 'Bring To Front', 'Send To Back', 'focus_browser_search_field', 'focus_file_overview', 'focus_file_list', 'toggle_preview_playback_of_selected_file', 'open_containing_folder', 'edit_file_meta_data', 'Launch slot', 'slice_to_drum_track', 'slice_to_multi_sampler_track', 'insert_silence', 'cut_and_pull', 'paste_and_push', 'duplicate_and_push', 'delete_and_pull', 'toggle_folded_note_lanes', 'toggle_double_or_single_row_track_height', 'unlock_all_layers', 'toggle_layer_lock', 'toggle_layer_visibility', 'cursor track - toggle activated', 'cursor track - up volume 10%', 'cursor track - up volume 1%', 'cursor track - down volume 1%', 'cursor track - down volume 10%', 'cursor track - reset volume', 'cursor track - pan right 10%', 'cursor track - pan right 1%', 'cursor track - pan left 1%', 'cursor track - pan left 10%', 'cursor track - reset pan', 'cursor track - toggle mute', 'cursor track - toggle solo'];



},{}],6:[function(require,module,exports){
(function (global){
global.loadAPI(1);

module.exports = global.host;



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
var bitwig;

bitwig = require('./bitwig');

module.exports = {
  init: function() {
    return this.track = bitwig.createArrangerCursorTrack(4, 0);
  },
  midi: function(s, d1, d2) {
    var index;
    index = (d1 << 7) + d2;
    if (s === 0xB1 && index < this.actions.length) {
      return this.actions[index].fn.call(this);
    }
  },
  actions: [
    {
      id: 'cursor track - toggle activated',
      fn: function() {
        var _ref;
        return (_ref = this.track.isActivated()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - up volume 10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(10, 100) : void 0;
      }
    }, {
      id: 'cursor track - up volume 1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(1, 100) : void 0;
      }
    }, {
      id: 'cursor track - down volume 1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(-1, 100) : void 0;
      }
    }, {
      id: 'cursor track - down volume 10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.inc(-10, 100) : void 0;
      }
    }, {
      id: 'cursor track - reset volume',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - pan right 10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(10, 100) : void 0;
      }
    }, {
      id: 'cursor track - pan right 1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(1, 100) : void 0;
      }
    }, {
      id: 'cursor track - pan left 1%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(-1, 100) : void 0;
      }
    }, {
      id: 'cursor track - pan left 10%',
      fn: function() {
        var _ref;
        return (_ref = this.track.getPan()) != null ? _ref.inc(-10, 100) : void 0;
      }
    }, {
      id: 'cursor track - reset pan',
      fn: function() {
        var _ref;
        return (_ref = this.track.getVolume()) != null ? _ref.reset() : void 0;
      }
    }, {
      id: 'cursor track - toggle mute',
      fn: function() {
        var _ref;
        return (_ref = this.track.getMute()) != null ? _ref.toggle() : void 0;
      }
    }, {
      id: 'cursor track - toggle solo',
      fn: function() {
        var _ref;
        return (_ref = this.track.getSolo()) != null ? _ref.toggle() : void 0;
      }
    }
  ]
};



},{"./bitwig":6}],8:[function(require,module,exports){
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
},{"./action":4,"./bitwig":6,"./extended_action":7,"./util":9}],9:[function(require,module,exports){
var JSON2, bitwig, extendedActions;

bitwig = require('./bitwig');

JSON2 = require('JSON2');

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
    var action, i, j;
    bitwig.println(JSON2.stringify({
      hostVersion: String(bitwig.getHostVersion()),
      hostApiVersion: Number(bitwig.getHostApiVersion()),
      actions: ((function() {
        var _i, _len, _ref, _results;
        _ref = this.application.getActions();
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          action = _ref[i];
          _results.push({
            id: String(action.getId()),
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
            category: 'Extended',
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



},{"./bitwig":6,"./extended_action":7,"JSON2":2}]},{},[3,6,5,9,4,7,8]);
