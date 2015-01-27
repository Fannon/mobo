//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _              = require('lodash');
var fs             = require('fs-extra');
var nodemw         = require('nodemw');

var generateReport = require('./generateReport');
var moboUtil       = require('./moboUtil');

var logger         = require('./logger.js');
var log            = logger.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param settings
 * @param callback  Callback Function that is called when upload complete
 */
exports.exec = function(settings, callback) {

    //////////////////////////////////////////
    // Variables                            //
    //////////////////////////////////////////

    var generatedPages     = {};
    var lastUploadState    = {};
    var currentUploadState = {};

    var uploadQueue        = {};
    var totalSitesCounter  = 0;
    var uploadCounter      = 0;
    var uploadStatus       = 0;
    var removedCounter     = 0;

    var removed            = {};
    var changed            = {};
    var added              = {};

    var siteContent;
    var pageName;
    var serverUrl;

    var start              = (new Date()).getTime();

    exports.settings       = settings;


    //////////////////////////////////////////
    // Configuration                        //
    //////////////////////////////////////////

    if (!settings.mw_server_url || !settings.mw_username || !settings.mw_password) {
        log('> [WARNING] Incomplete login data. Aborting upload.');
        return;
    }

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

    try {
        generatedPages = JSON.parse(fs.readFileSync(settings.processedModelDir + '_generated.json').toString());
    } catch (e) {
        log('> [ERROR] Could not read /_processed/_generated.json');
        exports.complete(false, start, callback);
    }


    try {
        lastUploadState = JSON.parse(fs.readFileSync(settings.processedModelDir + '_lastUploadState.json').toString());
    } catch (e) {
        log('> [INFO] No last upload state found. Forcing upload of all pages.');
        lastUploadState = {};
    }

    currentUploadState = _.cloneDeep(generatedPages);


    //////////////////////////////////////////
    // Look for Changes                     //
    //////////////////////////////////////////

    // Checks for Sites that have been deleted since last upload
    for (pageName in lastUploadState) {

        siteContent = generatedPages[pageName];

        // Check for Deleted Sites
        if (!(generatedPages[pageName])) {
            log(' - ' + pageName);
            currentUploadState[pageName] = siteContent;
            removed[pageName] = false;
            removedCounter += 1;
        }
    }

    // Check for new or changed Pages
    for (pageName in generatedPages) {

        totalSitesCounter += 1;
        siteContent = generatedPages[pageName];

        // Check for NEW Pages
        if (!(lastUploadState[pageName])) {

            log(' + ' + pageName);
            currentUploadState[pageName] = siteContent;
            uploadQueue[pageName] = siteContent;
            added[pageName] = siteContent;
            uploadCounter += 1;

        } else if (JSON.stringify(siteContent) !== JSON.stringify(lastUploadState[pageName])) {

            var sizeDiff = JSON.stringify(siteContent).length - JSON.stringify(lastUploadState[pageName]).length;
            if (sizeDiff > 0) {
                sizeDiff = '+' + sizeDiff;
            }

            log(' C ' + pageName + ' (' + sizeDiff + ')');
            currentUploadState[pageName] = siteContent;
            uploadQueue[pageName] = siteContent;
            changed[pageName] = siteContent;
            uploadCounter += 1;
        }
    }

    if (settings.forceUpload) {
        log('>> [NOTICE] FORCING Upload of all generated Files');
        currentUploadState = generatedPages;
        uploadQueue = generatedPages;
        uploadCounter = totalSitesCounter;
    }

    //////////////////////////////////////////
    // Uploading via Bot                    //
    //////////////////////////////////////////


    if (uploadCounter > 0 || (settings.deleteWikiPages && removedCounter > 0)) {


        //////////////////////////////////////////
        // Generate Report                      //
        //////////////////////////////////////////

        var report = generateReport(settings, {
            name: settings.mw_username,
            removed: removed,
            changed: changed,
            added: added
        });

        for (var reportName in report) {
            if (reportName === 'User:' + settings.mw_username) {
                log(' C ' + reportName);
            } else {
                log(' + ' + reportName);
            }
        }

        _.merge(uploadQueue, report);
        uploadCounter += 2;


        //////////////////////////////////////////
        // UPLOAD AND DELETE                    //
        //////////////////////////////////////////

        var bot = new nodemw(botConfig);

        log('-------------------------------------------------------------------------');
        log('> Bot logging in with account: ' + botConfig.username);
        log('-------------------------------------------------------------------------');

        bot.logIn(botConfig.username, botConfig.password, function(err, response) {

            var siteName;

            // Handle error object from nodemw
            if (err || !response) {
                log('> [ERROR]: FormBot could not log-in into the wiki');
                log(err);

            // Handle error response from MediaWiki
            } else if (response.result !== 'Success') {
                log('> [ERROR]: FormBot could not log-in into the wiki');
                log(response);

            // Successfull Login:
            } else {

                // Delete removed Sites
                if (settings.deleteWikiPages) {

                    uploadCounter += removedCounter;

                    for (siteName in removed) {

                        bot.delete(siteName, 'mobo delete', function(err, response) {

                            uploadStatus++;

                            if (err) {
                                log('> [ERROR]: FormBot could not delete a page.');
                                log(err);
                            } else {
                                log(' - (' + moboUtil.pad(uploadStatus, 3) + '/' + moboUtil.pad(uploadCounter, 3) + ') | ' + response.title);
                            }

                            // If all tasks are run -> Callback
                            if (uploadCounter === uploadStatus) {
                                exports.complete(currentUploadState, start, callback);
                            }

                        });
                    }
                }

                // Upload new or changed Sites
                for (siteName in uploadQueue) {

                    siteContent = uploadQueue[siteName].toString();

                    bot.edit(siteName, siteContent, 'mobo edit', function(err, response) {

                        uploadStatus++;

                        if (settings.verbose) {
                            log(response);
                        }

                        if (err) {
                            log('> [ERROR]: FormBot could not edit a page.');
                            log(err);
                        } else if (response && response.result !== 'Success') {
                            log(' U [ERROR] UPLOADED FAILED: (' + moboUtil.pad(uploadStatus, 3) + '/' + moboUtil.pad(uploadCounter, 3) + ') | ' + response.title);
                            log(response);
                            delete currentUploadState[response.title];
                        } else {
                            // Check if the response indicates that changes or new pages were created
                            var change = '';
                            if (response['new'] === '') {
                                change = ' [NEW]';
                            } else if (response.newrevid) {
                                change = ' [CHANGED]';
                            }

                            log(' U (' + moboUtil.pad(uploadStatus, 3) +
                            '/' + moboUtil.pad(uploadCounter, 3) + ') | ' +
                            response.title + change);
                        }

                        // If all tasks are run -> Callback
                        if (uploadCounter === uploadStatus) {
                            exports.complete(currentUploadState, start, callback);
                        }

                    });
                }
            }
        });

    } else {
        log('> No Changes detected -> Upload skipped');
        exports.complete(currentUploadState, false, callback);
    }

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
        // Write new lastUploadState
        fs.outputFileSync(exports.settings.processedModelDir + '/_lastUploadState.json', JSON.stringify(currentUploadState, false, 4));
    }

    if (start) {
        var diff = (new Date()).getTime() - start;
        log('-------------------------------------------------------------------------');
        log('> Upload completed in: ' + diff + 'ms.');
    }

    // Trigger Callback
    return callback();
};
