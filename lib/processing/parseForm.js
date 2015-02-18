//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var handlebars = require('./../util/handlebarsExtended');
var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;


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

    // Inject the current settings into the template engine
    handlebars.setMoboSettings(settings);

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
 * @TODO: Support smw_for_template option, replaces unflexible smw_noLabel option
 * (https://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27for_template.27_tag)
 *
 * @param json
 * @param name
 * @param settings
 * @returns {*}
 */
exports.generateForm = function(json, name, settings) {

    //////////////////////////////////////////
    // GENERAL FORM ATTRIBUTES              //
    //////////////////////////////////////////

    /** Form Templating information */
    var templatingForm = {
        title: json.title || name,
        name: name,
        description: json.description || false,
        naming: json.smw_naming || false,

        template: [],

        headerTabs: settings.headerTabs,

        formInput: json.smw_forminput || false,
        formInfo: json.smw_forminfo || false,

        summary: json.smw_summary || false
    };

    // If this form is to be ignored, skip generating it
    if (json.ignore) {
        return false;
    }

    /** Freetext form at the bottom of the form */
    templatingForm.freetext = true;
    if (json.smw_freetext === false) {
        templatingForm.freetext = false;
    }

    /** Use formEdit helper */
    templatingForm.formEdit = true;
    if (json.smw_formedit === false || settings.formEditHelper === false) {
        templatingForm.formEdit = false;
    }


    // Provide information about each of the models / templates used within
    for (var modelName in json.properties) {

        var model = json.properties[modelName];

        var templatingModel = {};

        if (model) {

            //////////////////////////////////////////
            // GENERAL MODEL ATTRIBUTES             //
            //////////////////////////////////////////

            /** Human readable title. Look for model.items too since this could be an array of models */
            templatingModel.title = model.title || modelName;
            if (model.items && model.items.title) {
                templatingModel.title = model.items.title;
            }

            /** Model id, usually the filename */
            templatingModel.id = model.id;
            if (model.items && model.items.id) {
                templatingModel.id = model.items.id;
            }

            /** @deprecated id should be used instead! */
            templatingModel.name = templatingModel.id;

            /** If label should be drawn @TODO: Does that still make sense ? */
            templatingModel.label = true;
            if (!model.items) {
                templatingModel.label = false;
            }

            /** Use multiple instances in SF */
            templatingModel.multiple = false;

            /** Add Prefix wikitext if given
             * @todo: This could look much nicer if the JSON Schema Validator would be setting default values automatically
             */
            if (model.smw_prefix) {

                // Prefix is by default always displayed, except it is explicitly disabled by setting it false;
                if (model.smw_prefix.hasOwnProperty('showForm') && model.smw_prefix.showForm === false) {
                    templatingModel.prefix = false;

                } else {
                    templatingModel.prefix = '';

                    // Inject auto header, depending on given hierachy
                    if (model.smw_prefix.header) {
                        var headerLevel = '=';
                        if (model.smw_prefix.header > 0 && model.smw_prefix.header < 5) {
                            headerLevel = new Array(model.smw_prefix.header + 1).join('=');
                        }
                        templatingModel.prefix += headerLevel + templatingModel.title + headerLevel + '\n';
                    }

                    // Inject wikitext
                    if (model.smw_prefix.wikitext ) {
                        templatingModel.prefix += model.smw_prefix.wikitext;
                    }
                }
            }

            /** Add Postfix wikitext if given */
            if (model.smw_postfix) {

                // Postfix is by default always displayed, except it is explicitly disabled by setting it false;
                if (model.smw_postfix.hasOwnProperty('showForm') && model.smw_postfix.showForm === false) {
                    templatingModel.postfix = false;
                } else if (model.smw_postfix.wikitext) {
                    templatingModel.postfix = model.smw_postfix.wikitext;
                }
            }

            //////////////////////////////////////////
            // SPECIFIC MODEL ATTRIBUTES            //
            //////////////////////////////////////////

            // Just inject wikitext into the form
            if (model.wikitext) { /** @deprecated ? */

                templatingModel.wikitext = model.wikitext;
                templatingModel.model = false;

            // Uses the more advanced template notation to inject wikitext
            } else if (model.template) {

                // Defaults
                templatingModel.showSite = true;
                templatingModel.showForm = true;

                if (model.showSite === false) {
                    templatingModel.showSite = false;
                }

                if (model.showForm === false) {
                    templatingModel.showForm = false;
                }

                templatingModel.template = model.template;
                templatingModel.model = false;

            // Handle Array Models (multiple instances)
            } else if (model.items) {

                /** TODO: MinItems und MaxItems could be a generic smw_form option object (minumum instances=...) */
                templatingModel.multiple = {
                    minItems: model.items.minItems || 0,
                    maxItems: model.items.maxItems || false
                };

                templatingModel.model = model.items;

            // Handle normal models (single instance)
            } else {
                templatingModel.model = model;
            }

            templatingForm.template.push(templatingModel);

        } else {
            log(' [W] Model "' + modelName + '" is no valid model!');
            return false;
        }

    }

    return formTemplate(templatingForm);

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
 *
 * @returns {string}
 */
exports.generateHelperTemplate = function(json, name) {

    var wikitext = '';

    if (!json.smw_category && json.smw_category !== false) {
        wikitext = ' <includeonly> [[Category:' + name + ' FormEdit]]</includeonly>';
    }

    return wikitext;

};
