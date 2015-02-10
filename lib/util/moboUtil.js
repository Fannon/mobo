/* jshint unused: false */

//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs     = require('fs-extra');
var colors = require('colors'); // sic
var moment = require('moment');


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
            } else if (msg.indexOf('[TODO]') > -1) {    // TO DO
                console.log(msg.magenta);
            } else if (msg.indexOf('[DEBUG]') > -1) {   // DEBUG
                console.log(msg.magenta);
            } else {
                console.log(msg);                       // REGULAR TEXT
            }
        }
    }
};

/**
 * Clears (empties) the log object
 */
exports.clearLogObject = function() {
    global.moboLogObject = [];
};

/**
 * Writes the current log object to a file in the given directory
 *
 * @param dir   filepath
 */
exports.printLogObject = function(dir) {
    if (dir && fs.existsSync(dir)) {
        var fileName = moment().format("YYYY-MM-DD_HH-mm-ss");
        fs.outputFileSync(dir + fileName + '.json', JSON.stringify(global.moboLogObject, false, 4));
    }
};

/**
 * Returns the global.moboLogObject
 *
 * @returns {Array}
 */
exports.returnLogObject = function() {
    return global.moboLogObject;
};


//////////////////////////////////////////
// MISC HELPER FUNCTIONS                //
//////////////////////////////////////////

/**
 * Pad a number with n digits
 *
 * @param number
 * @param digits
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
 * @param {String} str URL to cleanup
 * @returns {String}
 */
exports.stripTrailingSlash = function(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
};

/**
 * Returns nicely formatted date-time
 *
 * @see http://stackoverflow.com/a/13219636
 *
 * @param {object} date
 * @returns {string}
 */
exports.niceDate = function(date) {
    date = date || new Date();
    return date.toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '');
}