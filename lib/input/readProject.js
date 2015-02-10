//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                  = require('fs-extra');
var Promise             = require('bluebird');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;
var getDirectoryContent = require('../getDirectoryContent.js');
var validateSchema = require('./../util/validateSchema.js');



//////////////////////////////////////////
// READ MODEL TO REGISTRY               //
//////////////////////////////////////////

exports.exec = function(settings) {

    var registry = {};


// Directories to fetch
    var directories = ['field', 'model', 'form', 'smw_template', 'smw_query', 'smw_page'];

// Fill Registry
    var promises = directories.map(function(name){

        var promise = getDirectoryContent.read(settings.importModelDir + '/' + name + '/');
        promise.then(function(content) {
            registry[name] = content;
        }, function(err) {
            log(' [E] Could not read project directory /' + name);
            log(err);
        });
        return promise;
    });

// After all directories are read
    Promise.all(promises).then(function() {

        /** Fallback for @deprecated project structure! */
        if (!registry.smw_page) {
            registry.smw_page = getDirectoryContent.read(settings.importModelDir + '/smw_site/');
            log(' [W] Wiki pages are now stored into /smw_site/ folder instead of /smw_page/ !');
            log(' [W] Please rename your directory accordingly!');
        }

        //////////////////////////////////////////
        // VALIDATE JSON STRUCTURE              //
        //////////////////////////////////////////

        validateSchema.validateBatch('field', registry.field);
        validateSchema.validateBatch('model', registry.model);
        validateSchema.validateBatch('form', registry.form);




        callback(false, registry);


    }).catch(function(error){
        callback(error, false);
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
 * @returns {Promise.Promise}
 */
exports.read = function(dirName) {

    return new Promise(function(resolve, reject) {

        exports.walk(dirName, function(err, files) {
            if (err) {
                log(' [E] Could not read directory: ' + dirName);
                reject(err);
            } else {
                exports.readFiles(files, function(err, content) {
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

        var filePath = path.normalize(files[i]);
        var fileName = path.basename(filePath, '.json');
        var fileExtension = path.extname(filePath);

        if (content[fileName]) {
            log(' [E] Duplicated Filename detected: ' + fileName + '!');
        }

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
                        var filePathArray = path.relative(process.cwd(), filePath).split(path.sep);
                        content[fileName].$filepath = '/' + filePathArray.join('/'); // Store relative filepath
                    }

                } catch (e) {
                    // JSON PARSE ERROR
                    log(' [E]   [JSON SYNTAX] ' + fileName + '.json ' + e);
                }

                // Handle other files (.wikitext)
            } else {
                content[fileName] = file.toString();
            }
        }

    }

    return callback(false, content);
};
