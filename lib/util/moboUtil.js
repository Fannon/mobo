/* jshint unused: false */

//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs     = require('fs-extra');
var path   = require('path');
var semlog     = require('semlog');
var log        = semlog.log;

var handlebars = require('./../util/handlebarsExtended');


//////////////////////////////////////////
// LOGGER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Writes the current log object to a file in the given directory
 *
 * @param dir   filepath
 */
exports.writeLogHistory = function(dir) {
    if (dir) {
        var fileName = semlog.roboDate();
        fileName = path.resolve(dir, fileName + '.json');
        fs.ensureDir(dir, function() {
            fs.outputFile(fileName, JSON.stringify(semlog.getLogHistory(), false, 4));
        });
    }
};


//////////////////////////////////////////
// MODELING HELPER                      //
//////////////////////////////////////////

/**
 * Takes an model/field/form $extend URL and returns the name of the file without extension
 *
 * @param {string} url
 * @param {string} hint
 * @returns {object|boolean}
 */
exports.resolveReference = function(url, hint) {

    /** If an error occurs, this gives a hint in which file */
    if (hint) {
        hint = ' ' + hint + ': ';
    } else {
        hint = '';
    }

    if (url.indexOf('/') > -1) {
        var ref = url.split('/');

        if (ref.length === 3) {

            // TODO: Would be more consequent to always strip the file extension
            // This does currently cause problems with .wikitext mobo_template and the queries
            // var id = ref[2].substr(0, ref[2].lastIndexOf('.'));

            var id = ref[2].replace('.json', '');
            return {
                path: url,
                type: ref[1],
                filename: ref[2],
                id: id
            };
        } else {
            log('[E]' + hint + ' Malformed "$reference" or "format" path: ' + url);
            log('[i] Do not include include subfolders in the "$extend" or "format" path!');
            return false;
        }

    } else {
        // if "format" is not a path, the name is already the id
        return {
            id: url
        };
    }

};



/**
 * Calculates the prefixed wikitext, if the model requests it
 *
 * @param {string}  mode        'smw_prefix' or 'smw_postfix'
 * @param {string}  type        'showForm' or 'showPage'
 * @param {object}  model
 * @param {object}  registry
 *
 * @returns {boolean|object}
 */
exports.prePostFix = function(mode, type, model, registry) {

    var wikitext = false;

    if (model.items) {
        model = model.items;
    }

    if (model[mode]) {

        // Prefix is by default always displayed, except it is explicitly disabled by setting it false;
        if (model[mode].hasOwnProperty(type) && model[mode][type] === false) {
            return false;

        } else {
            wikitext = '';

            // Inject auto header, depending on given hierachy
            if (model[mode].header) {
                var headerLevel = '=';
                if (model[mode].header > 0 && model[mode].header < 8) {
                    headerLevel = new Array(model[mode].header + 1).join('=');
                }
                wikitext += headerLevel + model.title + headerLevel + '\n';
            }

            // Inject wikitext
            if (model[mode].wikitext) {
                wikitext += model[mode].wikitext + '\n';
            }

            // Inject already existing template
            if (model[mode].template) {
                if (registry.smw_template[model[mode].template + '.wikitext']) {
                    wikitext += registry.smw_template[model[mode].template + '.wikitext'];
                } else {
                    log('[E] ' + model.$filepath + ' references to non exisiting template: ' + model[mode].template);
                }
            }
        }
    }

    return wikitext;
};

//////////////////////////////////////////
// MISC HELPER FUNCTIONS                //
//////////////////////////////////////////

/**
 * Helper function that loads a handlebars-template if it hasn't been loaded yet
 *
 * @param {{}}      scope           Usually module.exports
 * @param {string}  templateFileName    name of the template including file extension
 * @param {{}}      settings
 * @param {boolean} internalTemplate
 *
 * @returns {*}
 */
exports.loadTemplate = function(scope, templateFileName, settings, internalTemplate) {

    handlebars.setMoboSettings(settings);

    var templateName = templateFileName.substr(0, templateFileName.lastIndexOf('.'));
    var template = scope[templateName + 'Template'];

    // If the template is not loaded already, do so:
    if (!template) {

        var filePath;

        // If it is an internal template fetch it from /lib/templates/*
        if (internalTemplate) {
            filePath = path.join(__dirname, './../templates/' + templateFileName);
        } else {
            filePath = path.join(settings.templateDir, templateFileName);
        }

        try {
            var file = fs.readFileSync(filePath).toString();
            template = handlebars.compile(file);
        } catch (e) {
            log('[E] Could not load template: ' + filePath);
        }
    }

    return template;
};
