//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _              = require('lodash');
var fs             = require('fs-extra');
var nodemw         = require('nodemw');

var generateReport = require('./generateReport');

var logger         = require('./logger.js');
var log            = logger.log;


/**
 * Looks for a _generated.json file and writes all containing contents to files
 *
 * @param settings
 * @param callback  Callback Function that is called when upload complete
 */
module.exports = function(settings, callback) {

    //////////////////////////////////////////
    // Variables                            //
    //////////////////////////////////////////

    var generatedPages = {};
    var lastUploadState = {};
    var currentUploadState = {};

    var uploadQueue = {};
    var totalSitesCounter = 0;
    var uploadCounter = 0;
    var uploadStatus = 0;
    var removedCounter = 0;

    var removed = {};
    var changed = {};
    var added = {};

    var siteContent;
    var pageName;

    exports.settings = settings;



    //////////////////////////////////////////
    // Configuration                        //
    //////////////////////////////////////////

    var botConfig = {
        server: settings.mw_server_url.replace('http://', '') || false,  // host name of MediaWiki-powered site
        path: settings.mw_server_path || false,   // path to api.php script
        debug: false,                    // is more verbose when set to true
        silent: true,
        username: settings.mw_username || false,                              // account to be used when logIn is called (optional)
        password: settings.mw_password || false,                            // password to be used when logIn is called (optional)
        port: settings.mw_server_port || false,
        concurrency: settings.uploadConcurrency
    };

    if (!botConfig.server || !botConfig.path || !botConfig.username || !botConfig.password) {
        log('> [WARNING] Incomplete login data. Aborting upload.');
        return;
    }


    //////////////////////////////////////////
    // Read Files                           //
    //////////////////////////////////////////

    try {
        generatedPages = JSON.parse(fs.readFileSync(settings.processedModelDir + '_generated.json').toString());
    } catch (e) {
        log('> [ERROR] Could not read /_processed/_generated.json');
        exports.complete(false, callback);
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

        var formbot = new nodemw(botConfig);

        log('-------------------------------------------------------------------------');
        log('> Bot logging in with account: ' + botConfig.username);
        log('-------------------------------------------------------------------------');

        formbot.logIn(botConfig.username, botConfig.password, function(response) {

            var siteName;

            if (response.result === 'Success') {

                // Delete removed Sites
                if (settings.deleteWikiPages) {

                    uploadCounter += removedCounter;

                    for (siteName in removed) {

                        formbot.delete(siteName, 'mobo delete', function(response) {

                            uploadStatus++;

                            log(' - (' + exports.pad(uploadStatus, 3) + '/' + exports.pad(uploadCounter, 3) + ') | ' + response.title);

                            // If all tasks are run -> Callback
                            if (uploadCounter === uploadStatus) {
                                exports.complete(currentUploadState, callback);
                            }
                        });
                    }
                }

                // Upload new or changed Sites
                for (siteName in uploadQueue) {

                    siteContent = uploadQueue[siteName].toString();

                    formbot.edit(siteName, siteContent, 'mobo edit', function(response) {

                        uploadStatus++;

                        if (response.result === 'Success') {

                            // Check if the response indicates that changes or new pages were created
                            var change = '';
                            if (response['new'] === '') {
                                change = ' [NEW]';
                            } else if (response.newrevid) {
                                change = ' [CHANGED]';
                            }

                            log(' U (' + exports.pad(uploadStatus, 3) +
                                '/' + exports.pad(uploadCounter, 3) + ') | ' +
                                response.title + change);
                        } else {
                            log(' U [ERROR] UPLOADED FAILED: (' + exports.pad(uploadStatus, 3) + '/' + exports.pad(uploadCounter, 3) + ') | ' + response.title);
                            delete currentUploadState[response.title];
                        }

                        if (settings.verbose) {
                            log(response);
                        }

                        // If all tasks are run -> Callback
                        if (uploadCounter === uploadStatus) {
                            exports.complete(currentUploadState, callback);
                        }

                    });
                }

            } else {
                log('> [ERROR]: FormBot could not log-in into the wiki');
            }

        });

    } else {
        log('> No Changes detected -> Upload skipped');
        exports.complete(currentUploadState, callback);
    }

};

/**
 * Upload completed
 * Writes last upload state to file and triggers the callback function
 */
exports.complete = function(currentUploadState, callback) {

    if (currentUploadState) {
        // Write new lastUploadState
        fs.outputFileSync(exports.settings.processedModelDir + '/_lastUploadState.json', JSON.stringify(currentUploadState, false, 4));
    }

    // Trigger Callback
    return callback();
};

/**
 * Pad a number with n digits
 *
 * @param number
 * @param digits
 * @returns {string}
 */
exports.pad = function pad(number, digits) {
    return new Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
};
