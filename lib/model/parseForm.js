//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');
var handlebars = require('./../handlebarsExtended');

var logger     = require('./../logger.js');
var log        = logger.log;




//////////////////////////////////////////
// Logic                                //
//////////////////////////////////////////

var formTemplate, generateForm;

/**
 * Executes the parsing of the forms
 * Will generate SMW Form Sites
 *
 * @param settings
 * @param json
 * @param name
 * @returns {{}}
 */
exports.exec = function (settings, json, name) {

    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var formTemplateFile = fs.readFileSync(settings.templateDir + 'form.wikitext').toString();
    formTemplate = handlebars.compile(formTemplateFile);

    var returnObject = {};

    // Generate Form
    var form = generateForm(json, name, settings);
    if (form) {
        returnObject.form = form;
    }

    return returnObject;
};

/**
 * Generates Form for all not abstract models
 *
 * @param json
 * @param name
 * @param settings
 * @returns {*}
 */
generateForm = function(json, name, settings) {

    var freetext = true;

    if (json.smw_freetext === false) {
        freetext = false;
    }

    var data = {
        title: json.title || name,
        name: name,
        description: json.description || false,
        naming: json.naming || false,

        template: [],

        headerTabs: settings.headerTabs,

        freetext: freetext,
        summary: json.smw_summary || false
    };

    for (var modelName in json.properties) {

        var model = json.properties[modelName];

        if (model) {
            var label = true;

            if (!model.items || model.smw_noLabel) {
                label = false;
            }

            if (model.wikitext) {
                data.template.push({
                    multiple: false,
                    name: modelName,
                    title: model.title || modelName,
                    label: label,
                    wikitext: model.wikitext
                });

            } else if (model.template) {

                data.template.push({
                    multiple: false,
                    name: model.id,
                    title: model.title || modelName,
                    label: label,
                    template: model.template,
                    showSite: model.showSite || true,
                    showForm: model.showForm || false
                });

            } else if (model.items) {

                data.template.push({
                    multiple: {
                        minItems: model.items.minItems || 0,
                        maxItems: model.items.maxItems || false
                    },
                    name: modelName,
                    title: model.title || modelName,
                    label: label,
                    model: model.items
                });

            } else {
                data.template.push({
                    multiple: false,
                    name: modelName,
                    title: model.title || modelName,
                    label: label,
                    model: model
                });
            }
        } else {
            log('> [WARNING] Model "' + modelName + '" is no valid model!');
        }

    }

    return formTemplate(data);

};
