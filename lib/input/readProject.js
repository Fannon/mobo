//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var path       = require('path');
var Promise    = require('bluebird');
var yaml       = require('js-yaml');

var semlog     = require('semlog');
var log        = semlog.log;


//////////////////////////////////////////
// READ MODEL TO REGISTRY               //
//////////////////////////////////////////

exports.exec = function(importModelDir) {

    'use strict';

    return new Promise(function(resolve, reject) {

        /**
         * The Registry is the main object mobo works with.
         * It contains all imported files from the project, json files already converted to objects.
         * It also contains the processed / extended fields, including inheritance. Those are prefixed with "expanded"
         * Lastly, it included a collection of the final "generated" wikitext pages
         * @type {{}}
         */
        var registry = {};

        exports.stats = {
            total: 0
        };

        // Directories to fetch
        var directories = ['field', 'model', 'form', 'smw_template', 'smw_query', 'smw_page'];

        // Fill Registry
        var directoryWorker = directories.map(function(name) {

            return exports.read(importModelDir + '/' + name + '/', name).then(function(content) {
                registry[name] = content;
            }, function(err) {
                log('[E] Could not read project directory /' + name);
                log(err);
            });
        });

        // After all directories are read
        Promise.all(directoryWorker).then(function() {

            // Add inputSize statistics
            registry.statistics = {
                inputSize: exports.stats
            };

            //registry = exports.postProcessing(registry);
            resolve(registry);
        }).catch(function(e) {
            reject(e);
        });
    });


};


/**
 * Gets all Content in a directory and returns it as a JavaScript Object
 * JSON Files will be converted to JS Objects
 * Subdirectories will be flattened!
 *
 * Returns a promise!
 *
 * @param dirName
 * @param dirName
 *
 * @returns {object} promise
 */
exports.read = function(dirName, type) {

    'use strict';

    return new Promise(function(resolve, reject) {

        exports.walk(dirName, function(err, files) {
            if (err) {
                log('[E] Could not read directory: ' + dirName);
                reject(err);
            } else {
                exports.readFiles(files, type, function(err, content) {
                    resolve(content);
                });
            }
        });
    });

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

    'use strict';

    var results = [];
    var ignoreArray = ['node_modules'];

    fs.readdir(dir, function(err, list) {

        if (!list) {
            return callback(new Error('Cannot read directory: ' + dir));
        }

        var pending = list.length;

        if (err || !list) {
            return callback(err);
        } else if (!pending) {
            return callback(null, results);
        }


        list.forEach(function(file) {

            // Ignore all dirs / files that are listed in the ignore array
            if (ignoreArray.indexOf(file) > -1) {
                log('[i] Ignoring "' + file + '" in directory ' + dir);
                pending -= 1;
            } else {

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
            }

        });
    });
};

/**
 * Reads the files from filesystem and parses them according to the datatype
 *
 * @param files
 * @param type
 * @param callback
 *
 * @returns {{}}
 */
exports.readFiles = function(files, type, callback) {

    'use strict';

    var content = {};

    for (var i = 0; i < files.length; i++) {

        var file;
        var filePath = path.normalize(files[i]);
        var fileExtension = path.extname(filePath);
        var relativeFilePath = path.relative(process.cwd(), filePath);

        var fileName = path.basename(filePath, '.json');
        fileName = fileName.replace('.yaml', '');
        fileName = fileName.replace('.yml', '');

        // Skip duplicate files, give warning
        if (content[fileName]) {
            log('[E] Duplicated Filename detected: ' + fileName + '!');
            continue;
        }

        // Skip Readme files
        if (fileExtension === '.md' || fileExtension === '.MD') {
            continue;
        }


        //////////////////////////////////////////
        // READ FILE                            //
        //////////////////////////////////////////

        try {
            file = fs.readFileSync(filePath);

            // Statistics
            var fileContent = file.toString();

            if (fileContent.trim().length === 0) {
                log('[W] [FILESYSTEM] File is empty: ' + filePath);
                continue;
            }

            if (type === 'field' || type === 'model' || type === 'form') {
                fileContent = fileContent.replace(/ /g, ''); // Strip all whitespaces
            }

            // Write Statistics
            var fileSize = fileContent.length;
            if (exports.stats) {
                exports.stats.total += fileSize;
                if (exports.stats[type]) {
                    exports.stats[type] += fileSize;
                } else {
                    exports.stats[type] = fileSize;
                }
            }

        } catch (e) {
            log('[E] [FILESYSTEM] Could not read file' + filePath);
            log(e);
            continue;
        }

        var interpretedContent = exports.interpretFile(file, fileName, relativeFilePath, fileExtension);

        // Dont add the
        if (interpretedContent) {
            content[fileName] = interpretedContent;
        }

    }

    return callback(false, content);
};

/**
 * Helper function that interprets, parses and processes a file.
 *
 * Different files require different handling, especially JSON and YAML files
 * They will be parsed to objects and enriched with calculated meta-data
 *
 * @param file
 * @param fileName
 * @param relativeFilePath
 * @param fileExtension
 *
 * @returns {*}
 */
exports.interpretFile = function(file, fileName, relativeFilePath, fileExtension) {

    var obj;
    var isObject = true;

    //////////////////////////////////////////
    // PARSE FILE                           //
    //////////////////////////////////////////

    // PARSE YAML FILES
    if (fileExtension === '.yaml' || fileExtension === '.yml' || fileExtension === '.json') {
        try {
            obj = yaml.load(file);
        } catch (e) {
            // YAML PARSE ERROR
            log('[E] [SYNTAX] ' + relativeFilePath + ': ' + e.reason);
            delete e.message;
            delete e.mark.buffer;
            log(e);
            return false;
        }
    } else {
        isObject = false;
        obj = file.toString();
    }

    //////////////////////////////////////////
    // ADD METADATA TO OBJECTS              //
    //////////////////////////////////////////

    if (isObject && typeof obj === 'object' && !obj.ignore) {

        // If ignore attribute is set, do not include in registry!
        var filePathArray = relativeFilePath.split(path.sep);

        obj.id = fileName; // Set ID to Filename
        obj.$filepath = '/' + filePathArray.join('/'); // Store relative filepath
        obj.$path = '/' + filePathArray[0] + '/' + fileName;

        // If object is not explicitly declared as abstract, set abstract to false.
        // This prevents from having to write abstract = false with all objects that inherit from an abstract one.
        if (!obj.abstract) {
            obj.abstract = false;
        }

        // Same goes for the ignore attribute
        if (!obj.ignore) {
            obj.ignore = false;
        }

        // Same goes for the ignore attribute
        if (!obj.todo) {
            obj.todo = '';
        }
    }

    return obj;
};
