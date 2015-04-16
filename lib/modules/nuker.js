//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var NodeMW         = require('nodemw');
var fs             = require('fs-extra');
var readlineSync   = require('readline-sync');

var uploadExportFiles = require('./../output/uploadExportFiles');
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
 * @param {object} settings
 * @param {array}   jobs
 */
exports.exec = function(settings, jobs) {

    'use strict';

    var i = 0;

    log(' ');
    log(' [W] This will remove pages from your wiki, even those that mobo had not created!');
    log(' [i] Deleting a lot of pages can take a while.');
    log(' ');

    var agreement = readlineSync.question('Type "nuke it!" to proceed.\n');

    if (agreement !== 'nuke it!') {
        log('Aborting.');
        return;
    }

    exports.nukeNamespaces = {};

    // Nuke Content
    if (jobs.indexOf('content') > -1) {
        log(' [W] NUKER: Deleting all main content pages on the remote wiki');
        exports.nukeNamespaces[0] = 'Main Namespace (Content)';
    }

    // Nuke Structure (MW / SMW / SF)
    if (jobs.indexOf('structure') > -1) {
        log(' [W] NUKER: Deleting all wiki structure pages on the remote wiki');
        exports.nukeNamespaces[10] = 'MW Templates';
        exports.nukeNamespaces[14] = 'MW Categories';
        exports.nukeNamespaces[102] = 'SMW Properties';
        exports.nukeNamespaces[108] = 'SMW Concepts';
        exports.nukeNamespaces[107] = 'SF Forms';
    }

    // Nuke Custom Namespaces from LocalSettings.php
    // Range: 2000-2400; 3000-3400; only even numbers!
    if (jobs.indexOf('custom-namespaces') > -1) {

        log(' [W] NUKER: Deleting all custom namespace content pages on the remote wiki');

        for (i = 2000; i < 2400; i += 2) {
            exports.nukeNamespaces[i] = 'Custom namespace #' + i;
        }
        for (i = 3000; i < 3400; i += 2) {
            exports.nukeNamespaces[i] = 'Custom namespace #' + i;
        }
    }

    for (var j = 0; j < jobs.length; j++) {
        var job = jobs[j];
        if (typeof job === 'number' && (job % 1) === 0) {
            exports.nukeNamespaces[job] = 'Namespace #' + job;
        }
    }

    var botConfig = uploadExportFiles.getBotConfig(settings);
    exports.bot = new NodeMW(botConfig);

    fs.removeSync(settings.processedModelDir + '/_lastUploadState.json');
    log(' [i] Reseting last upload state.');


    exports.bot.logIn(botConfig.username, botConfig.password, function() {

        console.log(' ');

        for (var namespaceNumber in exports.nukeNamespaces) {
            var params = {
                action: 'query',
                list: 'allpages',
                'aplimit': 5000,
                'apnamespace': namespaceNumber
            };

            exports.bot.api.call(params, exports.getPagesInNamespace);
        }
    });

};

exports.getPagesInNamespace = function(err, info, next, data) {

    if (data && data.query && data.query.allpages) {

        // Give feedback how many pages in which namespaces will be deleted
        if (data.query.allpages[0]) {
            var namespaceNumber = data.query.allpages[0].ns;
            var namespaceName = exports.nukeNamespaces[namespaceNumber];
            log(' [i] Nuking ' + data.query.allpages.length + ' pages in namespace ' + namespaceName);
        } else {
            log(' [i] Skipping empty namespace');
            log(data);
        }

        for (var j = 0; j < data.query.allpages.length; j++) {

            var page = data.query.allpages[j];
            var title = page.title;

            exports.bot.delete(title, 'mobo nuke', exports.deletePage);
        }
    }
};

exports.deletePage = function(err, response) {
    exports.counter += 1;
    if (err) {
        log(' [E] mobo could not delete a page.');
        log(err);
    } else {
        log(' [-] (' +  moboUtil.pad(exports.counter, 5) + ') ' + response.title);
    }
};
