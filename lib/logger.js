var util   = require('util');
var fs     = require('fs-extra');
var color  = require('colors');
var moment = require('moment');

exports.config = {
    displayNotices: false
};
var logObject = [];

exports.setConfig = function(config) {
    exports.config = config;
};

exports.report = function(dir) {
    var fileName = moment().format("YYYY-MM-DD_HH-mm-ss");
    fs.outputFileSync(dir + fileName + '.json', JSON.stringify(logObject, false, 4));
};


/**
 * Custom Logging function
 *
 * Writes Logs to console, stringifies objects first
 * If __report__ parameter is given, writes everything that has been logged to a logfile
 *
 * @param msg   String or Object
 */
exports.log = function (msg, silent) {

    if (msg === undefined) {
        util.print('>> Invalid Log msg Object!'.red + '\n');
        return;
    }

    // Write LogObject to File
    if (msg === '__report__') {

        var fileName = moment().format("YYYY-MM-DD_HH-mm-ss");
        fs.outputFileSync(__dirname + './../../__logfiles/' + fileName + '.json', JSON.stringify(logObject, false, 4));

    // Return LogObject
    } else if (msg === '__return__') {

        return logObject;

    // Actual Logging
    } else {

        logObject.push(msg);

        if (!silent) {
            // If msg is an object -> convert it to a JSON string
            if (msg !== null && typeof msg === 'object') {
                msg = JSON.stringify(msg, false, 4);
            }

            // Colorize Console Output
            if (msg.indexOf('[WARNING]') > -1) {
                util.print(msg.yellow + '\n');
            } else if (msg.indexOf('[ERROR]') > -1) {
                util.print(msg.red + '\n');
            } else if (msg.indexOf('[SUCCESS]') > -1) {
                util.print(msg.green + '\n');
            } else if (msg.indexOf('[NOTICE]') > -1) {
                if (exports.config.displayNotices) {
                    util.print(msg.blue + '\n');
                }
            } else if (msg.indexOf('[INFO]') > -1) {
                util.print(msg.blue + '\n');
            } else if (msg.indexOf(' - ') > -1) {
                util.print(msg.red + '\n');
            } else if (msg.indexOf(' C ') > -1) {
                util.print(msg.cyan + '\n');
            } else {
                util.print(msg + '\n');
            }

        }

    }

};
