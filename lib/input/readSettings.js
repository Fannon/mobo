//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var path       = require('path');
var _          = require('lodash');
var yaml       = require('js-yaml');
var semlog     = require('semlog');
var log        = semlog.log;

var validate   = require('./../util/validate');

// Load mobos default settings, will be inherited later.
var defaultSettings   = require('./../settings.json');

/**
 * Loads default settings, calculates paths and overwrites them with custom project settings
 *
 * @param {{}}  customSettings
 *
 * @returns {Object|boolean} Settings Object
 */
exports.exec = function(customSettings) {

    'use strict';

    /** The projects custom settings.json */
    var projectSettings = {};

    /** The final settings, with project settings overwriting mobos default settings */
    var finalSettings = {};


    //////////////////////////////////////////
    // LOAD & CALCULATE DEFAULT SETTINGS    //
    //////////////////////////////////////////

    // Calculate and store paths
    defaultSettings = exports.calculatePaths(defaultSettings, customSettings);

    /* @deprecated handle /templates/ directory */
    if (fs.existsSync(defaultSettings.processedModelDir) && !fs.existsSync(defaultSettings.templateDir)) {
        log(' [E] /templates/ was renamed to /mobo_template/!');
        log(' [i] Please rename your /templates/ folder to /mobo_template/ in your project');
        defaultSettings.templateDir = path.join(defaultSettings.cwd, '/templates/');
    }


    //////////////////////////////////////////
    // GET CUSTOM SETTINGS                  //
    //////////////////////////////////////////

    if (customSettings) {
        // If settings are given through the parameter, use those instead of the project settings.json
        projectSettings = customSettings;

    } else {

        if (fs.existsSync(path.join(process.cwd(), '/settings.yaml'))) {

            // Get settings.yaml from the working directory

            try {
                projectSettings = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), '/settings.yaml'), 'utf8'));
            } catch (e) {
                log(' [E] [SYNTAX] Could not parse settings.yaml: ' + e.message);
                log(' [i] Check the settings.yaml for valid JSON syntax.');
                log(e, true);
                return false;
            }

        } else if (fs.existsSync(defaultSettings.cwd + '/settings.json')) {

            // Get settings.json from the working directory

            try {
                var fileContent  = fs.readFileSync(defaultSettings.cwd + '/settings.json').toString();
                projectSettings = JSON.parse(fileContent);
            } catch (e) {
                log(' [E] [SYNTAX] Could not parse settings.json: ' + e.message);
                log(' [i] Check the settings.json for valid JSON syntax.');
                log(e, true);
                return false;
            }

        } else {
            log(' [W] No settings.yaml or settings.json file found!');
            log(' [i] Use "mobo --init" to create a new project here.');
            return false;
        }
    }

    finalSettings = _.merge(defaultSettings, projectSettings);


    //////////////////////////////////////////
    // VALIDATION & ERROR HANDLING          //
    //////////////////////////////////////////

    var validation = validate.validateSettings(finalSettings);

    if (!validation.valid) {
        log(' [E] [STRUCTURE] Invalid json.schema structure!');
        log(' [i] Check your settings.json for invalid options');

        if (!defaultSettings.force) {
            return false;
        }
    }

    // Sanitize settings
    if (finalSettings.mw_server_url) {
        finalSettings.mw_server_url = semlog.stripTrailingSlash(finalSettings.mw_server_url);
    }
    if (finalSettings.mw_server_path) {
        finalSettings.mw_server_path = semlog.stripTrailingSlash(finalSettings.mw_server_path);
    }

    return finalSettings;
};

exports.calculatePaths = function(settings, customSettings) {

    'use strict';

    settings.cwd = process.cwd();

    if (customSettings && customSettings.cwd) {
        settings.cwd = customSettings.cwd;
    }

    settings.importModelDir = settings.cwd;
    settings.templateDir = path.join(settings.cwd, '/mobo_template/');
    settings.logDir = path.join(settings.cwd, '/_logfiles/');
    settings.processedModelDir = path.join(settings.cwd, '/_processed/');

    return settings;
};
