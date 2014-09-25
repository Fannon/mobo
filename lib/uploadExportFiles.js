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

    //////////////////////////////////////////
    // Configuration                        //
    //////////////////////////////////////////

    var botConfig = {
        server: settings.mw_server_url,  // host name of MediaWiki-powered site
        path: settings.mw_server_path,                                  // path to api.php script
        debug: false,                                       // is more verbose when set to true
        silent: true,
        "username": settings.mw_username,                              // account to be used when logIn is called (optional)
        "password": settings.mw_password,                            // password to be used when logIn is called (optional)
        "concurrency": settings.concurrency
    };


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
    for (var siteName in lastUploadState) {
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

    function pad(number, digits) {
        return new Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }

    if (uploadCounter > 0) {

        log('> Preparing upload...');

        var formbot = new nodemw(botConfig);

        formbot.logIn(botConfig.username, botConfig.password, function(response) {

            log('-------------------------------------------------------------------------');

            if (response.result === 'Success') {

                // Upload new or changed Sites
                for (siteName in uploadQueue) {

                    siteContent = uploadQueue[siteName].toString();

                    formbot.edit(siteName, siteContent, 'FormBot Edit', function(response) {

                        if (response.result === 'Success') {
                            log(' U (' + pad(uploadStatus, 3) + '/' + pad(uploadCounter, 3) + ') | ' + response.title);
                            uploadStatus++;
                        } else {
                            log(' U [ERROR] UPLOADED FAILED: (' + pad(uploadStatus, 3) + '/' + pad(uploadCounter, 3) + ') | ' + response.title);
                            delete currentUploadState[response.title];
                            uploadStatus++;
                        }

                        // If all tasks are run -> Callback
                        if (uploadCounter === uploadStatus) {
                            callback();
                        }

                    });
                }

                // Delete removed Sites
                if (settings.deleteSites) {

                    uploadCounter += removedCounter;

                    for (siteName in removed) {

                        formbot.delete(siteName, 'FormBot Delete', function(response) {

                            log(' - (' + pad(uploadStatus, 3) + '/' + pad(uploadCounter, 3) + ') | ' + response.title);
                            uploadStatus++;

                            // If all tasks are run -> Callback
                            if (uploadCounter === uploadStatus) {
                                callback();
                            }
                        });
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
