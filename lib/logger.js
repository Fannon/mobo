/* jshint unused: false */


//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs     = require('fs-extra');
var colors = require('colors');
var moment = require('moment');


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Custom Logging function
 *
 * Writes Logs to console, stringifies objects first
 *
 * @param msg   String or Object
 */
exports.log = function (msg, silent) {

    if (msg === undefined) {
        console.log(' [E] Invalid Log msg Object!'.red);

    } else { // Actual Logging

        global.moboLogObject.push(msg);

        if (!silent) {

            // If msg is an object -> convert it to a JSON string
            if (msg !== null && typeof msg === 'object') {

                // If the object is an error object
                if (msg.stack && msg.name && msg.message) {

                    // Print stacktrace
                    msg = '> '.red + msg.stack.grey + '\n';

                // Output objects as a formatted JSON string
                } else {
                    msg = JSON.stringify(msg, false, 4);
                    msg = msg.grey;
                }
            }

            // Colorize Console Output
            if (msg.indexOf('[+]') > -1) {            // ADDED
                console.log(msg.green);
            } else if (msg.indexOf('[-]') > -1) {     // REMOVED
                console.log(msg.red);
            } else if (msg.indexOf('[C]') > -1) {     // CHANGED
                console.log(msg.cyan);
            } else if (msg.indexOf('[W]') > -1) {       // WARNING
                console.log(msg.yellow);
            } else if (msg.indexOf('[E]') > -1) {       // ERROR
                console.log(msg.red);
            } else if (msg.indexOf('[S]') > -1) {       // SUCCESS
                console.log(msg.green);
            } else if (msg.indexOf('[i]') > -1) {       // INFO / NOTICE
                console.log(msg.blue);
            } else if (msg.indexOf('[TODO]') > -1) {
                console.log(msg.magenta);
            } else if (msg.indexOf('[DEBUG]') > -1) {
                console.log(msg.magenta);
            } else {
                console.log(msg);
            }

        }

    }

};

/**
 * Clears (empties) the log object
 */
exports.clear = function() {
    global.moboLogObject = [];
};

/**
 * Writes the current log object to a file in the given directory
 *
 * @param dir   filepath
 */
exports.report = function(dir) {
    if (dir) {
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
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

