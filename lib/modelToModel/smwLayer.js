var semlog     = require('semlog');
var log        = semlog.log;

/** TODO: Move all domain specific to implementation specific transformations here */

exports.exec = function(settings, registry) {

    exports.settings = settings;
    exports.registry = registry;

    var todo = ['expandedField', 'expandedModel', 'expandedForm'];

    for (var i = 0; i < todo.length; i++) {

        var modelPartName = todo[i];
        var modelPart = registry[modelPartName];

        for (var name in modelPart) {

            var obj = registry[modelPartName][name];

            //////////////////////////////////////////
            // Fields                               //
            //////////////////////////////////////////

            if (modelPartName === 'expandedField' && !obj.smw_type) {
                obj.smw_type = exports.analyzeType(obj);
            }
        }
    }

    return registry;
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
