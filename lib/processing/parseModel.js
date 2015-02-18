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

var categoryTemplateFile;
var categoryTemplate;

var templateTemplateFile;
var templateTemplate;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of the models
 * Will generate SMW Category and Template Sites
 *
 * @param settings
 * @param model
 * @param name
 * @param registry
 * @returns {{}}
 */
exports.exec = function (settings, model, name, registry) {
    'use strict';

    // Inject the current settings into the template engine
    handlebars.setMoboSettings(settings);

    //////////////////////////////////////////
    // Inner Variables                      //
    //////////////////////////////////////////

    /** Return Object, matching the data structure of the registry */
    var returnObject = {
        category: {},
        template: {}
    };


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    // If the templates are not loaded already, do so:
    if (!categoryTemplateFile) {
        categoryTemplateFile = fs.readFileSync(settings.templateDir + 'category.wikitext').toString();
        categoryTemplate = handlebars.compile(categoryTemplateFile);
    }

    if (!templateTemplateFile) {
        templateTemplateFile = fs.readFileSync(settings.templateDir + 'template.wikitext').toString();
        templateTemplate = handlebars.compile(templateTemplateFile);
    }


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Generate Category
    var categoryWikitext = exports.generateCategory(model, name, registry, settings);
    if (categoryWikitext) {
        returnObject.category[name] = categoryWikitext;
    }

    // Generate Template
    var templateWikitext = exports.generateTemplate(model, name, registry, settings);
    if (templateWikitext) {
        returnObject.template[name] = templateWikitext;
    }

    return returnObject;
};

/**
 * Generates Category for all models that are defined being a smw_form
 *
 * @param {{}}      json
 * @param {string}  name
 * @param {{}}      registry
 * @param {{}}      settings
 *
 * @returns {*}
 */
exports.generateCategory = function(json, name, registry, settings) {

    // If smw_category is set to false, don't create a category
    if (json.smw_category === false) {
        return false;
    }

    var title = json.title || name;
    var form = false;
    var formCategory = false;
    var template = true;

    // If this model is abstract, create a category for it
    // No template will be generated, so don't link for one
    // Removes all leading _ if they are used for indicating an abstract model
    if (json.abstract) {
        while (name.charAt(0) === '_') {
            name = name.substr(1);
        }
        template = false;
    }


    // If The FormEdit mode is NOT activated and there is a form with the name name as the model, display it.
    if (!settings.formEditHelper && registry.form[json.id]) {
        form = true;
        formCategory = false;
    }

    // If FormEdit mode is active and there is a form with the same name as the model, just display a link to it.
    if (settings.formEditHelper && registry.form[json.id]) {
        form = false;
        formCategory = true;
    }

    var data = {
        name: name,
        title: title,
        form: form,
        formCategory: formCategory,
        template: template,
        overview: true,
        attr: json.properties
    };

    if (json.description) {
        data.description = json.description;
    }

    return categoryTemplate(data);

};

/**
 * Generates Template for all not abstract models
 *
 * @param model
 * @param name
 * @returns {*}
 */
exports.generateTemplate = function(model, name, registry, settings) {

    // If this is an abstract model, don't create a template for it
    if (model.abstract) {
        return false;
    }

    var data = {
        title: model.title || name,
        id: model.id,
        name: name, //@deprecated
        description: model.description || false,
        templatedata: exports.getTemplateData(model),
        category: name,
        categories: model.smw_categories || false,
        smw_subobject: model.smw_subobject || false,
        arraymap: false
    };

    data.attr = model.properties;


    // Check if property has to be implemented as arraymap
    for (var propertyName in data.attr) {
        if (registry.field[propertyName] && registry.field[propertyName].items) {
            data.attr[propertyName].smw_arraymap = true;
        }
    }

    // In some cases no category tag should be created
    if (model.smw_category === false || (model.smw_subobject && (model.smw_category !== true))) {
        data.category = false;
    }

    // Since Handlebars.js does not support comparators:
    // inject a variable that has the name of the smw_display renderer
    var smwDisplay = model.smw_display || settings.defaultTemplateDisplay;
    data['display_' + smwDisplay] = true;

    moboUtil.injectWikitext('page', model, data, registry);

    return templateTemplate(data);

};

/**
 * Converts JSON Schema Model to MediaWiki Template Data Object
 * http://www.mediawiki.org/wiki/Extension:TemplateData
 *
 * @param model
 * @returns {string}    JSON String
 */
exports.getTemplateData = function(model) {

    var templateData = {};

    if (model.description) {
        templateData.description = model.description;
    }

    if (model.properties) {

        templateData.params = {};

        for (var propertyName in model.properties) {

            var property = model.properties[propertyName];
            var id = property.id;

            var param = {};

            param.type = "unknown"; // Default Type
            param.suggested = true;

            if (property.title) {
                param.label = property.title;
            }

            if (property.description) {
                param.description = property.description;
            } else {
                param.description = "";
            }

            if (model.required && model.required.indexOf(propertyName) > -1) {
                param.required = true;
            }

            // Basic Content Types
            if (property.type === 'string') {
                param.type = 'line';
            } else if (property.type === 'number') {
                param.type = 'number';
            }

            // Textareas
            if (property.smw_form && property.smw_form['input type'] && property.smw_form['input type'] === 'textarea') {
                param.type = 'string';
            }

            // Links to Wiki Sites
            if (property.format && property.format.charAt(0) === '/' || (property.items && property.items.format && property.items.format.charAt(0) === '/')) {
                param.type = 'wiki-page-name';
            }

            // Links to SubObjects
            if (property.items && property.items.title) {
                param.type = 'content';
                param.description += "(SMW SubObject)";
            }

            if (property.default) {
                param.default = property.default;
            }

            templateData.params[id] = param;
        }
    }

    return JSON.stringify(templateData, false, 4);
};
