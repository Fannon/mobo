//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');
var handlebars = require('handlebars');


//////////////////////////////////////////
// Logic                                //
//////////////////////////////////////////

var propertyTemplate, generateProperty, analyzeType;

/**
 * Execute the parsing of the fields
 * Will generate SMW Attribute sites
 *
 * @param settings
 * @param json
 * @param name
 *
 * @returns {*}
 */
exports.exec = function(settings, json, name) {

    'use strict';

    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var returnObj = {
        property: {}
    };

    var propertyTemplateFile = fs.readFileSync(settings.templateDir + 'property.wikitext').toString();
    propertyTemplate = handlebars.compile(propertyTemplateFile);

    returnObj.property[name] = analyzeType(json);

    return returnObj;
};


generateProperty = function(json, type) {

    var data = {
        type: type,
        id: json.id,
        json: JSON.stringify(json, false, 4)
    };

    if (json.description) {
        data.description = json.description;
    }

    if (type === 'Page') {

        var model = json.format || json.items.format;

        if (model) {
            var modelName = model.replace('/form/', '');
            modelName = modelName.replace('.json', '');
            model = modelName;
            data.model = model;
        } else {
            // oneOf, anyOf ??
        }
    }

    return propertyTemplate(data);
};

analyzeType = function(json) {

    var wikitext = {};

    if (json.format && json.format.charAt(0) === '/') {
        wikitext = generateProperty(json, 'Page');

    } else if (json.format && json.format === ('date' || 'date-time')) {
        wikitext = generateProperty(json, 'Date');

    } else if (json.type === 'string' && json.format === 'URL') {
        wikitext = generateProperty(json, 'Date');

    } else if (json.type === 'string' && json.format === 'tel') {
        wikitext = generateProperty(json, 'Telephone number');

    } else if (json.format === 'ipv4' || (json.items && json.items.format === 'ipv4')) {
        wikitext = generateProperty(json, 'Text');

    } else if (json.type === 'string' && json.format === 'email') {
        wikitext = generateProperty(json, 'Email');

    } else if (json.type === 'number') {
        wikitext = generateProperty(json, 'Number');

    } else if (json.type === 'array') {
        wikitext = generateProperty(json, 'Page');

    } else if (json.type === 'boolean') {
        wikitext = generateProperty(json, 'Boolean');

    } else if (json.type === 'string') {
        wikitext = generateProperty(json, 'Text');

    }

    return wikitext;

};
