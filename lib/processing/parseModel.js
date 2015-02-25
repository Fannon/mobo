//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var handlebars = require('./../util/handlebarsExtended');
var moboUtil   = require('./../util/moboUtil');


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of the models
 * Will generate SMW Category and Template Sites
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
    if (!exports.categoryTemplate) {
        var categoryTemplateFile = fs.readFileSync(settings.templateDir + 'category.wikitext').toString();
        exports.categoryTemplate = handlebars.compile(categoryTemplateFile);
    }

    if (!exports.templateTemplate) {
        var templateTemplateFile = fs.readFileSync(settings.templateDir + 'template.wikitext').toString();
        exports.templateTemplate = handlebars.compile(templateTemplateFile);
    }


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Generate Category
    var categoryWikitext = exports.generateCategory(settings, obj, name, registry);
    if (categoryWikitext) {
        returnObject.category[name] = categoryWikitext;
    }

    // Generate Template
    var templateWikitext = exports.generateTemplate(settings, obj, name, registry);
    if (templateWikitext) {
        returnObject.template[name] = templateWikitext;
    }

    return returnObject;
};

/**
 * Generates Category for all models that are defined being a smw_form
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 * @param   {object}    registry
 *
 * @returns {string|boolean}        generated wikitext
 */
exports.generateCategory = function(settings, obj, name, registry) {

    // If smw_category is set to false, don't create a category
    if (obj.smw_category === false) {
        return false;
    }

    var title = obj.title || name;
    var form = false;
    var formCategory = false;
    var template = true;

    // If this model is abstract, create a category for it
    // No template will be generated, so don't link for one
    // Removes all leading _ if they are used for indicating an abstract model
    if (obj.abstract) {
        while (name.charAt(0) === '_') {
            name = name.substr(1);
        }
        template = false;
    }


    // If The FormEdit mode is NOT activated and there is a form with the name name as the model, display it.
    if (!settings.formEditHelper && registry.form[obj.id]) {
        form = true;
        formCategory = false;
    }

    // If FormEdit mode is active and there is a form with the same name as the model, just display a link to it.
    if (settings.formEditHelper && registry.form[obj.id]) {
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
        attr: obj.properties
    };

    if (obj.description) {
        data.description = obj.description;
    }

    return exports.categoryTemplate(data);

};

/**
 * Generates Template for all not abstract models
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 * @param   {object}    registry
 *
 * @returns {string|boolean}        generated wikitext
 */
exports.generateTemplate = function(settings, obj, name, registry) {

    // If this is an abstract model, don't create a template for it
    if (obj.abstract) {
        return false;
    }

    var data = {
        title: obj.title || name,
        id: obj.id,
        name: name, //@deprecated
        description: obj.description || false,
        templatedata: exports.generateTemplateData(obj),
        category: name,
        categories: obj.smw_categories || false,
        smw_subobject: obj.smw_subobject || false,
        arraymap: false
    };

    data.attr = obj.properties;


    // Check if property has to be implemented as arraymap
    for (var propertyName in data.attr) {
        if (registry.expandedField[propertyName] && registry.expandedField[propertyName].items) {
            data.attr[propertyName].smw_arraymap = true;
        }
    }

    // In some cases no category tag should be created
    if (obj.smw_category === false || (obj.smw_subobject && (obj.smw_category !== true))) {
        data.category = false;
    }

    // Since Handlebars.js does not support comparators:
    // inject a variable that has the name of the smw_display renderer
    var smwDisplay = obj.smw_display || settings.defaultTemplateDisplay;
    data['display_' + smwDisplay] = true;

    data.prefix = moboUtil.prefixModel('showPage', obj, registry);
    data.postfix = moboUtil.postfixModel('showPage', obj, registry);

    return exports.templateTemplate(data);

};

/**
 * Converts JSON Schema Model to MediaWiki Template Data Object
 * http://www.mediawiki.org/wiki/Extension:TemplateData
 *
 * @param obj
 *
 * @returns {string}    JSON String describing the TemplateData tag
 */
exports.generateTemplateData = function(obj) {

    var templateData = {};

    if (obj.description) {
        templateData.description = obj.description;
    }

    if (obj.properties) {

        templateData.params = {};

        for (var propertyName in obj.properties) {

            var property = obj.properties[propertyName];
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

            if (obj.required && obj.required.indexOf(propertyName) > -1) {
                param.required = true;
            }

            // If an * (astericks) is given, require all fields of the model
            if (obj.required && obj.required.indexOf('*') > -1) {
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
