//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var tv4          = require('tv4');
var Promise      = require('bluebird');

var moboSchema   = require('./../moboSchema');
var semlog     = require('semlog');
var log        = semlog.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Validates the mobo registry against the mobo JSON Schema
 *
 * @param {object}  registry mobo registry
 *
 * @returns {{}}
 */
exports.validateRegistry = function(registry) {
    'use strict';

    return new Promise(function(resolve) {

        var registryTypes = ['field', 'model', 'form'];

        // Iterate registry types
        for (var i = 0; i < registryTypes.length; i++) {
            var type = registryTypes[i];
            var elements = registry[type];

            // Iterate each element of a type and validate it
            for (var elName in elements) {
                exports.validate(elements[elName], moboSchema[type + 'Schema'], type + '/' + elName);
            }
        }

        resolve(registry);
    });

};


/**
 * Validates the expanded mobo registry
 * Checks hard requirements and interdependencies
 *
 * @param {object}  registry mobo registry
 *
 * @returns {{}}
 */
exports.validateExpandedRegistry = function(registry) {
    'use strict';

    return new Promise(function(resolve) {

        var registryTypes = ['expandedField', 'expandedModel', 'expandedForm'];

        // Iterate registry types
        for (var i = 0; i < registryTypes.length; i++) {
            var type = registryTypes[i];
            var elements = registry[type];

            // Iterate each element of a type and validate it
            for (var elName in elements) {
                var obj = elements[elName];
                var id = obj.$path || obj.id || elName || '(unknown)';

                //////////////////////////////////////////
                // General Validation                   //
                //////////////////////////////////////////

                // Must have a title attribute
                if (!obj.title) {
                    log('[E] [JSON Structure] ' + id + '" has no title attribute!');
                }

                // Must have a type attribute
                if (!obj.type) {
                    log('[E] [JSON Structure] ' + id + '" has no type attribute!');
                }


                if (obj.type === 'array' && !obj.items) {
                    log('[E] If the type is "array", "items" must be set. > ' + obj.$path || obj.id);
                }

                if (obj.properties && obj.items) {
                    log('[E] An object cannot have both "properties" and "items"!');
                }

                // Checks if the object is actually used. Skip forms, since they are the entry points
                // -> Tree Shaking (or Forest Shaking to be more precise :) )
                if (type !== 'expandedForm' && !obj.$referenceCounter) {
                    log('[W] ' + id + ' is never used.');
                }


                //////////////////////////////////////////
                // Field specific Validation            //
                //////////////////////////////////////////

                if (type === 'expandedField') {

                    if (obj.default && obj.enum && obj.enum.indexOf(obj.default) < 0) {
                        log('[E] The default value "' + obj.default + '" is not part of the enum. > ' + obj.$path || obj.id);
                    }

                    if (obj.form && obj.format && obj.format !== 'Page') {
                        log ('[W] If a field defines "form", the format must be "page" (or omited)');
                    }

                    if (obj.sf_form && obj.sf_form['input type'] &&  obj.sf_form['input type'] === 'tokens' && !obj.items) {
                        log('[E] The tokens widget only makes sense with "type": "array". > ' + obj.$path || obj.id);
                    }
                }

                //////////////////////////////////////////
                // Model specific Validation            //
                //////////////////////////////////////////

                if (type === 'expandedModel') {

                    // If an requirement array is provided, check that all required properties do actually exist
                    if (obj.required) {
                        for (var j = 0; j < obj.required.length; j++) {
                            var requirement = obj.required[j];
                            if (!obj.properties[requirement] && requirement !== '*') {
                                log('[W] ' + id + ' requires non-existent property "' + obj.required[j] + '"!');
                            }
                        }
                    }

                    // If an recommended array is provided, check that all required properties do actually exist
                    if (obj.recommended) {
                        for (var k = 0; k < obj.recommended.length; k++) {
                            var recommended = obj.recommended[k];
                            if (!obj.properties[recommended]) {
                                log('[W] ' + id + ' recommends non-existent property "' + obj.recommended[k] + '"!');
                            }
                        }
                    }

                    if (obj.smw_subobjectExtend && !obj.smw_subobject) {
                        log ('[W] Property "smw_subobjectExtend" is applied on a model that defines no subobjects!');
                    }
                }

            }
        }

        resolve(registry);
    });

};


/**
 * Validates a settings object against mobos settings schema
 *
 * @param {object} settings
 *
 * @returns {Object} validation result
 */
exports.validateSettings = function(settings) {
    'use strict';
    return exports.validate(settings, moboSchema.settingsSchema, 'settings.json');
};

/**
 * Wrapper around a JSON Schema Validator, uses tv4
 * Uses promise pattern and mobo style error / warning messages
 *
 * @see https://www.npmjs.com/package/tv4)
 *
 * @param {object}  json
 * @param {object}  schema
 * @param {string}  name    only for error debugging
 *
 * @returns {object} result object
 */
exports.validate = function(json, schema, name) {
    'use strict';

    var id = json.$path || json.id || name || '(unknown)';

    // Validate with the tv4 JSON Schema Validator Library
    // Use multiple option to catch and report multiple errors in one json object
    var result = tv4.validateMultiple(json, schema);

    if (!result.valid || result.errors.length > 0) {
        for (var i = 0; i < result.errors.length; i++) {

            var error = result.errors[i];

            if (error.schemaPath === '/additionalProperties') {
                // Unsupported additional Properties throw only a warning
                log('[W] [JSON Structure] ' + id + ': Unsupported property ' + error.dataPath);
                semlog.debug(json);
            } else {
                log('[E] [JSON Structure] ' + id + ': ' + error.message);
                log({
                    message: error.message,
                    dataPath: error.dataPath,
                    schemaPath: error.schemaPath,
                    params: error.params
                });
            }
        }
    }

    return result;
};
