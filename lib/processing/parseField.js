//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var handlebars = require('./../util/handlebarsExtended');
var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

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

    // Inject the current settings into the template engine
    handlebars.setMoboSettings(settings);

    // Do not create abstract or ignored fields
    if (json.abstract || json.ignore) {
        return {};
    }

    //////////////////////////////////////////
    // Inner Variables                      //
    //////////////////////////////////////////

    /** Return Object, matching the data structure of the registry */
    var returnObj = {
        property: {}
    };


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    // If the templates are not loaded already, do so:
    if (!exports.propertyTemplateFile) {
        var propertyTemplateFile = fs.readFileSync(settings.templateDir + 'property.wikitext').toString();
        exports.propertyTemplate = handlebars.compile(propertyTemplateFile);
    }


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Analyze the data type
    var type = exports.analyzeType(json);

    // Generate the SMW property wikitext
    var propertyWikitext = exports.generateProperty(json, type);


    if (propertyWikitext) {
        returnObj.property[name] = propertyWikitext;
    }

    return returnObj;
};


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Takes the json and the calculated datatype and creates the SMW property through a template
 *
 * @todo: Do not use complete json as parameter but only the part that actually builds the property type
 * @todo: Currently there is no support for anyOf and allOf!
 *
 * @param {{}}      json  Field in JSON format
 * @param {String}  type  SMW datatype
 *
 * @returns {String}    Wikitext of the property
 */
exports.generateProperty = function(json, type) {

    "use strict";

    var data = {
        type: type,
        id: json.id,
        json: JSON.stringify(json, false, 4),
        usesForms: []
    };

    if (json.description) {
        data.description = json.description;
    }

    if (type === 'Page') {

        /** Property uses the "oneOf" notation to link to multiple possible forms / formats */
        var oneOf = false;


        var model = json.format || false;

        if (json.items && json.items.format) {
            model = json.items.format;
        } else if (json.oneOf && json.oneOf[0]) {
            oneOf = json.oneOf;
        } else if (json.items && json.items.oneOf && json.items.oneOf[0]) {
            oneOf = json.items.oneOf;
        }

        // If oneOf is used, the property could use/link to many different forms
        if (oneOf) {
            for (var i = 0; i < oneOf.length; i++) {
                if (oneOf[i] && oneOf[i].format) {
                    data.usesForms.push(exports.extractModelName(oneOf[i].format));
                }
            }
        } else if (model) {
            data.usesForms.push(exports.extractModelName(model));
        } else {
            log(' [E] Field without format attribute: ' + json.$filepath);
        }
    }

    return exports.propertyTemplate(data);
};

/**
 * Extracts the model name from the "format" URL
 * @param model
 * @returns {*}
 */
exports.extractModelName = function(model) {
    if (!model) {
        return false;
    } else {
        var modelName = model.replace('/form/', '');
        modelName = modelName.replace('.json', '');
        return modelName;
    }
};

/**
 * This function analyzes the JSON Schema Datatype and matches it with a SMW Datatype
 *
 * For SMW Datatypes see: https://semantic-mediawiki.org/wiki/Help:Properties_and_types#List_of_datatypes
 *
 * JSON Schema consists of a "type" attribute which defines the "raw/primitive" datatype used for storage
 * More detailed ("semantic") datatypes are defined through an additional "format" attribute.
 * @see http://spacetelescope.github.io/understanding-json-schema/reference/type.html
 * @see http://json-schema.org/latest/json-schema-validation.html#anchor104
 *
 * @param {{}} json  Field in JSON format
 *
 * @returns {string}    SMW DataType
 */
exports.analyzeType = function(json) {

    "use strict";

    // Analyze the attribute type.

    var analyze = json;

    // If it is an array, analyze one step deeper
    if (json.items) {
        analyze = json.items;

        // If it includes "oneOf" or "anyOf"
        if (json.items.oneOf) {
            analyze = json.items.oneOf[0];
        } else if (json.items.anyOf) {
            analyze = json.items.anyOf[0];
        }
    } else {

        // If it includes "oneOf" or "anyOf"
        if (json.oneOf) {
            analyze = json.oneOf[0];
        } else if (json.anyOf) {
            analyze = json.anyOf[0];
        }
    }


    var type = 'string';
    var format = false;

    // Lowercase the attribute to analyze to make them case-insensitive
    if (analyze.type) {
        type = analyze.type.toLowerCase();
    } else {
        log(' [W] Field ' + json.id + ' has no "type" attribute');
    }

    if (analyze.format) {
        format = analyze.format.toLowerCase();
    }


    //////////////////////////////////////////
    // PRIMITIVE DATATYPES                  //
    //////////////////////////////////////////

    if (!analyze.format) {

        // NUMBER
        if (type === ('number' || 'integer')) {
            return 'Number';

        // BOOLEAN
        } else if (type === 'boolean') {
            return 'Boolean';

        // TEXT (FALLBACK)
        } else {
            return 'Text';
        }


    //////////////////////////////////////////
    // "SEMANTIC" DATATYPES                 //
    //////////////////////////////////////////

    } else {

        if (format === ('date' || 'date-time')) {
            return 'Date';

        // URL
        } else if (format === 'url') {
            return 'URL';

        // EMAIL
        } else if (format === 'email') {
            return 'Email';

        // TELEPHONE NUMBER
        } else if (format === 'tel') {
            return 'Telephone number';


        //////////////////////////////////////////
        // SMW only datatypes                   //
        /////////////////////////////////////////

        // SMW PAGES
        } else if(format.charAt(0) === '/' || format === 'page') {
            return 'Page';

        // SMW CODE
        } else if (format === 'code') {
            return 'Code';

        // SMW Geographic coordinate
        } else if (format === 'geographic coordinate') {
            return 'Geographic coordinate';

        // SMW Quantity
        } else if (format === 'quantity') {
            return 'Quantity';

        // SMW Record
        } else if (format === 'record') {
            return 'Record';

        // SMW Temperature
        } else if (analyze.format === 'temperature') {
            return 'Temperature';
        }
    }

    log(' [i] Field ' + json.id + ' has no recognized datatype.');

    // FALLBACK: If nothing fits, return the 'Text' datatype
    return 'Text';

};
