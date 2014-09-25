/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param dir
 * @param extension
 */
module.exports = function(settings, extension) {

    //////////////////////////////////////////
    // Requirements                         //
    //////////////////////////////////////////

    var fs             = require('fs-extra');
    var findRemoveSync = require('find-remove');

    var logger         = require('./logger.js');
    var log            = logger.log;


    //////////////////////////////////////////
    // Logic                                //
    //////////////////////////////////////////

    if (settings.cleanUp) {
        findRemoveSync(settings.processedModelDir, {
            extensions: ['.' + extension],
            ignore: [
                '_generated.js',
                '_generated.json',
                '_registry.js',
                '_registry.json',
                '_graph.gexf',
                '_graph_layouted.gexf',
                '_lastUploadState.json'
            ]
        });
    }

    if (settings.writeFiles) {

        var generatedFiles = JSON.parse(fs.readFileSync(settings.processedModelDir + '_generated.json').toString());

        for (var fileName in generatedFiles) {
            var fileContent = generatedFiles[fileName];

            // If fileContent is a JSON Object, stringify it first
            if (fileContent !== null && typeof fileContent === 'object') {
                fileContent = JSON.stringify(fileContent, false, 4);
            }

            var finalFileName = fileName.replace(':', '-');

            if (settings.writeFiles) {
                fs.outputFileSync(settings.processedModelDir + '/' + extension +
                    '/' + finalFileName + '.' + extension, fileContent);
            }
        }
    }

};
