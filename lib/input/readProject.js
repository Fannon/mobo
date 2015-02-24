//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                  = require('fs-extra');
var path                = require('path');
var Promise             = require('bluebird');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

//////////////////////////////////////////
// READ MODEL TO REGISTRY               //
//////////////////////////////////////////

exports.exec = function(importModelDir) {

    return new Promise(function (resolve, reject) {

        /**
         * The Registry is the main object mobo works with.
         * It contains all imported files from the project, json files already converted to objects.
         * It also contains the processed / extended fields, including inheritance. Those are prefixed with "expanded"
         * Lastly, it included a collection of the final "generated" wikitext pages
         * @type {{}}
         */
        var registry = {};

        // Directories to fetch
        var directories = ['field', 'model', 'form', 'smw_template', 'smw_query', 'smw_page'];

        // Fill Registry
        var directoryWorker = directories.map(function(name){

            return exports.read(importModelDir+ '/' + name + '/').then(function(content) {
                registry[name] = content;
            }, function(err) {
                log(' [E] Could not read project directory /' + name);
                log(err);
            });
        });

        // After all directories are read
        Promise.all(directoryWorker).then(function() {

            /** Fallback for @deprecated project structure! */
            if (!registry.smw_page) {
                registry.smw_page = exports.read(importModelDir + '/smw_site/');
                log(' [W] Wiki pages are now stored into /smw_site/ folder instead of /smw_page/ !');
                log(' [W] Please rename your directory accordingly!');
            }

            resolve(registry);

        }).catch(function(e){
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
 * @returns {object} promise
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
                        var filePathArray = path.relative(process.cwd(), filePath).split(path.sep);


                        json.id = fileName; // Set ID to Filename
                        json.$filepath = '/' + filePathArray.join('/'); // Store relative filepath

                        if (json.properties && Array.isArray(json.properties)) {
                            json.properties = exports.convertPropertyArray(json.properties);
                        }

                        content[fileName] = json;
                    }

                } catch (e) {
                    // JSON PARSE ERROR
                    log(' [E] [JSON SYNTAX] ' + fileName + '.json: ' + e.message);
                }

                // Handle other files (.wikitext)
            } else {
                content[fileName] = file.toString();
            }
        }

    }

    return callback(false, content);
};

/**
 * Helper function that will convert an property array to a property object/map (including keys)
 * JSON Schema does support only property objects, but in case of mobo they include redundant information
 * since the property key is almost always auto-genrated from the filename.
 *
 * This conversion ensures that JSON Schema compatibility is ensured while providing the more concise array notation
 *
 * @param   {array}     properties    Property array notation
 *
 * @returns {object}                  Property object notation
 */
exports.convertPropertyArray = function(properties) {

    var propertyObject = {};

    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        if (prop.id) {
            // If an ID is given, use this as key
            propertyObject[prop.id] = prop;
        } else {
            // Otherwise use the current array index (number)
            propertyObject[i] = prop;
        }
    }

    return propertyObject;
}