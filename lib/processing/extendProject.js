//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _          = require('lodash');
var Promise    = require('bluebird');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

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

    return new Promise(function (resolve) {

        //////////////////////////////////////////
        // EXPAND REGISTRY THROUGH INHERITANCE  //
        //////////////////////////////////////////

        /** Expanded fields, with applied inheritance */
        registry.expandedField = exports.expandRegistry(registry, 'field');

        /** Expanded models, with applied inheritance */
        registry.expandedModel = exports.expandRegistry(registry, 'model');

        /** Expanded forms, with applied inheritance */
        registry.expandedForm = exports.expandRegistry(registry, 'form');

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

    var expandedName = 'expanded' + type.charAt(0).toUpperCase() + type.slice(1);

    // Make deep clone of models
    registry[expandedName] = _.cloneDeep(registry[type]);

    // Resolve all objects in the Deep Registry
    for (var name in registry[expandedName]) {
        exports.existenceIndex = {}; // Empty existence index
        exports.inherit(registry[expandedName][name], registry);
    }

    return registry[expandedName];
};

/**
 * Recursive Function that looks for $extends and resolves them
 *
 * @param obj
 * @param registry
 */
exports.inherit = function(obj, registry) {

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

    var ref = $extend || obj.$extend || false;

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
        var id = obj.$filepath || obj.id || obj.$parent || '(Unknown)';

        // Check if this was already extended.
        if (exports.existenceIndex[originalType + '/' + name] > 3) {
            log(' [E] Circular reference in the model! ' + type + '/' + name + ' references:');
            log(exports.existenceIndex);
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

        if (!reference){
            log(' [E] ' + id + ': invalid $extend to missing "' + obj.$extend + '"!');
        } else {
            obj.$parent = originalType + '/' + name;
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
            obj.type = "string";
            obj.template = registry.smw_template[fileName];

        } else {

            // Otherwise, do object oriented inheritance:
            var mergeObject = _.cloneDeep(reference);
            _.merge(mergeObject, obj);
            _.merge(obj, mergeObject);
        }

        // Statistics
        if (reference) {
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
 * Orders Model Properties by propertyOrder Array
 *
 * Properties which aren't given in the array are positioned at the bottom
 *
 * @param obj
 */
exports.orderObjectProperties = function(obj) {

    if (obj.properties) {

        if (obj.properties && obj.propertyOrder) {

            var newOrder = {};

            for (var i = 0; i < obj.propertyOrder.length; i++) {
                var propertyName = obj.propertyOrder[i];
                if (obj.properties[propertyName]) {
                    newOrder[propertyName] = obj.properties[propertyName];
                } else {
                    log(' [W] ' + obj.id + ' has non existent property "' + propertyName + '" in the propertyOrder array!');
                }
            }

            _.merge(newOrder, obj.properties);

            obj.properties = newOrder;
        }
    }

    return obj;

};