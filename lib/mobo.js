'use strict';

/**
 * This is the main module that makes use of the several submodules.
 *
 * It triggers the generation and upload of the model.
 */

//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                = require('fs-extra');

var readProject       = require('./input/readProject.js');

var extendProject     = require('./processing/extendProject.js');
var generateWikiStructure  = require('./processing/generateWikiStructure.js');
var generateGraph        = require('./processing/generateGraph.js');

var writeExportFiles  = require('./output/writeExportFiles.js');
var uploadExportFiles = require('./output/uploadExportFiles.js');

var validateSchema    = require('./util/validateSchema.js');
var moboUtil          = require('./util/moboUtil.js');
var log               = moboUtil.log;

var packageJSON       = require('./../package');


//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

/** Microtimestamp for benchmarking */
exports.start = (new Date()).getTime();

/**
 * Global Log Object. This is used to share logging entries between the different modules
 *
 * @type {Array}
 */
global.moboLogObject = [];


//////////////////////////////////////////
// MOBO BOOTSTRAP FUNCTIONS             //
//////////////////////////////////////////

/**
 * Triggers the complete mobo generation process
 *
 * @param {{}}              settings        Settings Object
 * @param {function|false}  onGenerated     onGenerated callback function
 * @param {function}        callback        callback function when finally done
 */
exports.exec = function(settings, onGenerated, callback) {

    exports.start = (new Date()).getTime();
    moboUtil.clearLogHistory();

    // Put current settings into the log object, remove the password before
    var safeSettings = JSON.parse(JSON.stringify(settings));
    safeSettings.mw_password = '**********';
    log(safeSettings, true);

    // Log microtimestamp
    log(exports.start, true);

    // TODO: Put all the Bootstrap code here:


    if (settings.generateWikiPages) {

        exports.generate(settings, function(err, generated) {


            // If refreshWebGui is provided, execute it
            if (onGenerated) {
                onGenerated();
            }

            if (settings.uploadWikiPages || settings.forceUpload) {
                exports.upload(settings, function(err, lastUploadState) {
                    if (callback) {
                        return callback(err, lastUploadState);
                    }
                });
            }

            if (settings.writeLogFile) {
                moboUtil.writeLogHistory(settings.processedModelDir + '/logfiles/');
            }

            // TODO: This calls the callback BEFORE the upload is completd.
            if (callback) {
                return callback(err, generated);
            }

        });
    }
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
 *
 * TODO: Integrate this in  mobo.exec
 *
 *  @param {{}}  settings  Settings Object
 *  @param {{}}  callback  callback function
 */
exports.generate = function(settings, callback) {

    log('');
    log('> mobo v' + packageJSON.version + ' (' + moboUtil.humanDate() + ')');
    log('=========================================================================');

    // 1) READ PROJECT FILES FROM FILE SYSTEM
    readProject.exec(settings.importModelDir).then(function(registry) {
        log(' [D] readProject.exec() resolved');
        return validateSchema.validateRegistry(registry);

    // 2) VALIDATE PROJECT SCHEMA
    }).then(function(registry){
        log(' [D] validateRegistry(registry) resolved');
        return extendProject.exec(settings, registry);

    // 3) EXTEND PROJECT REGISTRY (applies inheritance)
    }).then(function(registry){
        log(' [D] extendProject.exec() resolved');


        // TODO: Promisify this, too:

        // Builds Graph (with further validation)
        if (settings.buildGraph) {
            generateGraph.exec(settings, registry);
        }

        var generated = generateWikiStructure.exec(settings, registry);

        if (settings.writeExportFiles) {
            writeExportFiles.exec(generated, settings.processedModelDir + '/wikitext/', 'wikitext');
            writeExportFiles.exec(registry.field, settings.processedModelDir + '/json/field/', 'json');
            writeExportFiles.exec(registry.expandedModel, settings.processedModelDir + '/json/model/', 'json');
            writeExportFiles.exec(registry.expandedForm, settings.processedModelDir + '/json/form/', 'json');
        }

        var diff = (new Date()).getTime() - exports.start;
        log(' Generation completed in: ' + diff + 'ms.');
        log('=========================================================================');

        if (callback) {
            return callback(false, generated);
        }

    // 4) GENERATE GRAPH

    // 5) GENERATE WIKI STRUCTURE

    // 6) WRITE EXPORT FILES

    // 7) UPLOAD TO WIKI

    // X) HANDLE ERRORS
    }).caught(function (e) {
        log(' [D] mobo PROMISE CATCH');
        log(' [E] Error while building the registry!');
        log(e);

    // S) DONE
    }).lastly(function() {
        log(' [D] mobo PROMISES LASTLY');
    });


};

/**
 * Uploads the resulting wikitext files to an external wiki
 *
 * @param {{}}          settings  Settings Object
 * @param {function}    callback
 */
exports.upload = function (settings, callback) {

    uploadExportFiles.exec(settings, function(err, currentUploadState) {
        var diff = (new Date()).getTime() - exports.start;
        log('-------------------------------------------------------------------------');
        log(' Time total: ' + diff + 'ms.');
        log('=========================================================================');

        if (callback) {
            return callback(err, currentUploadState);
        }

    });
};



//////////////////////////////////////////
// CLI COMMANDS                         //
//////////////////////////////////////////

/**
 * Reads the /cli.md file and returns it as a string
 * @returns {string}
 */
exports.getHelp = function() {
    return fs.readFileSync(__dirname + '/cli.md').toString();
};

/**
 * Returns the current version of mobo.
 * The version is defined in the package.json file in the root directory
 *
 * @returns {exports.version|*}
 */
exports.getVersion = function() {
    return packageJSON.version;
};

/**
 * Creates a new model example in the current working directory
 *
 * @param {String}  name            Name of the example. Must match the folder name in /examples/
 * @param {String}  customDirectory Custom directory to install the sample project in
 *
 * @return {boolean} success
 */
exports.install = function(name, customDirectory) {

    var fs  = require('fs-extra');
    var cwd = customDirectory || process.cwd();

    var currentDir = fs.readdirSync(cwd);

    var installExample = function(name) {

        try {
            fs.copySync(__dirname + '/../examples/' + name, cwd);
            log(' [S] Created example "' + name + '" project structure!');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }

    };

    try {
       fs.readdirSync(__dirname + '/../examples/' + name);
    } catch (e) {
        log(' [E] Example "' + name + '" does not exist.');
        var examples = fs.readdirSync(__dirname + '/../examples/');
        log(' [i] Available examples: ' + examples.join(', '));
        return false;
    }

    // Create a new init project structure if current directory is empty
    if (currentDir.length > 0) {
        if (currentDir.indexOf('settings.json') > -1) {
            log(' [i] Skipping init: Current directory has already a project structure!');

            // If an example is to be installed, copy those files on top on the init structure
            if (name !== 'init') {
                installExample(name);
            }

        } else {
            log(' [E] Aborting init process: Current directory is not empty!');
            return false;
        }

    } else {

        try {
            fs.copySync(__dirname + '/../examples/init/', cwd);

            log(' [S] Created initial project structure!');
            log(' [i] Please adjust your settings.json now. ');

            // If an example is to be installed, copy those files on top on the init structure
            if (name !== 'init') {
                installExample(name);
            }

            return true;

        } catch (err) {
            console.error(err);
            return false;
        }

    }

    return true; // Success

};

/**
 * This updates the templates of the current directory with the current default templates from mobo
 * Sometimes an update is necessary if new features are introduced.
 * Creates a backup of the current project templates first.
 */
exports.update = function(settings) {

    var cwd = settings.cwd;

    var templatesDir = cwd + '/templates/';
    var backupDir = cwd + '/templates_backup/' + moboUtil.humanDate + '/';
    var templatesSourceDir = __dirname + '/../examples/init/templates/';

    log(' [i] First use "npm update mobo -g" to update the mobo executable.');
    log(' [i] This command will update the project templates with the current mobo templates.');
    log(' [i] Your old templates will be backed up into /templates_backup/*');
    log('');

    fs.mkdirsSync(cwd + '/templates_backup/');

    fs.mkdir(backupDir, function() {

        try {
            fs.copySync(templatesDir, backupDir);
            log(' [S] Backup of project template files to \n  "' + backupDir + '"');

            fs.copySync(templatesSourceDir, templatesDir);

            return true;

        } catch (err) {
            console.error(err);
            return false;
        }

    });

};