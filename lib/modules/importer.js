//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs             = require('fs-extra');
var path             = require('path');
var Promise    = require('bluebird');
var NodeMW         = require('nodemw');

var readProject     = require('./../input/readProject');
var uploadExportFiles = require('./../output/uploadExportFiles');
var moboUtil       = require('./../util/moboUtil');
var log            = moboUtil.log;

//////////////////////////////////////////
// Global variables                     //
//////////////////////////////////////////

exports.uploadMap = {};

/** Imported pages counter */
exports.counter = 0;

//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param {object}  settings
 * @param {array}   dirs        Array of directories in the project /import/ folder
 */
exports.exec = function(settings, dirs) {

    'use strict';

    exports.uploadMap = {};

    var directoryWorker = dirs.map(function(dirName) {

        return readProject.read(path.join(settings.cwd, '/import/' + dirName), dirName).then(function(contents) {

            log(' [i] Importing ' + Object.keys(contents).length + ' files from directory: /import/' + dirName);

            for (var name in contents) {
                var content = contents[name];

                // Handle plain wikitext files
                if (name.indexOf('.wikitext') > -1) {
                    var pageName = name.split('.wikitext').join('');
                    pageName = pageName.split('___').join(':');   // Namespaces
                    pageName = pageName.split('---').join('/');   // Subpages
                    exports.uploadMap[pageName] = content;
                }
            }

        }, function(err) {
            log(err);
        });
    });

    // After all directories are read
    Promise.all(directoryWorker).then(function() {

        // Load and configure MediaWiki bot
        var botConfig = uploadExportFiles.getBotConfig(settings);
        exports.bot = new NodeMW(botConfig);

        // Log in
        exports.bot.logIn(botConfig.username, botConfig.password, function() {

            log(' [i] Bot logged in');

            for (var pageName in exports.uploadMap) {
                var pageContent = exports.uploadMap[pageName];

                // Upload to Wiki
                exports.bot.edit(pageName, pageContent, 'mobo import', function(err, response) {
                    if (err) {
                        log(' [E] mobo could not upload a page.');
                        log(err);
                    } else {
                        exports.counter += 1;

                        var change = '';
                        if (response['new'] === '') {
                            change = ' [+]';
                        } else if (response.newrevid) {
                            change = ' [C]';
                        }

                        log(' [U] (' + moboUtil.pad(exports.counter, 5) + ') ' + response.title + change);
                    }
                });
            }
        });

    }).catch(function(e) {
        log(' [E] Importer aborted due to errors when reading / processing the import files');
        log(e);
    });


};
