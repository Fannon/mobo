'use strict';

/**
 * This is the main module that makes use of the several submodules.
 *
 * It triggers the generation and upload of the model.
 */

//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var handlebars        = require('handlebars');

var logger            = require('./logger.js');
var log               = logger.log;

var buildRegistry     = require('./model/buildRegistry.js');
var generateWikitext  = require('./model/generateWikitext.js');
var buildGraph        = require('./model/buildGraph.js');
// var writeExportFiles  = require('./writeExportFiles.js');
var uploadExportFiles = require('./uploadExportFiles.js');



//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

var start    = (new Date).getTime();

//////////////////////////////////////////
// PROCESSING                           //
//////////////////////////////////////////

/**
 * Generates the model from the development model
 *
 * Steps:
 * * Apply inheritance and build an internal registry
 * * Validates the complete development model
 * * Build a graph from the model and its relationships
 * * Generates wikitext from the complete model
 * * Writes the registry (and resulting files) to filesystem
 */
exports.generate = function(settings) {

    log('');
    log('>> mobo :: generateMarkup');
    log('=========================================================================');

    var registry = buildRegistry(settings);

    // Builds Graph (with further validation)
    if (settings.buildGraph) {
        buildGraph(settings, registry);
    }

    var wikitext = generateWikitext(settings, registry);

    if (settings.writeFiles) {
         writeExportFiles(settings, 'wikitext');
         writeExportFiles(settings, 'json');
    }

    var diff = (new Date).getTime() - start;
    log('> Generation completed in: ' + diff + 'ms.');
    log('-------------------------------------------------------------------------');
};

/**
 * Uploads the resulting wikitext files to an external wiki
 */
exports.upload = function (settings) {
    uploadExportFiles(settings, function() {
        var diff = (new Date).getTime() - start;
        log('=========================================================================');
        log('> Time total: ' + diff + 'ms.');
    });
};
