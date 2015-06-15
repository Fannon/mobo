//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var moboUtil   = require('./../util/moboUtil');
var semlog     = require('semlog');
var log        = semlog.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of the forms
 * Will generate SMW Form Sites
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 * @param   {object}    registry
 *
 * @returns {object}    generated wikipages
 */
exports.exec = function(settings, obj, name, registry) {
    'use strict';

    // Do not create abstract or ignored forms
    if (obj.abstract || obj.ignore) {
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

    exports.formTemplate = moboUtil.loadTemplate(exports, 'form.wikitext', settings);
    exports.categoryTemplate = moboUtil.loadTemplate(exports, 'category.wikitext', settings);


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // GENERATE FORM
    var formWikitext = exports.generateForm(settings, obj, name, registry);
    if (formWikitext) {
        returnObject.form[name] = formWikitext;
    }

    // Generate Helper Template that tags the form with a "FormEdit" Category
    if (settings.formEditHelper) {

        // GENERATE HELPER CATEGORY
        var category = exports.generateHelperCategory(settings, obj, name);
        if (category) {
            returnObject.category[name + ' FormEdit'] = category;
        }

        // GENERATE HELPER TEMPLATE
        var template = exports.generateHelperTemplate(settings, obj, name);
        if (template) {
            returnObject.template[name + ' FormEdit'] = template;
        }
    }

    return returnObject;
};

/**
 * Generates Form for all not abstract models
 *
 * @TODO: Support smw_for_template option to replace unflexible smw_noLabel option
 * (https://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27for_template.27_tag)
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 * @param   {object}    registry
 *
 * @returns {string|boolean}        generated wikitext
 */
exports.generateForm = function(settings, obj, name, registry) {
    'use strict';

    //////////////////////////////////////////
    // GENERAL FORM ATTRIBUTES              //
    //////////////////////////////////////////

    /** Form Templating information */
    var templatingForm = {
        title: obj.title || name,
        name: name,
        description: obj.description || false,
        naming: obj.naming || false,

        template: [],

        headerTabs: settings.headerTabs,

        formInput: obj.sf_forminput || false,
        formInfo: obj.sf_forminfo || false,

        formEdit: settings.formEditHelper,

        summary: obj.sf_summary || false,

        formObj: obj,
        settingsObj: settings
    };

    // If this form is to be ignored, skip generating it
    if (obj.ignore) {
        return false;
    }

    /** Freetext form at the bottom of the form */
    templatingForm.freetext = true;
    if (obj.sf_freetext === false) {
        templatingForm.freetext = false;
    }

    // Provide information about each of the models / templates used within
    for (var modelName in obj.properties) {

        var model = obj.properties[modelName];

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

            /** If label should be drawn @TODO: Does that still make sense ? */
            templatingModel.label = true;
            if (!model.items) {
                templatingModel.label = false;
            }

            /** Use multiple instances in SF */
            templatingModel.multiple = false;

            /** Adding Prefixes */
            templatingModel.prepend = moboUtil.prePostFix('smw_prepend', model, registry);
            templatingModel.prepend += moboUtil.prePostFix('smw_prependForm', model, registry);

            /** Adding Postfixes */
            templatingModel.append = moboUtil.prePostFix('smw_append', model, registry);
            templatingModel.append += moboUtil.prePostFix('smw_appendForm', model, registry);

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
                templatingModel.showPage = true;
                templatingModel.showForm = true;

                // TODO: @deprecated showSite
                if (model.showPage === false || model.showSite === false) {
                    templatingModel.showPage = false;
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

            /** @deprecated */
            templatingModel.prefix = templatingModel.prepend;
            /** @deprecated */
            templatingModel.postfix = templatingModel.append;

            templatingForm.template.push(templatingModel);

        } else {
            log('[W] Model "' + modelName + '" is no valid model!');
            return false;
        }

    }

    return exports.formTemplate(templatingForm);

};

/**
 * This creates a Helper Category that defines which form to use whith a specific site
 * It serves no other purpose than declaring the default form.
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 *
 * @returns {string|boolean}        generated wikitext
 */
exports.generateHelperCategory = function(settings, obj, name) {
    'use strict';

    var wikitext = false;

    if (!obj.smw_category && obj.smw_category !== false) {

        var data = {
            name: name,
            title: obj.title || name,
            overview: false,
            template: false,
            hidden: settings.hideFormEditHelper || false,
            form: true,

            formObj: obj,
            settingsObj: settings
        };

        wikitext = exports.categoryTemplate(data);
    }

    return wikitext;

};

/**
 * Generates a Helper Template that assigns the HelperCategory to a specific site.
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 *
 * @returns {string|boolean}        generated wikitext
 */
exports.generateHelperTemplate = function(settings, obj, name) {

    var wikitext = false;

    if (!obj.smw_category && obj.smw_category !== false) {
        wikitext = ' <includeonly> [[Category:' + name + ' FormEdit]]</includeonly>';
    }

    return wikitext;

};
