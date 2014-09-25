//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs    = require('fs-extra');
var path  = require('path');
var rread = require('readdir-recursive');

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

    files = rread.fileSync(dirName);

    for (var i = 0; i < files.length; i++) {

        var filePath = files[i];
        var fileName = path.basename(filePath, '.json');

        // Skip .md Files (Descriptions)
        if (path.extname(filePath) !== '.md') {
            // Read File
            try {
                var file = fs.readFileSync(filePath);
            } catch(e) {
                console.log(e);
            }

            // Parse File
            try {

                var json = JSON.parse(file);

                if (!json.ignore) {
                content[fileName] = json;
                content[fileName].id = fileName; // Set ID to Filename
                }

            } catch (e) {
                content[fileName] = file.toString();
            }
        }

    }

    return content;

};
