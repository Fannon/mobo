//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var path       = require('path');
var Promise    = require('bluebird');

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
            registry = exports.postProcessing(registry);

            log(' ' + Object.keys(registry.field).length + ' Fields | ' +
            Object.keys(registry.model).length + ' Models | ' +
            Object.keys(registry.form).length + ' Forms | ' +
            Object.keys(registry.smw_template).length + ' Templates | ' +
            Object.keys(registry.smw_query).length + ' Queries | ' +
            Object.keys(registry.smw_page).length + ' Pages');
            log('------------------------------------------------------------------------------');

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

                    var obj = JSON.parse(file);

                    // If ignore attribute is set, do not include in registry!
                    if (!obj.ignore) {

                        var filePathArray = path.relative(process.cwd(), filePath).split(path.sep);

                        obj.id = fileName; // Set ID to Filename
                        obj.$filepath = '/' + filePathArray.join('/'); // Store relative filepath

                        // If object is not explicitly declared as abstract, set abstract to false.
                        // This prevents from having to write abstract = false with all objects that inherit from an abstract one.
                        if (!obj.abstract) {
                            obj.abstract = false;
                        }

                        // Same goes for the ignore attribute
                        if (!obj.ignore) {
                            obj.ignore = false;
                        }

                        content[fileName] = obj;
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
 * Does some post-processing after the project is completely read into the registry.
 *
 * @param {{}} registry
 *
 * @returns {{}}
 */
exports.postProcessing = function(registry) {

    // Model and form specific postprocessing
    var todo = ['model', 'form'];

    for (var i = 0; i < todo.length; i++) {
        var type = todo[i];

        // Resolve model references to fields
        for (var modelName in registry[type]) {

            var obj = registry[type][modelName];
            var modelId = obj.id || modelName;

            exports.addMissingType(obj);

            // Convert all property arrays to property objects
            if (obj.properties && Array.isArray(obj.properties)) {
                obj.properties = exports.convertPropertyArray(obj.properties, modelId);
            }
        }
    }

    return registry;
};

/**
 * If the "type" attribute is missing and there is a "properties" attribute
 * add the missing type depending on the property type
 *
 * @param {object} obj
 * @returns {object}
 */
exports.addMissingType = function(obj) {

    if (!obj.type) {
        if (obj.properties && obj.properties instanceof Array) {
            obj.type = 'array';
        } else if (obj.properties && obj.properties instanceof Object) {
            obj.type = 'object';
        }
    }

    return obj;
};


/**
 * Helper function that will convert an property array to a property object/map (including keys)
 * JSON Schema does support only property objects, but in case of mobo they include redundant information
 * since the property key is almost always auto-genrated from the filename.
 *
 * This conversion ensures that JSON Schema compatibility is ensured while providing the more concise array notation
 *
 * @param   {array}     properties    Property array notation
 * @param   {string}    objId         id / name of the "mother" object
 *
 * @returns {object}                  Property object notation
 */
exports.convertPropertyArray = function(properties, objId) {

    var propertyObject = {};

    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        var id = objId + '-i' + i; // Hack to fix: http://stackoverflow.com/a/3186907/776425

        var $extend = prop.$extend || false;
        if (prop.items && prop.items.$extend) {
            $extend = prop.items.$extend;
        }

        if (prop.id) {
            // If an ID is given, use this as key
            id = prop.id;
        } else if ($extend) {
            // If a $extend is given, do a lookup for the id in the resolve object
            var ref = moboUtil.resolveReference($extend, prop.$filepath);
            id = ref.id;
        }

        propertyObject[id] = prop;
    }

    return propertyObject;
};
