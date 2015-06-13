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

    exports.categoryTemplate = moboUtil.loadTemplate(exports, 'category.wikitext', settings);
    exports.templateTemplate = moboUtil.loadTemplate(exports, 'template.wikitext', settings);


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Generate Category
    var categoryWikitext = exports.generateCategory(settings, obj, name, registry);
    if (categoryWikitext) {
        // Remove leading underscores
        while (name.charAt(0) === '_') {
            name = name.substr(1);
        }
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

    // If this model is abstract, create a category for it
    // No template will be generated, so don't link for one
    // Removes all leading _ if they are used for indicating an abstract model
    if (obj.abstract) {
        while (name.charAt(0) === '_') {
            name = name.substr(1);
        }
        template = false;
        formCategory = false;
    }


    var data = {
        name: name,
        title: title,
        form: form,
        formCategory: formCategory,
        template: template,
        overview: true,
        attr: obj.properties,

        modelObj: obj,
        settingsObj: settings
    };

    if (obj.description) {
        data.description = obj.description;
    }

    if (obj.smw_prefixCategory) {
        data.prefix = obj.smw_prefixCategory;
    }

    if (obj.smw_postfixCategory) {
        data.prefix = obj.smw_postfixCategory;
    }

    if (settings.smw_semanticDrilldown) {
        data.drilldowninfo = exports.drilldownInfo(obj, registry);
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
    'use strict';

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
        arraymap: false,

        modelObj: obj,
        settingsObj: settings
    };

    /** Adding Prefixes */
    data.prefix = moboUtil.prePostFix('smw_prefix', obj, registry);
    data.prefix += moboUtil.prePostFix('smw_prefixPage', obj, registry);

    /** Adding Postfixes */
    data.postfix = moboUtil.prePostFix('smw_postfix', obj, registry);
    data.postfix += moboUtil.prePostFix('smw_postfixPage', obj, registry);

    data.attr = obj.properties;

    // Check if property has to be implemented as arraymap
    for (var propertyName in data.attr) {
        var attr = data.attr[propertyName];
        if (registry.expandedField[propertyName] && registry.expandedField[propertyName].items) {
            attr.smw_arraymap = true;
        }

        if (attr.smw_forceSet) {
            var value = attr.smw_overwriteData || attr.smw_overwriteOutput || '{{{' + attr.id + '|}}}';
            var setProperty = ' [[' + attr.id + '::' + value + '| ]]';

            if (!data.postfix) {
                data.postfix = setProperty;
            } else {
                data.postfix += setProperty;
            }
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
    'use strict';

    var templateData = {};

    if (obj.description) {
        templateData.description = obj.description;
    }

    if (obj.properties) {

        templateData.params = {};

        for (var propertyName in obj.properties) {
            if (obj.properties.hasOwnProperty(propertyName)) {

                var property = obj.properties[propertyName];
                var id = property.id;

                var param = {};

                param.type = 'unknown'; // Default Type
                param.suggested = true;

                if (property.title) {
                    param.label = property.title;
                }

                if (property.description) {
                    param.description = property.description;
                } else {
                    param.description = '';
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
                    param.description += '(SMW SubObject)';
                }

                if (property.default) {
                    // BUGFIX: If the default is a number, it will crash the wiki upload
                    // Always convert it to a string to avoid this.
                    param.default = '' + property.default;
                }

                templateData.params[id] = param;
            }
        }
    }

    return JSON.stringify(templateData, false, 4);
};

/**
 * Createas a #drilldowninfo parser function that adds all fields that set "smw_drilldown": true
 * If the Model has a form with the same ID, all fields of the form will be considered
 *
 * @param obj
 * @param registry
 * @returns {*}
 */
exports.drilldownInfo = function(obj, registry) {

    var drilldowninfo = [];
    var fieldName;
    var field;

    if (registry.expandedForm[obj.id]) {

        // If the model has a form with the identical ID, use all fields available in the whole form

        if (registry.expandedForm[obj.id].properties) {
            for (var modelName in registry.expandedForm[obj.id].properties) {
                var model = registry.expandedForm[obj.id].properties[modelName];
                if (model.properties) {
                    for (fieldName in model.properties) {
                        field = model.properties[fieldName];
                        if (field.smw_drilldown) {
                            drilldowninfo.push({
                                name: field.title,
                                id: field.id.charAt(0).toUpperCase() + field.id.slice(1) // Capitalize first letter (sic!)
                            });
                        }
                    }
                }
            }
        }

    } else {

        // Else, use only those properties the model has by itself

        if (obj.properties) {
            for (fieldName in obj.properties) {
                field = obj.properties[fieldName];
                if (field.smw_drilldown) {
                    drilldowninfo.push({
                        name: field.title,
                        id: field.id.charAt(0).toUpperCase() + field.id.slice(1) // Capitalize first letter (sic!)
                    });
                }
            }
        }
    }

    // Build #drilldowninfo parser function string
    var drilldowninfoFunction = '{{#drilldowninfo:filters=';

    for (var i = 0; i < drilldowninfo.length; i++) {
        var item = drilldowninfo[i];
        var name = item.name;
        name = name.split('(').join('');
        name = name.split(')').join('');
        name = name.split('{').join('');
        name = name.split('}').join('');
        name = name.split('|').join('');
        drilldowninfoFunction += name + ' (property=' + item.id;
        if (item.category) {
            drilldowninfoFunction += ', category=' + item.category;
        }
        drilldowninfoFunction += '), ';
    }

    drilldowninfoFunction = drilldowninfoFunction.substring(0, drilldowninfoFunction.length - 2);
    drilldowninfoFunction += '}} __SHOWINDRILLDOWN__';

    if (drilldowninfo.length > 0) {
        return drilldowninfoFunction;
    } else {
        return false;
    }

};
