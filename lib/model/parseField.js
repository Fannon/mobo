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

var propertyTemplateFile;
var propertyTemplate;


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
    if (!propertyTemplateFile) {
        propertyTemplateFile = fs.readFileSync(settings.templateDir + 'property.wikitext').toString();
        propertyTemplate = handlebars.compile(propertyTemplateFile);
    }


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Analyze the data type
    var type = exports.analyzeType(json);

    // Generate the SMW property wikitext
    returnObj.property[name] = exports.generateProperty(json, type);

    return returnObj;
};


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Takes the json and the calculated datatype and creates the SMW property through a template
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
    // If it is an array, analyze one step deeper
    var analyze = json;
    if (json.items) {
        analyze = json.items;
    }

    //////////////////////////////////////////
    // PRIMITIVE DATATYPES                  //
    //////////////////////////////////////////

    if (!analyze.format) {

        // NUMBER
        if (analyze.type === 'number' && analyze.type === 'integer') {
            return 'Number';

        // BOOLEAN
        } else if (analyze.type === 'boolean') {
            return 'Boolean';

        // TEXT (FALLBACK)
        } else {
            return 'Text';
        }


    //////////////////////////////////////////
    // "SEMANTIC" DATATYPES                 //
    //////////////////////////////////////////

    } else {

        // PAGE (Links to other wiki pages)
        if (analyze.format.charAt(0) === '/') {
            return 'Page';

        // DATE
        } else if (analyze.format === ('date' || 'date-time')) {
            return 'Date';

        // URL
        } else if (analyze.format === 'URL' || analyze.format === 'url') {
            return 'URL';

        // EMAIL
        } else if (json.format === 'email') {
            return 'Email';

        // TELEPHONE NUMBER
        } else if (analyze.format === 'tel') {
            return 'Telephone number';


        //////////////////////////////////////////
        // SMW only datatypes                   //
        //////////////////////////////////////////

        // SMW CODE
        } else if (analyze.format === 'Code') {
            return 'Code';

        // SMW Geographic coordinate
        } else if (analyze.format === 'Geographic coordinate') {
            return 'Geographic coordinate';

        // SMW Quantity
        } else if (analyze.format === 'Quantity') {
            return 'Quantity';

        // SMW Record
        } else if (analyze.format === 'Record') {
            return 'Record';

        // SMW Temperature
        } else if (analyze.format === 'Temperature') {
            return 'Temperature';
        }
    }

    log('> [NOTICE] Field ' + json.id + ' has no recognized datatype.');

    // FALLBACK: If nothing fits, return the 'Text' datatype
    return 'Text';

};
