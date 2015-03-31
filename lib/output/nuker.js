//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var nodemw         = require('nodemw');
var fs             = require('fs-extra');
var readlineSync   = require('readline-sync');

var uploadExportFiles = require('./uploadExportFiles');
var moboUtil       = require('./../util/moboUtil');
var log            = moboUtil.log;

//////////////////////////////////////////
// Global variables                     //
//////////////////////////////////////////

/** Nuked pages counter */
exports.counter = 0;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param settings
 */
exports.exec = function(settings) {

    'use strict';

    log('');
    log(' [W] This will remove pages from your wiki, even those that mobo had not created!');
    log(' [i] Deleting a lot of pages can take a while.');
    log('');

    var agreement = readlineSync.question('Type "nuke it!" to proceed.\n');

    if (agreement !== 'nuke it!') {
        log('Aborting.');
        return;
    }

    var botConfig = uploadExportFiles.getBotConfig(settings);
    var bot = new nodemw(botConfig);

    fs.removeSync(settings.processedModelDir + '/_lastUploadState.json');
    log(' [i] Reseting last upload state.');


    bot.logIn(botConfig.username, botConfig.password, function() {

        var i = 0;
        var nukeNamespaces = {};

        console.log('');

        // Nuke Content
        if (settings.nukeContent) {
            log(' [W] NUKER: Deleting all main content pages on the remote wiki');
            nukeNamespaces[0] = 'Main Namespace (Content)';
        }

        // Nuke Structure (MW / SMW / SF)
        if (settings.nukeStructure) {
            log(' [W] NUKER: Deleting all wiki structure pages on the remote wiki');
            nukeNamespaces[10] = 'MW Templates';
            nukeNamespaces[14] = 'MW Categories';
            nukeNamespaces[102] = 'SMW Properties';
            nukeNamespaces[108] = 'SMW Concepts';
            nukeNamespaces[107] = 'SF Forms';
        }

        // Nuke Custom Namespaces from LocalSettings.php
        // Range: 2000-2400; 3000-3400; only even numbers!
        if (settings.nukeCustomNamespaces) {

            log(' [W] NUKER: Deleting all custom namespace content pages on the remote wiki');

            for (i = 2000; i < 2400; i += 2) {
                nukeNamespaces[i] = 'Custom namespace #' + i;
            }
            for (i = 3000; i < 3400; i += 2) {
                nukeNamespaces[i] = 'Custom namespace #' + i;
            }
        }

        for (var namespaceNumber in nukeNamespaces) {

            var namespaceName = nukeNamespaces[namespaceNumber];

            var params = {
                action: 'query',
                list: 'allpages',
                'aplimit': 5000,
                'apnamespace': namespaceNumber
            };

            bot.api.call(params, function(err, info, next, data) {

                if (data && data.query && data.query.allpages) {

                    // Give feedback how many pages in which namespaces will be deleted
                    if (data.query.allpages[0]) {
                        namespaceNumber = data.query.allpages[0].ns;
                        namespaceName = nukeNamespaces[namespaceNumber];
                        log(' [i] Nuking ' + data.query.allpages.length + ' pages in namespace ' + namespaceName);
                    }

                    for (var j = 0; j < data.query.allpages.length; j++) {

                        var page = data.query.allpages[j];
                        var title = page.title;

                        bot.delete(title, 'mobo nuke', function(err, response) {
                            exports.counter += 1;
                            if (err) {
                                log(' [E] mobo could not delete a page.');
                                log(err);
                            } else {
                                log(' [-] (' +  moboUtil.pad(exports.counter, 5) + ') ' + response.title);
                            }
                        });
                    }
                }
            });
        }
    });

};