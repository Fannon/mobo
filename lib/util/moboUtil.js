/* jshint unused: false */

//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs     = require('fs-extra');
var path     = require('path');
var colors = require('colors'); // sic


//////////////////////////////////////////
// LOGGER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Custom Logging function
 *
 * Writes Logs to console, stringifies objects first
 *
 * @param {string|object}   msg     Message String or Object
 * @param {boolean}         silent  Dot not print message to the console, but stores it to the log history.
 */
exports.log = function (msg, silent) {

    if (msg === undefined) {

        console.log(' [E] Invalid Log msg Object!'.red);

    } else { // Actual Logging

        global.moboLogObject.push(msg);

        if (!silent) {

            // msg is an object -> convert it to a JSON string
            if (msg !== null && typeof msg === 'object') {

                if (msg.stack && msg.name && msg.message) {
                    // If the object is an error object, print the stacktrace
                    console.log('> '.red + msg.stack.grey + '\n');
                } else {
                    // Output regular objects as a formatted JSON string
                    msg = JSON.stringify(msg, false, 4);
                   console.log(msg.grey);
                }

            // msg is a string
            } else if (msg.indexOf('[E]') > -1) {       // ERROR
                console.log(msg.red);
            } else if (msg.indexOf('[W]') > -1) {       // WARNING
                console.log(msg.yellow);
            } else if (msg.indexOf('[S]') > -1) {       // SUCCESS
                console.log(msg.green);
            } else if (msg.indexOf('[i]') > -1) {       // INFO / NOTICE
                console.log(msg.blue);
            } else if (msg.indexOf('[+]') > -1) {       // ADDED
                console.log(msg.green);
            } else if (msg.indexOf('[-]') > -1) {       // REMOVED
                console.log(msg.red);
            } else if (msg.indexOf('[C]') > -1) {       // CHANGED
                console.log(msg.cyan);
            } else if (msg.indexOf('[D]') > -1) {       // DEBUG
                console.log(msg.magenta);
            } else if (msg.indexOf('[TODO]') > -1) {    // TO DO
                console.log(msg.magenta);
            } else {
                console.log(msg);                       // REGULAR TEXT
            }
        }
    }

    return msg;
};

/**
 * Clears (empties) the log object
 */
exports.clearLogHistory = function() {
    global.moboLogObject = [];
    return global.moboLogObject;
};

/**
 * Writes the current log object to a file in the given directory
 *
 * @param dir   filepath
 */
exports.writeLogHistory = function(dir) {
    if (dir && fs.existsSync(dir)) {
        var fileName = exports.roboDate();
        fileName = path.resolve(dir, fileName + '.json');
        fs.outputFileSync(fileName, JSON.stringify(global.moboLogObject, false, 4));
    }
};

/**
 * Returns the global.moboLogObject
 *
 * @returns {Array}
 */
exports.getLogHistory = function() {
    return global.moboLogObject;
};

//////////////////////////////////////////
// MODELING HELPER                      //
//////////////////////////////////////////

/**
 * Takes an model/field/form $extend URL and returns the name of the file without extension
 *
 * @param {string} url
 * @param {string} hint
 * @returns {object|boolean}
 */
exports.resolveReference = function(url, hint) {

    /** If an error occurs, this gives a hint in which file */
    if (hint) {
        hint = ' ' + hint + ': ';
    } else {
        hint = '';
    }

    if (url.indexOf('/') > -1) {
        var ref = url.split('/');

        if (ref.length === 3) {

            // TODO: Would be more consequent to always strip the file extension
            // This does currently cause problems with .wikitext mobo_template and the queries
            //var id = ref[2].substr(0, ref[2].lastIndexOf('.'));

            var id = ref[2].replace('.json', '');
            return {
                "path": url,
                "type": ref[1],
                "filename": ref[2],
                "id": id
            };
        } else {
            exports.log(' [E]' + hint + ' Malformed "$reference" or "format" path: ' + url);
            exports.log(' [i] Do not include include subfolders in the "$extend" or "format" path!');
            return false;
        }

    } else {
        // if "format" is not a path, the name is already the id
        return {
            id: url
        };
    }

};


/**
 * Calculates the prefixed wikitext, if the model requests it
 *
 * @param {string}  type        'showForm' or 'showPage'
 * @param {object}  model
 * @param {object}  registry
 *
 * @returns {boolean|object}
 */
exports.prefixModel = function(type, model, registry) {

    var prefix = false;

    if (model.items) {
        model = model.items;
    }

    if (model.smw_prefix) {

        // Prefix is by default always displayed, except it is explicitly disabled by setting it false;
        if (model.smw_prefix.hasOwnProperty(type) && model.smw_prefix[type] === false) {
            return false;

        } else {
            prefix = '';

            // Inject auto header, depending on given hierachy
            if (model.smw_prefix.header) {
                var headerLevel = '=';
                if (model.smw_prefix.header > 0 && model.smw_prefix.header < 5) {
                    headerLevel = new Array(model.smw_prefix.header + 1).join('=');
                }
                prefix += headerLevel + model.title + headerLevel + '\n';
            }

            // Inject wikitext
            if (model.smw_prefix.wikitext ) {
                prefix += model.smw_prefix.wikitext + '\n';
            }

            // Inject already existing template
            if (model.smw_prefix.template) {
                if (registry.smw_template[model.smw_prefix.template + '.wikitext']) {
                    prefix += registry.smw_template[model.smw_prefix.template + '.wikitext'];
                } else {
                    exports.log(' [E] ' + model.$filepath + ' references to non exisiting template: ' + model.smw_prefix.template);
                }
            }
        }
    }

    return prefix;
};

/**
 * Calculates the postfixed wikitext, if the model requests it
 *
 * @param {string}  type        'showForm' or 'showPage'
 * @param {object}  model
 * @param {object}  registry
 *
 * @returns {boolean|object}
 */
exports.postfixModel = function(type, model, registry) {

    var postfix = false;

    if (model.items) {
        model = model.items;
    }

    if (model.smw_postfix) {

        // Postfix is by default always displayed, except it is explicitly disabled by setting it false;
        if (model.smw_postfix.hasOwnProperty(type) && model.smw_postfix[type] === false) {
            return false;

        } else {
            postfix = '';

            // Inject wikitext
            if (model.smw_postfix.wikitext) {
                postfix += model.smw_postfix.wikitext + '\n';
            }

            // Inject already existing template
            if (model.smw_postfix.template) {
                if (registry.smw_template[model.smw_postfix.template + '.wikitext']) {
                    postfix += registry.smw_template[model.smw_postfix.template + '.wikitext'];
                } else {
                    exports.log(' [E] ' + model.$filepath + ' references to non exisiting template: ' + model.smw_postfix.template);
                }
            }

        }
    }

    return postfix;
};


//////////////////////////////////////////
// MISC HELPER FUNCTIONS                //
//////////////////////////////////////////

/**
 * Pad a number with n digits
 *
 * @param {number} number   number to pad
 * @param {number} digits   number of total digits
 * @returns {string}
 */
exports.pad = function pad(number, digits) {
    return new Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
};

/**
 * Strips trailing slashes from URL
 *
 * @see http://stackoverflow.com/a/6680858/776425
 *
 * @param {String} url URL to cleanup
 * @returns {String}
 */
exports.stripTrailingSlash = function(url) {
    if(url.substr(-1) === '/') {
        url = url.substr(0, url.length - 1);
    }
    return url;
};

/**
 * Returns an array with date / time information
 * Starts with year at index 0 up to index 6 for milliseconds
 *
 * @param {Date=} date   Optional date object. If falsy, will take current time.
 * @returns {[]}
 */
exports.getDateArray = function(date) {
    date = date || new Date();
    return [
        date.getFullYear(),
        exports.pad(date.getMonth()+1, 2),
        exports.pad(date.getDate(), 2),
        exports.pad(date.getHours(), 2),
        exports.pad(date.getMinutes(), 2),
        exports.pad(date.getSeconds(), 2),
        exports.pad(date.getMilliseconds(), 2)
    ];
};

/**
 * Returns nicely formatted date-time
 * @example 2015-02-10 16:01:12
 *
 * @param {object} date
 * @returns {string}
 */
exports.humanDate = function(date) {
    var d = exports.getDateArray(date);
    return d[0] + '-' + d[1] + '-' + d[2] + ' ' + d[3] + ':' + d[4] + ':' + d[5];
};

/**
 * Returns a formatted date-time, optimized for machines
 * @example 2015-02-10_16-00-08
 *
 * @param {object} date
 * @returns {string}
 */
exports.roboDate = function(date) {
    var d = exports.getDateArray(date);
    return d[0] + '-' + d[1] + '-' + d[2] + '_' + d[3] + '-' + d[4] + '-' + d[5];
};