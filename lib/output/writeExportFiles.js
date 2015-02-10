//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs = require('fs-extra');

/**
 * Takes an generated object and writes all containing contents to files
 *
 * The generated object is a 1dim associative array:
 * The key defines the filename and the value the filecontent.
 * The fileextension has to be specified explicitly.
 * Some special characters (like :) are escaped to more filesystem friendly strings.
 *
 * @param generated
 * @param dir           directory path to write
 * @param extension     file extension
 */
module.exports.exec = function(generated, dir, extension) {

    'use strict';

    return new Promise(function (resolve) {

        for (var fileName in generated) {
            var fileContent = generated[fileName];

            // If fileContent is a JSON Object, stringify it first
            if (fileContent !== null && typeof fileContent === 'object') {
                fileContent = JSON.stringify(fileContent, false, 4);
            }

            var finalFileName = fileName.replace(':', '-');

            fs.outputFile(dir + '/' + finalFileName + '.' + extension, fileContent);
        }

        resolve();
    });

};
