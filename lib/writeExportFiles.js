//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs             = require('fs-extra');

/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param settings
 * @param extension
 */
module.exports = function(generated, dir, extension) {

    "use strict";

    for (var fileName in generated) {
        var fileContent = generated[fileName];

        // If fileContent is a JSON Object, stringify it first
        if (fileContent !== null && typeof fileContent === 'object') {
            fileContent = JSON.stringify(fileContent, false, 4);
        }

        var finalFileName = fileName.replace(':', '-');

        fs.outputFile(dir + '/' + finalFileName + '.' + extension, fileContent);
    }

};
