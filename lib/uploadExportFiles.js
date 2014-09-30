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

    var lastUploadState = {};
    var uploadQueue = {};
    var totalSitesCounter = 0;
    var uploadCounter = 0;
    var uploadStatus = 0;
    var removedCounter = 0;

    var removed = {};
    var changed = {};
    var added = {};

    var siteContent;
    var siteName;

    //////////////////////////////////////////
    // Configuration                        //
    //////////////////////////////////////////

    var botConfig = {
        server: settings.mw_server_url.replace('http://', '') || false,  // host name of MediaWiki-powered site
        path: settings.mw_server_path || false,   // path to api.php script
        debug: false,                    // is more verbose when set to true
        silent: true,
        "username": settings.mw_username || false,                              // account to be used when logIn is called (optional)
        "password": settings.mw_password || false,                            // password to be used when logIn is called (optional)
        "concurrency": settings.concurrency
    };

    //////////////////////////////////////////
    //                                      //
    //////////////////////////////////////////

    if (!botConfig.server || !botConfig.path || !botConfig.username || !botConfig.password) {
        log('> [WARNING] Incomplete login data. Aborting upload.');
        return;
    }


    //////////////////////////////////////////
    // Read Files                           //
    //////////////////////////////////////////

    try {
        lastUploadState = JSON.parse(fs.readFileSync(settings.processedModelDir + '_lastUploadState.json').toString());
    } catch (e) {
        lastUploadState = {};
    }

    var generatedSites = JSON.parse(fs.readFileSync(settings.processedModelDir + '_generated.json').toString());

    var currentUploadState = _.cloneDeep(generatedSites);


    //////////////////////////////////////////
    // Look for Changes                     //
    //////////////////////////////////////////

    // Checks for Sites that have been deleted since last upload
    for (siteName in lastUploadState) {
        siteContent = generatedSites[siteName];

        // Check for Deleted Sites
        if (!(generatedSites[siteName])) {
            log(' - ' + siteName);
            currentUploadState[siteName] = siteContent;
            removed[siteName] = siteContent;
            removedCounter += 1;
        }
    }

    // Check for new or changed Sites
    for (siteName in generatedSites) {

        totalSitesCounter += 1;
        siteContent = generatedSites[siteName];

        if (!(lastUploadState[siteName])) {
            log(' + ' + siteName);
            currentUploadState[siteName] = siteContent;
            uploadQueue[siteName] = siteContent;
            added[siteName] = siteContent;
            uploadCounter += 1;

        } else if (JSON.stringify(siteContent) !== JSON.stringify(lastUploadState[siteName])) {

            var sizeDiff = JSON.stringify(siteContent).length - JSON.stringify(lastUploadState[siteName]).length;
            if (sizeDiff > 0) {
                sizeDiff = '+' + sizeDiff;
            }

            log(' C ' + siteName + ' (' + sizeDiff + ')');
            currentUploadState[siteName] = siteContent;
            uploadQueue[siteName] = siteContent;
            changed[siteName] = siteContent;
            uploadCounter += 1;
        } else {
            // No Changes
        }
    }

    if (settings.forceUpload) {
        log('>> FORCING Upload of all generated Files');
        currentUploadState = generatedSites;
        uploadQueue = generatedSites;
        uploadCounter = totalSitesCounter;
    }


    //////////////////////////////////////////
    // Generate Report                      //
    //////////////////////////////////////////

    if (uploadCounter > 0) {

        var report = generateReport(settings, {
            name: "FormBot",
            description: "Report des Formbots. Dieser Bot importiert und updated die semantische Struktur des Wikis.",
            removed: removed,
            changed: changed,
            added: added
        });

        for (var reportName in report) {
            log(' + ' + reportName);
        }

        _.merge(uploadQueue, report);
        uploadCounter += 2;

    }

    //////////////////////////////////////////
    // Uploading via Bot                    //
    //////////////////////////////////////////



    if (uploadCounter > 0) {

        var formbot = new nodemw(botConfig);

        log('-------------------------------------------------------------------------');
        log('> Logging in with bot-account: ' + botConfig.username);
        log('-------------------------------------------------------------------------');

        /**
         * Helper Function that handles the response from a MW site upload
         *
         * @param {{}} response
         * @param {string} siteName
         */
        var handleUploadResponse = function(response, siteName) {

            uploadStatus++;

            if (response.result === 'Success') {
                log(' U (' + exports.pad(uploadStatus, 3) + '/' + exports.pad(uploadCounter, 3) + ') | ' + siteName);
            } else {
                log(' U [ERROR] UPLOADED FAILED: (' + exports.pad(uploadStatus, 3) + '/' + exports.pad(uploadCounter, 3) + ') | ' + siteName);
                delete currentUploadState[response.title];
            }

            // If all tasks are run -> Callback
            if (uploadCounter === uploadStatus) {
                callback();
            }

        };

        /**
         * Helper Function that handles the response from a MW site removal
         *
         * @param {{}} response
         * @param {string} siteName
         */
        var handleDeleteResponse = function(response, siteName) {

            uploadStatus++;

            log(' - (' + exports.pad(uploadStatus, 3) + '/' + exports.pad(uploadCounter, 3) + ') | ' + siteName);

            // If all tasks are run -> Callback
            if (uploadCounter === uploadStatus) {
                callback();
            }
        };

        formbot.logIn(botConfig.username, botConfig.password, function(response) {

            var siteName;

            if (response.result === 'Success') {

                // Upload new or changed Sites
                for (siteName in uploadQueue) {

                    siteContent = uploadQueue[siteName].toString();

                    formbot.edit(siteName, siteContent, 'FormBot Edit', handleUploadResponse(response, siteName));
                }

                // Delete removed Sites
                if (settings.deleteSites) {

                    uploadCounter += removedCounter;

                    for (siteName in removed) {

                        formbot.delete(siteName, 'FormBot Delete', handleDeleteResponse(response));
                    }
                }

            } else {
                log('> [ERROR]: FormBot could not log-in into the wiki');
            }

        });

    } else {
        log('> No Changes detected -> Upload skipped');
        callback();
    }

    //////////////////////////////////////////
    // Write Files                          //
    //////////////////////////////////////////

    // Write new lastUploadState
    fs.outputFileSync(settings.processedModelDir + '/_lastUploadState.json', JSON.stringify(currentUploadState, false, 4));



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