//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs    = require('fs-extra');
var path  = require('path');
var rread = require('readdir-recursive');

var logger         = require('./logger.js');
var log            = logger.log;

/**
 * Gets all Content in a directory and returns it as a JavaScript Object
 * JSON Files will be converted to JS Objects
 * Subdirectories will be flattened!
 *
 * @param dirName
 * @returns {{}}
 */
module.exports = function(dirName) {

    var content = {};

    var files = rread.fileSync(dirName);

    for (var i = 0; i < files.length; i++) {

        var filePath = files[i];
        var fileName = path.basename(filePath, '.json');
        var fileExtension = path.extname(filePath);

        // Skip .md Files (Descriptions)
        if (fileExtension !== '.md') {

            // Read File
            var file = fs.readFileSync(filePath);

            if (fileExtension === '.json') {

                // Parse File
                try {

                    var json = JSON.parse(file);

                    // If ignore attribute is set, do not include in registry!
                    if (!json.ignore) {
                        content[fileName] = json;
                        content[fileName].id = fileName; // Set ID to Filename
                    }

                } catch (e) {

                    log('> [ERROR] ' + fileName + '.json - JSON  ' + e);
                }
            } else {
                content[fileName] = file.toString();
            }


        }

    }

    return content;

};
