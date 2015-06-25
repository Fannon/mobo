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

    exports.settings = settings;

    return new Promise(function(resolve) {

        /** Expanded fields, with applied inheritance */
        registry.expandedField = exports.expandRegistry(registry, 'field');
        exports.postProcessing(registry.expandedField);

        /** Expanded models, with applied inheritance */
        registry.expandedModel = exports.expandRegistry(registry, 'model');
        exports.postProcessing(registry.expandedModel);

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

    if (obj.$path) {
        exports.inheritanceStack.push(obj.$path);
    }

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

    // Fields: Handle arrays
    if (obj.items) {
        exports.inherit(obj.items, registry);
    }

    // If Object has a itemsOrder array, order the properties accordingly
    if (obj.properties && obj.itemsOrder) {
        obj = exports.orderObjectProperties(obj);
    }

    // Store complete/final property order in obj.$itemsOrder
    if (obj.properties) {
        obj.$itemsOrder = Object.keys(obj.properties);
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

    // Push current object to inheritanceStack (for better error reporting)
    if (obj.$filepath) {
        exports.inheritanceStack.push(obj.$path);
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

        // Point to expanded registry, if a field, model or form
        if (type === 'model') {
            type = 'expandedModel';
        } else if (type === 'field') {
            type = 'expandedField';
        } else if (type === 'form') {
            type = 'expandedForm';
        }

        // Check if this was already extended.
        if (exports.existenceIndex[originalType + '/' + name] > 3) {
            log('[E] Circular reference in the model! ' + type + '/' + name + ' references:');
            log('[i] Current existence index:');
            log(exports.existenceIndex);
            log('[i] Current inheritance stack:');
            log(exports.inheritanceStack);
            return obj;
        }

        var reference = registry[type][name];

        if (!reference) {
            // Use the $path of the current object.
            // If it has none, look for the last object in the inheritanceStack and use it instead.
            var path = obj.$path || '(unknown)';

            if (exports.inheritanceStack.length > 0) {
                path = exports.inheritanceStack[exports.inheritanceStack.length - 1];
            }

            log('[E] ' + path + ': Invalid $extend to missing "' + obj.$extend + '"!');
            if (exports.inheritanceStack.length > 1) {
                exports.inheritanceStack = _.uniq(exports.inheritanceStack);
                log('[D] Inheritance Stack: ' + exports.inheritanceStack.join(' > '));
            }
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


            //log('======================================================================');
            //log('Merging: ' + obj.$path);
            //log('----------------------------------------------------------------------');
            //log('[i] obj before: ' + obj.$path);
            //log(obj);
            //log('----------------------------------------------------------------------');
            //log('[i] mergeObject (reference) before: ' + mergeObject.$path);
            //log(mergeObject);

            exports.mergeObjects(mergeObject, obj);

            //log('----------------------------------------------------------------------');
            //log('[i] mergeObject after: ' + mergeObject.$path);
            //log(mergeObject);

            obj = exports.mergeObjects(obj, mergeObject);

            //log('----------------------------------------------------------------------');
            //log('[i] obj after: ' + obj);
            //log(mergeObject);
            //log(' ');


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
 * Merges two Objects
 * If the Object contains Arrays, this will decide whether and how to merge them
 * This depends on the options and annotations within the array.
 *
 * @param {{}} obj1
 * @param {{}} obj2
 *
 * @returns {{}}
 */
exports.mergeObjects = function(obj1, obj2) {
    return _.merge(obj1, obj2, function(objectValue, sourceValue, key) {

        if (_.isArray(objectValue)) {

            // Apply the default settings
            for (var keyName in exports.settings.arrayMergeOptions) {
                if (key === keyName) {
                    objectValue = exports.settings.arrayMergeOptions[keyName].concat(objectValue);
                }
            }

            // Read annotations from current array
            var prepend = objectValue.indexOf('@prepend') > -1;
            var append = objectValue.indexOf('@append') > -1;
            var overwrite = objectValue.indexOf('@overwrite') > -1;
            var unique = objectValue.indexOf('@unique') > -1;
            var sorted = objectValue.indexOf('@sorted') > -1;
            var unsorted = objectValue.indexOf('@unsorted') > -1;

            // Remove all annotations
            _.pull(objectValue, '@overwrite', '@prepend', '@append', '@unique', '@sorted', '@unsorted');

            // Do the actual merging
            var merged = objectValue;

            if (prepend) {
                merged = sourceValue.concat(objectValue);
            }
            if (append) {
                merged = objectValue.concat(sourceValue);
            }
            if (overwrite) {
                merged = objectValue;
            }
            if (unique) {
                merged = _.uniq(merged);
            }
            if (!unsorted && sorted) {
                merged = merged.sort();
            }

            return merged;
        }
    });
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
        }
    }

    return modelPart;

};

/**
 * Orders Model Properties by itemsOrder Array
 *
 * Properties which aren't given in the array are positioned at the bottom
 *
 * @param obj
 */
exports.orderObjectProperties = function(obj) {
    'use strict';

    if (obj.properties) {

        if (obj.properties && obj.itemsOrder) {

            var newOrder = {};

            for (var i = 0; i < obj.itemsOrder.length; i++) {
                var propertyName = obj.itemsOrder[i];
                if (obj.properties[propertyName]) {
                    newOrder[propertyName] = obj.properties[propertyName];
                } else {
                    var id = obj.$path || obj.id || '(unknown)';
                    log('[W] ' + id + ' has non existent property "' + propertyName + '" in the itemsOrder array!');
                }
            }

            // Append all properties that haven't meen mentioned in the itemsOrder Array
            obj.properties = _.merge(newOrder, obj.properties);
        }
    }

    return obj;

};
