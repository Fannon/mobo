//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _          = require('lodash');
var Promise    = require('bluebird');

var semlog     = require('semlog');
var log        = semlog.log;

var moboUtil   = require('./../util/moboUtil');

/**
 * Existence index array; used for detecting circular references
 * Contains all objects that were already extended.
 *
 * @type {{}}
 */
exports.existenceIndex = {};

/**
 * Stores the JSON model into an internal registry object.
 * Additionally a "deep" registry is built that has all inheritances resolved
 *
 * @param {object}      settings
 * @param {object}      registry
 *
 * @returns {object}    Promise object
 */
exports.exec = function(settings, registry) {
    'use strict';

    return new Promise(function(resolve) {


        //////////////////////////////////////////
        // Fields                               //
        //////////////////////////////////////////

        exports.preProcessing(registry.field);
        /** Expanded fields, with applied inheritance */
        registry.expandedField = exports.expandRegistry(registry, 'field');
        exports.postProcessing(registry.expandedField);


        //////////////////////////////////////////
        // Models                               //
        //////////////////////////////////////////

        exports.preProcessing(registry.model);
        /** Expanded models, with applied inheritance */
        registry.expandedModel = exports.expandRegistry(registry, 'model');
        exports.postProcessing(registry.expandedModel);


        //////////////////////////////////////////
        // Forms                                //
        //////////////////////////////////////////


        exports.preProcessing(registry.form);
        /** Expanded forms, with applied inheritance */
        registry.expandedForm = exports.expandRegistry(registry, 'form');
        exports.postProcessing(registry.expandedForm);

        resolve(registry);
    });

};

/**
 * Expands fields, models and forms.
 * Goes through all items and applied inheritance to them
 *
 * @param registry
 * @param type
 * @returns {*}
 */
exports.expandRegistry = function(registry, type) {
    'use strict';

    var expandedName = 'expanded' + type.charAt(0).toUpperCase() + type.slice(1);

    // Make deep clone of models
    registry[expandedName] = _.cloneDeep(registry[type]);

    // Resolve all objects in the Deep Registry
    for (var name in registry[expandedName]) {
        exports.existenceIndex = {}; // Empty existence index
        exports.inheritanceStack = []; // Empty inheritance stack
        exports.inherit(registry[expandedName][name], registry);
    }

    return registry[expandedName];
};

/**
 * Recursive Function that looks for `$extend` properties and resolves them
 *
 * @param obj
 * @param registry
 */
exports.inherit = function(obj, registry) {
    'use strict';

    if (obj.$extend) {

        var refArray = [];

        if (Array.isArray(obj.$extend)) {
            refArray = obj.$extend;
        } else {
            refArray.push(obj.$extend);
        }

        for (var i = 0; i < refArray.length; i++) {
            obj = exports.extend(obj, refArray[i], registry);
        }
    }

    // Merge Fields into Models
    if (obj.properties) {
        for (var attrName in obj.properties) {
            exports.inherit(obj.properties[attrName], registry);
        }
    }

    // Special Case: Handle Array Items
    if (obj.items) {
        exports.inherit(obj.items, registry);
    }

    // If Object has a propertyOrder array, order the properties accordingly
    if (obj.properties && obj.propertyOrder) {
        obj = exports.orderObjectProperties(obj);
    }

    return obj;

};

/**
 * Merges fetched content of $extend tag with own content
 * Helper Function
 *
 * @param obj
 * @param $extend
 * @param registry
 */
exports.extend = function(obj, $extend, registry) {
    'use strict';

    var ref = $extend || obj.$extend || false;

    // Push current object to inheritanceStack
    // This is only used for better error reporting
    if (obj.$filepath) {
        exports.inheritanceStack.push({
            $path: obj.$path,
            $filepath: obj.$filepath
        });
    }

    if (ref) {

        obj.$reference = moboUtil.resolveReference(ref);

        // If $reference could not be resolved (is malformed), skip extending this object
        if (!obj.$reference) {
            return obj;
        }

        var type = obj.$reference.type;
        var originalType = type;
        var fileName = obj.$reference.filename;
        var name = obj.$reference.id;

        // Check if this was already extended.
        if (exports.existenceIndex[originalType + '/' + name] > 3) {
            log('[E] Circular reference in the model! ' + type + '/' + name + ' references:');
            log('[i] Current existence index:');
            log(exports.existenceIndex);
            log('[i] Current inheritance stack:');
            log(exports.inheritanceStack);
            return obj;
        }

        // Point to expanded registry, if a field, model or form
        if (type === 'model') {
            type = 'expandedModel';
        } else if (type === 'field') {
            type = 'expandedField';
        } else if (type === 'form') {
            type = 'expandedForm';
        }

        var reference = registry[type][name];

        if (!reference) {
            // Use the $path of the current object.
            // If it has none, look for the last object in the inheritanceStack and use it instead.
            var path = '(unknown)';
            if (obj.$path) {
                path = obj.$path;
            } else if (exports.inheritanceStack.length > 0) {
                path = exports.inheritanceStack[exports.inheritanceStack.length - 1].$path;
            }
            log('[E] ' + path + ': invalid $extend to missing "' + obj.$extend + '"!');
            log(exports.inheritanceStack);
        }

        // If referenced object has an unresolved $extend, extend it first
        if (reference && reference.$extend) {

            // If this object is to be extended, add it's existence to the existence index
            if (exports.existenceIndex[originalType + '/' + name]) {
                exports.existenceIndex[originalType + '/' + name] += 1;
            } else {
                exports.existenceIndex[originalType + '/' + name] = 1;
            }

            // If it had not been extended yet, extend it first  => Recursion!
            exports.extend(reference, reference.$extend, registry);

        }

        // If the reference is a template, include it as a "template" property
        if (type === 'smw_template') {
            obj.id = name.replace('.wikitext', '');
            obj.type = 'string';
            obj.template = registry.smw_template[fileName];

        } else {

            // Otherwise, do object oriented inheritance:
            var mergeObject = _.cloneDeep(reference);
            _.merge(mergeObject, obj);
            _.merge(obj, mergeObject);
        }

        // Statistics
        if (reference && typeof reference === 'object') {
            if (reference.$referenceCounter) {
                reference.$referenceCounter += 1;
            } else {
                reference.$referenceCounter = 1;
            }
        }

        // Cleanup
        if (obj.$extend) { delete obj.$extend; }
        if (obj.$schema) { delete obj.$schema; }

    }

    return obj;
};


/**
 * Does some pre-processing after the project is completely read into the registry.
 *
 * @param {{}} modelPart
 *
 * @returns {{}}
 */
exports.preProcessing = function(modelPart) {

    'use strict';

    for (var key in modelPart) {

        var obj = modelPart[key];

        // Remove nulls from YAML
        exports.removeNulls(obj);

        // Add missing type
        if (!obj.type) {
            exports.addMissingType(obj);
        }

        // Convert all property arrays to property objects
        if (obj.properties && Array.isArray(obj.properties)) {
            obj.properties = exports.convertPropertyArray(obj.properties, obj.id);
        }
    }

    return modelPart;
};

exports.postProcessing = function(modelPart) {
    'use strict';

    for (var key in modelPart) {

        var obj = modelPart[key];

        // Remove inherited properties (use this with care!)
        if (obj.$remove && Array.isArray(obj.$remove)) {
            if (obj.properties) {
                for (var k = 0; k < obj.$remove.length; k++) {
                    if (obj.properties[obj.$remove[k]]) {
                        delete obj.properties[obj.$remove[k]];
                    } else {
                        log('[W] Cannot remove non existent property "' + obj.$remove[k] + '"');
                    }
                }
            }
            // TODO: Idea: Support to remove items from "items" ? (according to ID, index?)
        }
    }

    return modelPart;

};

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


/**
 * Orders Model Properties by propertyOrder Array
 *
 * Properties which aren't given in the array are positioned at the bottom
 *
 * @param obj
 */
exports.orderObjectProperties = function(obj) {
    'use strict';

    if (obj.properties) {

        if (obj.properties && obj.propertyOrder) {

            var newOrder = {};

            for (var i = 0; i < obj.propertyOrder.length; i++) {
                var propertyName = obj.propertyOrder[i];
                if (obj.properties[propertyName]) {
                    newOrder[propertyName] = obj.properties[propertyName];
                } else {
                    var id = obj.$path || obj.id || '(unknown)';
                    log('[W] ' + id + ' has non existent property "' + propertyName + '" in the propertyOrder array!');
                }
            }

            _.merge(newOrder, obj.properties);

            obj.properties = newOrder;
        }
    }

    return obj;

};
