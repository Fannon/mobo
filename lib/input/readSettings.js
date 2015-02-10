//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var _          = require('lodash');

var validateSchema   = require('./../util/validateSchema');
var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

/**
 * Loads default settings, calculates paths and overwrites them with custom project settings
 *
 * TODO: Check settings through settings.jsonschema
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
    var cwd = process.cwd();
    if (customSettings && customSettings.cwd) {
        cwd = customSettings.cwd;
    }
    settings.cwd = cwd;
    settings.importModelDir = cwd;
    settings.templateDir =  cwd + '/templates/';
    settings.logDir =  cwd + '/_logfiles/';
    settings.processedModelDir = cwd + '/_processed/';


    //////////////////////////////////////////
    // GET CUSTOM SETTINGS                  //
    //////////////////////////////////////////

    if (customSettings) {
        // If settings are given through the parameter, use those instead of the project settings.json
        projectSettings = customSettings;

    } else {
        // Get settings.json from the working directory
        if (fs.existsSync(cwd + '/settings.json')) {

            try {
                projectSettings = JSON.parse(fs.readFileSync(cwd + '/settings.json').toString());
            } catch(e) {
                log(' [E] [SYNTAX] Could not parse settings.json!');
                log(' [i] Check the settings.json for valid JSON syntax.');
                log(e);
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

    var validation = validateSchema.validateSettings(finalSettings);

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
        log(' [W] The "deleteWikiPages" option can sometimes lead to problems. Use with care.');
    }

    return finalSettings;
};