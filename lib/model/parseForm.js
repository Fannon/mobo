//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var handlebars = require('./../handlebarsExtended');
var logger     = require('./../logger.js');
var log        = logger.log;


//////////////////////////////////////////
// Outer Variables                      //
//////////////////////////////////////////

var formTemplateFile;
var formTemplate;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of the forms
 * Will generate SMW Form Sites
 *
 * @param settings
 * @param json
 * @param name
 * @returns {{}}
 */
exports.exec = function(settings, json, name) {

    // Do not create abstract or ignored forms
    if (json.abstract || json.ignore) {
        return {};
    }

    //////////////////////////////////////////
    // Inner Variables                      //
    //////////////////////////////////////////

    /** Return Object, matching the data structure of the registry */
    var returnObject = {
        form: {},
        category: {},
        template: {}
    };


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    // If the templates are not loaded already, do so:
    if (!formTemplateFile) {
        formTemplateFile = fs.readFileSync(settings.templateDir + 'form.wikitext').toString();
        formTemplate = handlebars.compile(formTemplateFile);
    }


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // GENERATE FORM
    var formWikitext = exports.generateForm(json, name, settings);
    if (formWikitext) {
        returnObject.form[name] = formWikitext;
    }

    // Generate Helper Template that tags the form with a "FormEdit" Category
    if (settings.formEditHelper) {

        // GENERATE HELPER CATEGORY
        var category = exports.generateHelperCategory(json, name, settings);
        if (category) {
            returnObject.category[name + ' FormEdit'] = category;
        }

        // GENERATE HELPER TEMPLATE
        var template = exports.generateHelperTemplate(json, name, settings);
        if (template) {
            returnObject.template[name + ' FormEdit'] = template;
        }
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
exports.generateForm = function(json, name, settings) {

    var freetext = true;
    var formEdit = true;

    // If this form is to be ignored, skip generating it
    if (json.ignore) {
        return false;
    }

    if (json.smw_formedit === false || settings.formEditHelper === false) {
        formEdit = false;
    }

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
        formEdit: formEdit,

        formInput: json.smw_forminput || false,
        formInfo: json.smw_forminfo || false,

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

                var showSite = true;
                var showForm = true;

                if (model.showSite === false) {
                    showSite = false;
                }

                if (model.showForm === false) {
                    showForm = false;
                }

                data.template.push({
                    multiple: false,
                    name: model.id,
                    title: model.title || modelName,
                    label: label,
                    template: model.template,
                    showSite: showSite,
                    showForm: showForm
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
            return false;
        }

    }

    return formTemplate(data);

};

/**
 * This creates a Helper Category that defines which form to use whith a specific site
 * It serves no other purpose than declaring that form.
 *
 * @param json
 * @param name
 * @param settings
 * @returns {boolean}
 */
exports.generateHelperCategory = function(json, name, settings) {

    var wikitext = false;

    if (!json.smw_category && json.smw_category !== false) {

        var categoryTemplateFile = fs.readFileSync(settings.templateDir + 'category.wikitext').toString();
        var categoryTemplate = handlebars.compile(categoryTemplateFile);

        var data = {
            name: name,
            title: json.title || name,
            overview: false,
            template: false,
            hidden: settings.hideFormEditHelper || false,
            form: true
        };

        wikitext = categoryTemplate(data);
    }

    return wikitext;

};

/**
 * Generates a Helper Template that assigns the HelperCategory to a specific site.
 *
 * @param json
 * @param name
 * @param settings
 * @returns {boolean}
 */
exports.generateHelperTemplate = function(json, name, settings) {

    var wikitext = false;

    if (!json.smw_category && json.smw_category !== false) {
        wikitext = ' <includeonly> [[Category:' + name + ' FormEdit]]</includeonly>';
    }

    return wikitext;

};
