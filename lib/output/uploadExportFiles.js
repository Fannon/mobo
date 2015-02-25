//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _              = require('lodash');
var fs             = require('fs-extra');
var nodemw         = require('nodemw');
var Promise        = require('bluebird');

var moboUtil       = require('./../util/moboUtil');
var log            = moboUtil.log;

//////////////////////////////////////////
// Global variables                     //
//////////////////////////////////////////

exports.loggedIn = false;


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

    return new Promise(function (resolve, reject) {

        if (settings.uploadWikiPages === false && !settings.forceUpload) {
            log(' [i] Skipping upload');
            return callback(false, false);
        }

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
        var serverUrl;

        var start              = (new Date()).getTime();

        exports.settings       = settings;
        exports.registry       = registry;


        //////////////////////////////////////////
        // Configuration                        //
        //////////////////////////////////////////

        if (!settings.mw_server_url || !settings.mw_username || !settings.mw_password) {
            log(' [W] Incomplete login data. Aborting upload.');
            return callback(false, false);
            //reject('incomplete login data');
        }

        // Sanitize values
        serverUrl = settings.mw_server_url.replace('http://', '');
        serverUrl = serverUrl.replace('https://', '');

        var botConfig = {
            server: serverUrl,                          // host name of MediaWiki-powered site
            path: settings.mw_server_path || "",        // path to api.php script
            debug: false,                               // is more verbose when set to true
            silent: true,
            username: settings.mw_username,    // account to be used when logIn is called (optional)
            password: settings.mw_password,    // password to be used when logIn is called (optional)
            port: settings.mw_server_port || false,
            concurrency: settings.uploadConcurrency
        };


        //////////////////////////////////////////
        // Read Files                           //
        //////////////////////////////////////////

        // Load generated wikitext from the registry
        if (registry && registry.generated) {
            generatedPages = registry.generated;
        } else {
            log(' [E] Could not get generated wikitext');
        }

        // Load last upload state from file
        try {
            lastUploadState = JSON.parse(fs.readFileSync(settings.processedModelDir + '_lastUploadState.json').toString());
        } catch (e) {
            log(' [i] No last upload state found. Forcing upload of all pages.');
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
                log(' [-] ' + pageName);
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

                log(' [+] ' + pageName);
                currentUploadState[pageName] = pageContent;
                uploadQueue[pageName] = pageContent;
                added[pageName] = pageContent;
                uploadCounter += 1;

            } else if (JSON.stringify(pageContent) !== JSON.stringify(lastUploadState[pageName])) {

                var sizeDiff = JSON.stringify(pageContent).length - JSON.stringify(lastUploadState[pageName]).length;
                if (sizeDiff > 0) {
                    sizeDiff = '+' + sizeDiff;
                }

                log(' [C] ' + pageName + ' (' + sizeDiff + ')');
                currentUploadState[pageName] = pageContent;
                uploadQueue[pageName] = pageContent;
                changed[pageName] = pageContent;
                uploadCounter += 1;
            }
        }

        if (settings.forceUpload) {
            log(' [i] FORCING Upload of all generated Files');
            currentUploadState = generatedPages;
            uploadQueue = generatedPages;
            uploadCounter = totalPagesCounter;
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
                    log(' [E] mobo could not log-in. Please check your settings.json for your login-data.');
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

                if (settings.verbose) {
                    log(response);
                }

                if (err) {
                    log(' [E] FormBot could not edit a page.');
                    log(err);
                } else if (response && response.result !== 'Success') {
                    log(' [U] [E] UPLOADED FAILED: (' + moboUtil.pad(uploadStatus, 3) + '/' + moboUtil.pad(uploadCounter, 3) + ') | ' + response.title);
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

                    log(' [U] (' + moboUtil.pad(uploadStatus, 3) +
                    '/' + moboUtil.pad(uploadCounter, 3) + ') | ' +
                    response.title + change);
                }

                // If all tasks are run -> Callback
                if (uploadCounter === uploadStatus) {
                    exports.complete(currentUploadState, start, function() {
                        return callback(false, currentUploadState);
                        //resolve(currentUploadState);
                    });
                }

            };

            var onDelete = function(err, response) {

                uploadStatus++;

                if (err) {
                    log(' [E] FormBot could not delete a page.');
                    log(err);
                } else {
                    log(' [-] (' + moboUtil.pad(uploadStatus, 3) + '/' + moboUtil.pad(uploadCounter, 3) + ') | ' + response.title);
                }

                // If all tasks are run -> Callback
                if (uploadCounter === uploadStatus) {
                    exports.complete(currentUploadState, start, function() {
                        return callback(false, currentUploadState);
                        //resolve(currentUploadState);
                    });
                }
            };


            //////////////////////////////////////////
            // UPLOAD AND DELETE                    //
            //////////////////////////////////////////

            if (!exports.loggedIn) {

                exports.bot = new nodemw(botConfig);

                log('-------------------------------------------------------------------------');
                log(' Bot logging in with account: ' + botConfig.username);
                log('-------------------------------------------------------------------------');

                exports.bot.logIn(botConfig.username, botConfig.password, onLogin);

            } else {
                // If bot is already logged in, run the onLogin callback funtion immediately
                // success is true, because the previous login attempt was already successful
                log('-------------------------------------------------------------------------');
                onLogin(false, {success: true});
            }

        } else {
            log(' No Changes detected -> Upload skipped');
            return callback(false, false);
            //resolve();
        }
    });
};


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Upload completed
 * Writes last upload state to file and triggers the callback function
 */
exports.complete = function(currentUploadState, start, callback) {

    if (currentUploadState) {
        // Write new lastUploadState, async
        fs.outputFile(exports.settings.processedModelDir + '/_lastUploadState.json', JSON.stringify(currentUploadState, false, 4));
    }

    if (start) {
        var diff = (new Date()).getTime() - start;
        log('-------------------------------------------------------------------------');
        log(' Upload completed in: ' + diff + 'ms.');
    }

    return callback(currentUploadState);
};
