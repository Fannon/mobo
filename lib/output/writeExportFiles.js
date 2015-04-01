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
 * @param {{}}  settings
 * @param {{}}  registry
 *
 * @return {{}} promise
 */
module.exports.exec = function(settings, registry) {

    'use strict';

    if (!settings.writeExportFiles) {
        return Promise.resolve();
    } else {
        return Promise.all([
            exports.writeFile(registry.generated, settings.processedModelDir + '/wikitext/', 'wikitext'),
            exports.writeFile(registry.expandedField, settings.processedModelDir + '/json/field/', 'json'),
            exports.writeFile(registry.expandedModel, settings.processedModelDir + '/json/model/', 'json'),
            exports.writeFile(registry.expandedForm, settings.processedModelDir + '/json/form/', 'json')
        ]);
    }
};

/**
 * Does the actual File writing
 *
 * @param {{}}      generated   object with generated file content in it
 * @param {string}  dir         directory to write to
 * @param {string}  extension   file extension to use
 * @returns {bluebird}
 */
module.exports.writeFile = function(generated, dir, extension) {

    'use strict';

    return new Promise(function(resolve) {

        for (var fileName in generated) {

            var fileContent = generated[fileName];

            // If fileContent is a JSON Object, stringify it first
            if (fileContent !== null && typeof fileContent === 'object') {
                fileContent = JSON.stringify(fileContent, false, 4);
            }

            var finalFileName = fileName.split(':').join('-');

            fs.outputFileSync(dir + '/' + finalFileName + '.' + extension, fileContent);
            resolve();
        }
    });
};
