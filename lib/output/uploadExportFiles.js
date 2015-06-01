//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _               = require('lodash');
var fs              = require('fs-extra');
var NodeMW          = require('nodemw');
var Promise         = require('bluebird');

var generateReport  = require('./../processing/generateReport');
var semlog          = require('semlog');
var log             = semlog.log;

//////////////////////////////////////////
// Global variables                     //
//////////////////////////////////////////

exports.loggedIn = false;
exports.bot = false;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param settings
 * @param registry
 * @param callback
 */
exports.exec = function(settings, registry, callback) {

    'use strict';

    return new Promise(function(resolve, reject) {

        //////////////////////////////////////////
        // Variables                            //
        //////////////////////////////////////////

        var generatedPages     = {};
        var lastUploadState    = {};
        var currentUploadState = {};

        var uploadQueue        = {};
        var totalPagesCounter  = 0;
        var uploadCounter      = 0;
        var uploadStatus       = 0;
        var removedCounter     = 0;

        var removed            = {};
        var changed            = {};
        var added              = {};

        var pageContent;
        var pageName;

        exports.settings       = settings;
        exports.registry       = registry;

        var botConfig = exports.getBotConfig(settings);
        exports.botConfig = botConfig;

        if (!botConfig) {
            return callback('No valid bot configuration!', false); //
        }


        //////////////////////////////////////////
        // Read Files                           //
        //////////////////////////////////////////

        // Load generated wikitext from the registry
        if (registry && registry.generated) {
            generatedPages = registry.generated;
        } else {
            log('[E] Could not get generated wikitext');
            return callback('Could not get generated wikitext!', false);
        }

        // Load last upload state from file
        try {
            lastUploadState = JSON.parse(fs.readFileSync(settings.processedModelDir + '_lastUploadState.json').toString());
        } catch (e) {
            log('[i] No last upload state found. Forcing upload of all pages.');
            lastUploadState = {};
        }

        currentUploadState = _.cloneDeep(generatedPages);


        //////////////////////////////////////////
        // Look for Changes                     //
        //////////////////////////////////////////

        // Checks for pages that have been deleted since last upload
        for (pageName in lastUploadState) {

            pageContent = generatedPages[pageName];

            // Check for deleted pages
            if (!(generatedPages[pageName])) {
                log('[-] ' + pageName);
                currentUploadState[pageName] = pageContent;
                removed[pageName] = false;
                removedCounter += 1;
            }
        }

        // Check for new or changed Pages
        for (pageName in generatedPages) {

            totalPagesCounter += 1;
            pageContent = generatedPages[pageName];

            // Check for NEW Pages
            if (!(lastUploadState[pageName])) {

                log('[+] ' + pageName);
                currentUploadState[pageName] = pageContent;
                uploadQueue[pageName] = pageContent;
                added[pageName] = pageContent;
                uploadCounter += 1;

            } else if (JSON.stringify(pageContent) !== JSON.stringify(lastUploadState[pageName])) {

                var sizeDiff = JSON.stringify(pageContent).length - JSON.stringify(lastUploadState[pageName]).length;
                if (sizeDiff > 0) {
                    sizeDiff = '+' + sizeDiff;
                }

                log('[C] ' + pageName + ' (' + sizeDiff + ')');
                currentUploadState[pageName] = pageContent;
                uploadQueue[pageName] = pageContent;
                changed[pageName] = pageContent;
                uploadCounter += 1;
            }
        }

        registry.uploaded = {
            added: added,
            changed: changed,
            removed: removed
        };

        // Write statistics
        registry.statistics.changes = {
            added: _.size(added),
            changed: _.size(changed),
            removed: removedCounter
        };

        if (settings.forceUpload) {
            log('[i] FORCING Upload of all generated Files');
            currentUploadState = generatedPages;
            uploadQueue = generatedPages;
            uploadCounter = totalPagesCounter;
            settings.uploadWikiPages = true;
        }

        if (settings.uploadWikiPages === false) {
            log('[i] Skipping upload (setting)');
            return callback(false, false);
        }

        //////////////////////////////////////////
        // Uploading via Bot                    //
        //////////////////////////////////////////

        if (uploadCounter > 0 || (settings.deleteWikiPages && removedCounter > 0)) {


            //////////////////////////////////////////
            // BOT CALLBACK FUNCTIONS               //
            //////////////////////////////////////////

            var onLogin = function(err, response) {

                var pageName;

                if (err || !response) { // Handle error object from nodemw
                    exports.loggedIn = false;
                    log('[E] mobo could not log-in. Please check your settings.json for your login-data.');
                    reject(err); // Return error and stop uploading

                } else { // Successfull Login:
                    exports.loggedIn = true;

                    // Delete removed pages
                    if (settings.deleteWikiPages) {

                        uploadCounter += removedCounter;

                        for (pageName in removed) {
                            exports.bot.delete(pageName, 'mobo delete', onDelete);
                        }
                    }

                    // Upload new or changed pages
                    for (pageName in uploadQueue) {
                        pageContent = uploadQueue[pageName].toString();
                        exports.bot.edit(pageName, pageContent, 'mobo edit', onEdit);
                    }
                }
            };

            var onEdit = function(err, response) {

                uploadStatus++;

                if (err) {
                    log('[E] mobo failed to edit a page.');
                    log(err);
                } else if (response && response.result !== 'Success') {
                    log('[U] [E] UPLOADED FAILED: (' + semlog.pad(uploadStatus, 3) + '/' + semlog.pad(uploadCounter, 3) + ') | ' + response.title);
                    log(response);
                    delete currentUploadState[response.title];
                } else {
                    // Check if the response indicates that changes or new pages were created
                    var change = '';
                    if (response['new'] === '') {
                        change = ' [+]';
                    } else if (response.newrevid) {
                        change = ' [C]';
                    }

                    log('[U] (' + semlog.pad(uploadStatus, 3) +
                    '/' + semlog.pad(uploadCounter, 3) + ') | ' +
                    response.title + change);
                }

                // If all tasks are run -> Callback
                if (uploadCounter === uploadStatus) {
                    exports.complete(currentUploadState, function() {
                        log('--------------------------------------------------------------------------------');
                        return callback(false, currentUploadState);
                    });
                }

            };

            var onDelete = function(err, response) {

                uploadStatus++;

                if (err) {
                    log('[E] mobo failed to delete a page.');
                    log(err);
                } else {
                    log('[-] (' + semlog.pad(uploadStatus, 3) + '/' + semlog.pad(uploadCounter, 3) + ') | ' + response.title);
                }

                // If all tasks are run -> Callback
                if (uploadCounter === uploadStatus) {
                    exports.complete(currentUploadState, function() {
                        log('--------------------------------------------------------------------------------');
                        return callback(false, currentUploadState);
                    });
                }
            };


            //////////////////////////////////////////
            // UPLOAD AND DELETE                    //
            //////////////////////////////////////////

            if (!exports.loggedIn) {

                exports.bot = new NodeMW(botConfig);

                log('--------------------------------------------------------------------------------');
                log('Bot logging in with account: ' + botConfig.username);
                log('--------------------------------------------------------------------------------');

                exports.bot.logIn(botConfig.username, botConfig.password, onLogin);

            } else {
                // If bot is already logged in, run the onLogin callback funtion immediately
                // success is true, because the previous login attempt was already successful
                log('--------------------------------------------------------------------------------');
                onLogin(false, {success: true});
            }

        } else {
            return callback(false, false);
        }

    });
};


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

exports.getBotConfig = function(settings) {

    if (!settings.mw_server_url || !settings.mw_username || !settings.mw_password || settings.mw_server_url === 'http://example.com') {
        log('[W] Upload settings have not been set. Aborting upload.');
        log('[i] Please adjust your settings.json');
        return false;
    }

    // Sanitize values
    var serverUrl = settings.mw_server_url.replace('http://', '');
    serverUrl = serverUrl.replace('https://', '');

    return {
        server: serverUrl,                          // host name of MediaWiki-powered site
        path: settings.mw_server_path || '',        // path to api.php script
        debug: false,                               // is more verbose when set to true
        silent: true,
        username: settings.mw_username,    // account to be used when logIn is called (optional)
        password: settings.mw_password,    // password to be used when logIn is called (optional)
        port: settings.mw_server_port || false,
        concurrency: settings.uploadConcurrency
    };
};

/**
 * Upload completed
 * Writes last upload state to file and triggers the callback function
 */
exports.complete = function(currentUploadState, callback) {

    if (currentUploadState) {
        // Write new lastUploadState, async
        fs.outputFile(exports.settings.processedModelDir + '/_lastUploadState.json', JSON.stringify(currentUploadState, false, 4));
    }

    return callback(currentUploadState);
};


exports.uploadReport = function(registry, callback) {

    if (!registry.statistics.changes || !registry.statistics.changes.added) {
        return callback();
    }

    var totalChanges = registry.statistics.changes.added +
        registry.statistics.changes.changed +
        registry.statistics.changes.removed;

    if (exports.bot && totalChanges > 0) {
        var userPage = 'User:' + exports.botConfig.username;
        var report = generateReport.exec(exports.settings, registry);

        exports.bot.edit(userPage, report, 'mobo report', function() {
            log('[i] mobo report uploaded');
            return callback();
        });

    } else {

        // If no instance of exports.bot is found, no upload has taken place
        // In this case no report has to be uploaded either.
        return callback();
    }

};
