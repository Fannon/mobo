//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _          = require('lodash');

var semlog     = require('semlog');
var log        = semlog.log;

var moboUtil   = require('./../util/moboUtil');


//////////////////////////////////////////
// Main                                 //
//////////////////////////////////////////

exports.exec = function(registry) {

    var todo = ['field', 'model', 'form'];

    for (var i = 0; i < todo.length; i++) {

        var modelPartName = todo[i];
        var modelPart = registry[modelPartName];

        for (var key in modelPart) {

            var obj = registry[modelPartName][key];

            // Remove nulls from YAML
            exports.removeNulls(obj);

            // Upgrade old, deprecated property names to the newest standard
            exports.upgradeChangedProperties(obj);

            // Add missing type
            if (!obj.type) {
                exports.addMissingType(obj);
            }

            // Convert all property arrays to property objects
            if (obj.properties && Array.isArray(obj.properties)) {
                obj.properties = exports.convertPropertyArray(obj.properties, obj.id);
            }
        }
    }

    return registry;
};


//////////////////////////////////////////
// Functions                            //
//////////////////////////////////////////

/**
 * This helper function removes/adjusts properties that have a value of null. They may be introduced by YAML
 *
 * @param obj
 * @returns {*}
 */
exports.removeNulls = function(obj) {

    // Remove nulls from YAML
    if (obj.properties === null) {
        obj.properties = {};
    } else if (obj.items === null) {
        obj.properties = [];
    }

    for (var key in obj) {
        if (obj[key] === null) {
            delete obj[key];
        }
    }
    return obj;
};

/**
 * Upgrade old, deprecated property names to the newest standard
 *
 * @param obj
 */
exports.upgradeChangedProperties = function(obj) {

    var messages = {}; // A message Set, that contains each message only once, the value beeing the counter
    var renamed = [
        // 2015.05.15 mobo v1.4.2
        ['smw_output', 'smw_overwriteOutput'],
        ['smw_outputLink', 'smw_overwriteOutputToLink']
    ];

    for (var key in obj) {

        // Rename properties
        for (var i = 0; i < renamed.length; i++) {
            var rename = renamed[i];
            var msg = '';

            if (key === rename[0]) {
                // http://stackoverflow.com/a/14592469
                Object.defineProperty(obj, rename[1], Object.getOwnPropertyDescriptor(obj, rename[0]));
                delete obj[rename[0]];
                msg = '[i] Renaming deprecated properties "' + rename[0] + '" to "' + rename[1] + '"';

                if (!messages[msg]) {
                    messages[msg] = 1;
                } else {
                    messages[msg] += 1;
                }
                if (exports.settings.verbose) {
                    log('[D] ' + obj.$path + ' > Renaming deprecated property "' + rename[0] + '" to "' + rename[1] + '"');
                }
            }
        }
    }

    for (var msgText in messages) {
        log(msgText + ' (' + messages[msgText] + ')');
    }

};


/**
 * If the "type" attribute is missing and there is a "properties" attribute
 * add the missing type depending on the property type
 *
 * @param {object} obj
 * @returns {object}
 */
exports.addMissingType = function(obj) {

    'use strict';

    // If the object has a properties array or object, set the type to object
    // If it's an array, it will be converted to an object later.
    if (obj.properties) {
        obj.type = 'object';
    } else if (obj.items) {
        obj.type = 'array';
    }

    return obj;
};


/**
 * Helper function that will convert an property array to a property object/map (including keys)
 * JSON Schema does support only property objects, but in case of mobo they include redundant information
 * since the property key is almost always auto-genrated from the filename.
 *
 * This conversion ensures that JSON Schema compatibility is ensured while providing the more concise array notation
 *
 * @param   {array}     properties    Property array notation
 * @param   {string}    objId         id / name of the "mother" object
 *
 * @returns {object}                  Property object notation
 */
exports.convertPropertyArray = function(properties, objId) {

    'use strict';

    var propertyObject = {};

    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        var id = objId + '-i' + i; // Hack to fix: http://stackoverflow.com/a/3186907/776425

        var $extend = prop.$extend || false;
        if (prop.items && prop.items.$extend) {
            $extend = prop.items.$extend;
        }

        if (prop.id) {
            // If an ID is given, use this as key
            id = prop.id;
        } else if ($extend) {
            // If a $extend is given, do a lookup for the id in the resolve object
            var ref = moboUtil.resolveReference($extend, prop.$filepath);
            id = ref.id;
        }

        propertyObject[id] = prop;
    }

    return propertyObject;
};
