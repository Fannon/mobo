//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs     = require('fs-extra');
var path   = require('path');
var RSVP   = require('rsvp');

var logger = require('./logger.js');
var log    = logger.log;


/**
 * Gets all Content in a directory and returns it as a JavaScript Object
 * JSON Files will be converted to JS Objects
 * Subdirectories will be flattened!
 *
 * Returns a promise!
 *
 * @param dirName
 * @returns {RSVP.Promise}
 */
exports.read = function(dirName) {

    var promise = new RSVP.Promise(function(resolve, reject) {

        exports.walk(dirName, function(err, files) {

            if (err) {
                log('> [ERROR] Could not read directory: ' + dirName);
                reject(err);
            } else {
                exports.readFiles(files, function(err, content) {
                    resolve(content);
                });
            }

        });

    });

    return promise;

};

/**
 * Does a recursive walk through a directory and its subdirectories
 *
 * Based on http://stackoverflow.com/a/5827895/776425
 *
 * @param dir
 * @param callback
 */
exports.walk = function(dir, callback) {

    var results = [];

    fs.readdir(dir, function(err, list) {

        if (err) {
            return callback(err);
        }
        var pending = list.length;

        if (!pending) {
            return callback(null, results);
        }

        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    exports.walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) {
                            callback(null, results);
                        }
                    });
                } else {
                    results.push(file);
                    if (!--pending) {
                        callback(null, results);
                    }
                }
            });
        });
    });
};

/**
 * Reads the files from filesystem and parses them according to the datatype
 *
 * @param files
 * @returns {{}}
 */
exports.readFiles = function(files, callback) {

    var content = {};

    for (var i = 0; i < files.length; i++) {

        var filePath = files[i];
        var fileName = path.basename(filePath, '.json');
        var fileExtension = path.extname(filePath);

        // Skip Readme files
        if (fileExtension !== '.txt' &&
            fileExtension !== '.md' &&
            fileExtension !== '.MD') {

            // Read File
            var file = fs.readFileSync(filePath);

            // Handle JSON Files:
            if (fileExtension === '.json') {

                // Parse File
                try {

                    var json = JSON.parse(file);

                    // If ignore attribute is set, do not include in registry!
                    if (!json.ignore) {
                        content[fileName] = json;
                        content[fileName].id = fileName; // Set ID to Filename
                    }

                    // Validate: JSON File should have at least a title!
                    if (!json.title) {
                        log('> [NOTICE] ' + fileName + ' has no title attribute!');
                    }

                } catch (e) {
                    // JSON PARSE ERROR
                    log('> [ERROR] ' + fileName + '.json - JSON ' + e);
                }

                // Handle other files (.wikitext)
            } else {
                content[fileName] = file.toString();
            }
        }

    }

    return callback(false, content);
};
