//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _   = require('lodash');
var moboUtil   = require('./../util/moboUtil');
var semlog     = require('semlog');
var log        = semlog.log;


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

    exports.propertyTemplate = moboUtil.loadTemplate(exports, 'property.wikitext', settings);


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Analyze the data type
    var type = exports.analyzeType(obj);

    // Generate the SMW property wikitext
    var propertyWikitext = exports.generateProperty(settings, obj, type);

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
 * @param {{}}      settings
 * @param {{}}      obj  Field in JSON format
 * @param {String}  type  SMW datatype
 *
 * @returns {String}    Wikitext of the property
 */
exports.generateProperty = function(settings, obj, type) {
    'use strict';

    var inspect = obj.items || obj;

    var data = {
        type: type,
        id: obj.id,
        description: obj.description || false,
        usesForms: inspect.form || [],

        fieldObj: obj,
        settingsObj: settings
    };

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
 * @param   {object} obj    field object
 *
 * @returns {string}        SMW DataType
 */
exports.analyzeType = function(obj) {
    'use strict';

    // Analyze the attribute type.
    var inspect = obj.items || obj;

    var type = 'string';
    var format = false;

    // Lowercase the attribute to analyze to make them case-insensitive
    if (inspect.type) {
        type = inspect.type.toLowerCase();
    }

    if (inspect.format) {
        format = inspect.format.toLowerCase();
    }

    //////////////////////////////////////////
    // PAGE TYPE (Links to Form)            //
    //////////////////////////////////////////

    if (inspect.form) {
        return 'Page';
    }


    //////////////////////////////////////////
    // PRIMITIVE DATATYPES                  //
    //////////////////////////////////////////

    if (!inspect.format) {

        // TEXT
        if (type === 'string') {
            return 'Text';

        // NUMBER
        } else if (type === ('number' || 'integer')) {
            return 'Number';

        // BOOLEAN
        } else if (type === 'boolean') {
            return 'Boolean';

        // NO VALID TYPE: Fallback to text
        } else {
            log('[W] Invalid field type! Only string, number, integer or boolean are allowed. Falling back to Text');
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

        // SMW PAGE
        } else if (format === 'page') {
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
        } else if (inspect.format === 'temperature') {
            return 'Temperature';
        } else {
            log('[W] Unknown field format: "' + format + '". Falling back to Text');
            return 'Text';
        }
    }

};
