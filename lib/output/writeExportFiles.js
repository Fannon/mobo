//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs      = require('fs-extra');
var Promise = require('bluebird');

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




module.exports.exec = function(settings, registry) {

    'use strict';

    var jobQueue = [];

    if (settings.writeExportFiles) {
        jobQueue = [
            exports.writeFile(registry.generated, settings.processedModelDir + '/wikitext/', 'wikitext'),
            exports.writeFile(registry.expandedField, settings.processedModelDir + '/json/field/', 'json'),
            exports.writeFile(registry.expandedModel, settings.processedModelDir + '/json/model/', 'json'),
            exports.writeFile(registry.expandedForm, settings.processedModelDir + '/json/form/', 'json')
        ];
    }

    return Promise.all(jobQueue);

};

module.exports.writeFile = function(generated, dir, extension) {

    'use strict';

    return new Promise(function (resolve) {

        for (var fileName in generated) {

            var fileContent = generated[fileName];

            // If fileContent is a JSON Object, stringify it first
            if (fileContent !== null && typeof fileContent === 'object') {
                fileContent = JSON.stringify(fileContent, false, 4);
            }

            var finalFileName = fileName.replace(':', '-');

            fs.outputFile(dir + '/' + finalFileName + '.' + extension, fileContent, function() {
                resolve();
            });
        }
    });
};