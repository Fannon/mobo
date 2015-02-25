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
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 *
 * @returns {object}    generated wikipages
 */
exports.exec = function(settings, obj, name) {

    'use strict';

    // Inject the current settings into the template engine
    handlebars.setMoboSettings(settings);

    // Do not create abstract or ignored fields
    if (obj.abstract || obj.ignore) {
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
    var type = exports.analyzeType(obj);

    // Generate the SMW property wikitext
    var propertyWikitext = exports.generateProperty(obj, type);


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
 * @param {{}}      obj  Field in JSON format
 * @param {String}  type  SMW datatype
 *
 * @returns {String}    Wikitext of the property
 */
exports.generateProperty = function(obj, type) {

    "use strict";

    var data = {
        type: type,
        id: obj.id,
        json: JSON.stringify(obj, false, 4),
        usesForms: []
    };

    if (obj.description) {
        data.description = obj.description;
    }

    if (type === 'Page') {

        /** Property uses the "oneOf" notation to link to multiple possible forms / formats */
        var oneOf = false;


        var model = obj.format || false;

        if (obj.items && obj.items.format) {
            model = obj.items.format;
        } else if (obj.oneOf && obj.oneOf[0]) {
            oneOf = obj.oneOf;
        } else if (obj.items && obj.items.oneOf && obj.items.oneOf[0]) {
            oneOf = obj.items.oneOf;
        }

        // If oneOf is used, the property could use/link to many different forms
        if (oneOf) {

            for (var i = 0; i < oneOf.length; i++) {
                if (oneOf[i] && oneOf[i].format) {
                    data.usesForms.push(moboUtil.resolveReference(oneOf[i].format, obj.$filepath).id);
                }
            }

            // Make only the first form as the default form.
            // mobo uses the formredlink function anyway, which provides support for alternative forms
            //data.usesForms.push(moboUtil.resolveReference(oneOf[0].format, json.$filepath).id);

        } else if (model) {
            data.usesForms.push(moboUtil.resolveReference(model, obj.$filepath).id);
        } else {
            log(' [E] Field without format attribute: ' + obj.$filepath);
        }
    }

    return exports.propertyTemplate(data);
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
 * @param {{}} obj  field object
 *
 * @returns {string}    SMW DataType
 */
exports.analyzeType = function(obj) {

    "use strict";

    // Analyze the attribute type.
    var analyze = obj;

    // If it is an array, analyze one step deeper
    if (obj.items) {
        analyze = obj.items;

        // If it includes "oneOf" or "anyOf"
        if (obj.items.oneOf) {
            analyze = obj.items.oneOf[0];
        } else if (obj.items.anyOf) {
            analyze = obj.items.anyOf[0];
        }
    } else {

        // If it includes "oneOf" or "anyOf"
        if (obj.oneOf) {
            analyze = obj.oneOf[0];
        } else if (obj.anyOf) {
            analyze = obj.anyOf[0];
        }
    }


    var type = 'string';
    var format = false;

    // Lowercase the attribute to analyze to make them case-insensitive
    if (analyze.type) {
        type = analyze.type.toLowerCase();
    } else {
        log(' [W] Field ' + obj.id + ' has no "type" attribute');
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

    log(' [i] Field ' + obj.id + ' has no recognized datatype.');

    // FALLBACK: If nothing fits, return the 'Text' datatype
    return 'Text';

};
