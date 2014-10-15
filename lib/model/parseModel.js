//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs = require('fs');
var handlebars = require('./../handlebarsExtended');


//////////////////////////////////////////
// Logic                                //
//////////////////////////////////////////

var categoryTemplate, templateTemplate, generateTemplate, getTemplateData;

/**
 * Executes the parsing of the models
 * Will generate SMW Category and Template Sites
 *
 * @param settings
 * @param json
 * @param name
 * @param registry
 * @returns {{}}
 */
exports.exec = function (settings, json, name, registry) {

    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var categoryTemplateFile = fs.readFileSync(settings.templateDir + 'category.wikitext').toString();
    categoryTemplate = handlebars.compile(categoryTemplateFile);

    var templateTemplateFile = fs.readFileSync(settings.templateDir + 'template.wikitext').toString();
    templateTemplate = handlebars.compile(templateTemplateFile);

    var returnObject = {
        category: {},
        template: {}
    };

    // Generate Category
    var category = exports.generateCategory(json, name, registry, settings);
    if (category) {
        returnObject.category[name] = category;
    }

    // Generate Template
    var template = generateTemplate(json, name, registry);
    if (template) {
        returnObject.template[name] = template;
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

    var title = '';
    var form = false;
    var formCategory = false;

    if (json.title) {
        title = json.title;
    } else {
        title = name;
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

//    if (registry.form[json.id] && !registry.form[json.id].formEdit && registry.form[json.id].formEdit !== false) {
//        form = true;
//    }

    var data = {
        name: name,
        title: title,
        form: form,
        formCategory: formCategory,
        template: true,
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
 * @param json
 * @param name
 * @returns {*}
 */
generateTemplate = function(json, name, registry) {


    if (!json.abstract) {

        var title = '';
        var arraymap = false;
        var category = name;
        var attr = json.properties;

        if (json.title) {
            title = json.title;
        } else {
            title = name;
        }

        // Check if property has to be implemented as arraymap
        for (var propertyName in attr) {
            if (registry.field[propertyName] && registry.field[propertyName].items) {
                attr[propertyName].smw_arraymap = true;
            }
        }

        if (json.smw_category === false || (json.smw_subobject && (json.smw_category !== true))) {
            category = false;
        }

        var data = {
            title: title,
            name: name,
            templatedata: getTemplateData(json),
            attr: json.properties,
            category: category,
            categories: json.smw_categories || false,
            smw_subobject: json.smw_subobject || false,
            arraymap: arraymap
        };

        if (json.description) {
            data.description = json.description;
        }

        return templateTemplate(data);

    } else {
        return false;
    }

};

/**
 * Converts JSON Schema Model to MediaWiki Template Data Object
 * http://www.mediawiki.org/wiki/Extension:TemplateData
 *
 * @param model
 * @returns {string}    JSON String
 */
getTemplateData = function(model) {

    var templateData = {};

    if (model.description) {
        templateData.description = model.description;
    }

    if (model.properties) {

        templateData.params = {};

        for (var propertyName in model.properties) {

            var property = model.properties[propertyName];

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

            templateData.params[propertyName] = param;
        }
    }

    return JSON.stringify(templateData, false, 4);
};
