//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                  = require('fs-extra');
var _                   = require('lodash');
var Promise             = require('bluebird');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

var getDirectoryContent = require('../getDirectoryContent.js');
var validateSchema = require('./../util/validateSchema.js');


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

    return new Promise(function (resolve, reject) {

        //////////////////////////////////////////
        // Variables                            //
        //////////////////////////////////////////

        registry.expandedField = {};
        registry.expandedModel = {};
        registry.expandedForm = {};

        //////////////////////////////////////////
        // EXPAND REGISTRY THROUGH INHERITANCE  //
        //////////////////////////////////////////

        registry.expandedModel = exports.expandModels(registry);
        registry.expandedForm = exports.expandForms(registry);

        // Write Registry to file
        fs.outputFileSync(settings.processedModelDir + '/_registry.json', JSON.stringify(registry, null, 4));

        resolve(registry);
    });

};

/**
 * Expands all models through their external refs.
 * This will introduce inheritance
 * @TODO: Somehow merge this with expandForms?
 *
 * @param registry
 * @returns {{}}
 */
exports.expandModels = function(registry) {

    var model;

    //////////////////////////////////////////
    // Build Full Referenced Registry       //
    //////////////////////////////////////////

    // Make deep clone of models
    var expandedModelRegistry = _.cloneDeep(registry.model);
    registry.expandedModel = expandedModelRegistry;

    // Resolve all Models in the Deep Registry
    for (var modelName in expandedModelRegistry) {
        model = expandedModelRegistry[modelName];
        exports.inherit(model, registry);
        exports.orderObjectProperties(model);
    }

    // CleanUp / Post-Processing
    for (modelName in expandedModelRegistry) {
        model = expandedModelRegistry[modelName];
        model["$schema"] = "http://json-schema.org/draft-04/schema#";
    }

    return expandedModelRegistry;

};

/**
 * Expands all Forms through their $extend atributes
 *
 * @param registry
 * @returns {{}}
 */
exports.expandForms = function(registry) {

    var deepForm = {};

    for (var formName in registry.form) {

        var form = registry.form[formName];

        deepForm[formName] = _.cloneDeep(form);
        deepForm[formName].id = formName;

        for (var propertyName in form.properties) {

            var property = form.properties[propertyName];
            var refArray = [];
            var name;

            if (property.$extend) {

                refArray = property.$extend.split('/');

                if (refArray[1] === 'smw_template') {
                    name = refArray[refArray.length - 1].replace('.wikitext', '');

                    deepForm[formName].properties[name] = property;

                    deepForm[formName].properties[propertyName].id = name;
                    deepForm[formName].properties[propertyName].type = "string";
                    deepForm[formName].properties[propertyName].format = property.$extend;
                    deepForm[formName].properties[propertyName].template = registry.smw_template[refArray[2]];

                } else {
                    name = refArray[refArray.length - 1].replace('.json', '');
                    deepForm[formName].properties[propertyName] = registry.expandedModel[name];
                }

            } else if (property.items && property.items.$extend) {
                refArray = property.items.$extend.split('/');
                name = refArray[2].replace('.json', '');
                deepForm[formName].properties[propertyName].items = registry.expandedModel[name];

            } else if (property.wikitext) {
                // Ignore, wikitext is used just for form display
            } else {
                log(property, false);
                log('>>> [W] Form "' + formName + '" is missing its $extend attributes!');
            }
        }

    }

    return deepForm;

};

/**
 * Recursive Function that looks for $extends and resolves them
 *
 * TODO: Make this function simpler by making it global. Just apply $extend whereever it occurs.
 * TODO: Does not support circular Structures! Will run forever.
 * TODO: Implement support for "$extend" arrays
 * TODO: Remove support for allOf / anyOf inheritance
 *       (feature will still be supported for referencing models through "format"
 *
 * @param model
 * @param registry
 */
exports.inherit = function(model, registry) {

    // Field inheritance may be implemented through a simple $extend
    // Note: In JSON Schema inheritance is usually implemented via allOf[].
    // Mobo prefers "$extend".
    if (model.$extend || model.allOf || model.anyOf) {

        var refArray = [];

        // TODO: This might be wrong, since allOf might not be just an array of $extends!
        if (model.allOf) {
            refArray = model.allOf;
        } else if (model.anyOf) {
            refArray = model.anyOf;
        }

        if (model.$extend) {
            refArray.push(model.$extend);
        }

        if (model.$extend) {
            refArray.push(model.$extend);
        }

        for (var i = 0; i < refArray.length; i++) {
            refArray[i].$parent = model.id;
            exports.extend(model, refArray[i].$extend, registry);
        }
    }

    // Merge Fields into Models
    if (model.properties) {
        for (var attrName in model.properties) {

            exports.inherit(model.properties[attrName], registry);
        }
    }

    // Special Case: Handle Array Items
    if (model.items) {
        exports.inherit(model.items, registry);
    }

    return model;

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

    if (obj.$extend || $extend) {

        var refArray = [];

        if ($extend) {
            refArray = $extend.split('/'); // "/model/ip.json"
        } else {
            refArray = obj.$extend.split('/');
        }

        var type = refArray[1];
        var originalType = type;
        var name = refArray[refArray.length - 1].replace('.json', '');

        // Check if this was already extended
        if (exports.existenceIndex[originalType + '/' + name] === true) {
            log(' [E] Circular reference in the model! ' + type + '/' + name);
            throw new Error('Circular reference in the model!');
        }

        // TODO: Hack that forces to use the expanded registry for references
        // TODO: Make this work for fields and models too in a generic manner
        if (type === 'model') {
            type = 'expandedModel';
        }

        var reference = registry[type][name];

        if (!reference){
            var id = obj.$filepath || obj.id || obj.$parent || '(Unknown)';
            console.dir(obj);
            log(' [E] ' + id + ': invalid $extend to missing "' + obj.$extend + '"!');
        }

        if (reference && reference.$extend) {

            // If this object is to be extended, register it's existence to the index
            // This is needed to detect circular references
            exports.existenceIndex[originalType + '/' + name] = true;

            // If it is not extended yet, extend it first  => Recursion!
            reference.$parent = obj.id;
            exports.extend(reference, reference.$extend, registry);

        }

        // Inheritance TODO: Can be simplified with lodash 3.x (???)
        var mergeObject = _.cloneDeep(reference);
        _.merge(mergeObject, obj);
        _.merge(obj, mergeObject);




        obj.$reference = obj.$extend || $extend;

        // Cleanup
        if (obj.$extend) { delete obj.$extend; }
        if (obj.allOf) { delete obj.allOf; }
        if (obj.$schema) { delete obj.$schema; }

    }

    return obj;
};


/**
 * Orders Model Properties by propertyOrder Array
 *
 * Properties which aren't given in the array are positioned at the bottom
 *
 * @param model
 */
exports.orderObjectProperties = function(model) {

    if (model.properties && model.propertyOrder) {

        var newOrder = {};

        for (var i = 0; i < model.propertyOrder.length; i++) {
            var propertyName = model.propertyOrder[i];
            if (model.properties[propertyName]) {
                newOrder[propertyName] = model.properties[propertyName];
            } else {
                log(' [W] Model ' + model.id + ' has non existent property "' + propertyName + '" in the propertyOrder array!');
            }
        }

        _.merge(newOrder, model.properties);

        model.properties = newOrder;
    }
    // TODO: Return value is only returned from testing, this method works directly on the object
    return model;

};
