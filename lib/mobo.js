'use strict';

/**
 * This is the main module that makes use of the several submodules.
 *
 * It triggers the generation and upload of the model.
 */

//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _          = require('lodash');
var fs         = require('fs-extra');

var settings          = require('./settings.json');
var buildRegistry     = require('./model/buildRegistry.js');
var generateWikitext  = require('./model/generateWikitext.js');
var buildGraph        = require('./model/buildGraph.js');
//var writeExportFiles  = require('./writeExportFiles.js');
var uploadExportFiles = require('./uploadExportFiles.js');

var logger            = require('./logger.js');
var log               = logger.log;


//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

var start;


//////////////////////////////////////////
// PROCESSING                           //
//////////////////////////////////////////

/**
 * Loads default settings, calculates paths and overwrites them with custom project settings
 *
 * @returns {*}
 */
exports.getSettings = function() {

    start = (new Date).getTime();
    var cwd = process.cwd();

    // Get and parse Settings
    try {
        var projectSettings = JSON.parse(fs.readFileSync(cwd + '/settings.json').toString());

        // Calculate paths
        settings.cwd = cwd;
        settings.importModelDir = cwd;
        settings.templateDir =  cwd + '\\templates\\';
        settings.logDir =  cwd + '\\_logfiles\\';
        settings.processedModelDir = cwd + '\\_processed\\';

        // Project settings overwrites default settings!
        _.merge(settings, projectSettings);

    } catch(e) {
        log('> [WARNING] No valid settings.json file found!');
        log(e);
        settings = false;
    }

    return settings;
};


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

//    if (settings.writeFiles) {
//         writeExportFiles(settings, 'wikitext');
//         writeExportFiles(settings, 'json');
//    }

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

/**
 * Creates a new model example in the current working directory
 *
 * @param name  name of the example. Must match the folder name in /examples/
 */
exports.init = function(name) {

    var fs  = require('fs-extra');
    var cwd = process.cwd();

    var ncp = require('ncp').ncp;
    ncp.limit = 16;

    var currentDir = fs.readdirSync(cwd);


    if (currentDir.length > 0) {
        log('> [ERROR] Aborting init process: Current directory is not empty!');
    } else {

        ncp(__dirname + '\\..\\examples\\' + name, cwd, function (err) {
            if (err) {
                return console.error(err);
            }
            console.log('done!');
        });

    }

}