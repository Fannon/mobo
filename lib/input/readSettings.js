//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var path       = require('path');
var _          = require('lodash');

var validate   = require('./../util/validate');
var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

/**
 * Loads default settings, calculates paths and overwrites them with custom project settings
 *
 * @param {{}}  customSettings
 *
 * @returns {Object|boolean} Settings Object
 */
exports.exec = function(customSettings) {

    /** The projects custom settings.json */
    var projectSettings = {};

    /** The final settings, with project settings overwriting mobos default settings */
    var finalSettings = {};


    //////////////////////////////////////////
    // LOAD & CALCULATE DEFAULT SETTINGS    //
    //////////////////////////////////////////

    // Load mobos default settings, will be inherited later.
    var settings   = require('./../settings.json');

    // Calculate and store paths
    settings = exports.calculatePaths(settings, customSettings);

    /* @deprecated handle /templates/ directory */
    if (fs.existsSync(settings.processedModelDir) && !fs.existsSync(settings.templateDir)) {
        log(' [E] /templates/ was renamed to /mobo_template/!');
        log(' [i] Please rename your /templates/ folder to /mobo_template/ in your project');
        settings.templateDir = path.join(settings.cwd, '/templates/');
    }


    //////////////////////////////////////////
    // GET CUSTOM SETTINGS                  //
    //////////////////////////////////////////

    if (customSettings) {
        // If settings are given through the parameter, use those instead of the project settings.json
        projectSettings = customSettings;

    } else {
        // Get settings.json from the working directory
        if (fs.existsSync(settings.cwd + '/settings.json')) {

            try {
                var fileContent  = fs.readFileSync(settings.cwd + '/settings.json').toString();
                projectSettings = JSON.parse(fileContent);
            } catch(e) {
                log(' [E] [SYNTAX] Could not parse settings.json: ' + e.message);
                log(' [i] Check the settings.json for valid JSON syntax.');
                return false;
            }


        } else {
            log(' [W] No settings.json file found!');
            log(' [i] Use "mobo --init" to create a new project here.');
            return false;
        }
    }

    finalSettings = _.merge(settings, projectSettings);


    //////////////////////////////////////////
    // VALIDATION & ERROR HANDLING          //
    //////////////////////////////////////////

    var validation = validate.validateSettings(finalSettings);

    if (!validation.valid) {
        log(' [E] [STRUCTURE] Invalid json.schema structure!');
        log(' [i] Check your settings.json for invalid options');
        return false;
    }

    // Sanitize settings
    if (finalSettings.mw_server_url) {
        finalSettings.mw_server_url = moboUtil.stripTrailingSlash(finalSettings.mw_server_url);
    }
    if (finalSettings.mw_server_path) {
        finalSettings.mw_server_path = moboUtil.stripTrailingSlash(finalSettings.mw_server_path);
    }

    // User Feedback
    if (finalSettings.deleteWikiPages) {
        log('');
        log(' [i] The "deleteWikiPages" option enables mobo to delete pages from your wiki. Use with care.');
    }

    return finalSettings;
};

exports.calculatePaths = function(settings, customSettings) {

    settings.cwd = process.cwd();

    if (customSettings && customSettings.cwd) {
        settings.cwd = customSettings.cwd;
    }

    settings.importModelDir = settings.cwd;
    settings.templateDir = path.join(settings.cwd, '/mobo_template/');
    settings.logDir = path.join(settings.cwd, '/_logfiles/');
    settings.processedModelDir = path.join(settings.cwd, '/_processed/');

    return settings;
}