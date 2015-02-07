//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                  = require('fs-extra');
var _                   = require('lodash');
var RSVP                = require('rsvp');

var logger              = require('../logger.js');
var log                 = logger.log;

var getDirectoryContent = require('../getDirectoryContent.js');
var validateSchema = require('./validateSchema.js');


/**
 * Stores the JSON model into an internal registry object.
 * Additionally a "deep" registry is built that has all inheritances resolved
 *
 * TODO: This code should be rewritten
 * TODO: This supports no very deep inheritances, to avoid circular references
 *
 * @param {object}      settings
 * @param {function}    callback
 *
 * @returns {{}}
 */
exports.exec = function(settings, callback) {

    //////////////////////////////////////////
    // Variables                            //
    //////////////////////////////////////////

    var registry = {};


    //////////////////////////////////////////
    // READ MODEL TO REGISTRY               //
    //////////////////////////////////////////

    // Directories to fetch
    var directories = ['field', 'model', 'form', 'smw_template', 'smw_query', 'smw_page'];

    // Fill Registry
    var promises = directories.map(function(name){

        var promise = getDirectoryContent.read(settings.importModelDir + '/' + name + '/');
        promise.then(function(content) {
            registry[name] = content;
        }, function(err) {
            log('> [ERROR] Could not read project directory /' + name);
            log(err);
        });
        return promise;
    });

    // After all directories are read
    RSVP.all(promises).then(function() {

        /** Fallback for @deprecated project structure! */
        if (!registry.smw_page) {
            registry.smw_page = getDirectoryContent.read(settings.importModelDir + '/smw_site/');
            log('> [WARNING] Wiki pages are now stored into /smw_site/ folder instead of /smw_page/ !');
            log('> [WARNING] Please rename your directory accordingly!');
        }

        //////////////////////////////////////////
        // VALIDATE JSON STRUCTURE              //
        //////////////////////////////////////////

        validateSchema.validate('field', registry.field);
        validateSchema.validate('model', registry.model);
        validateSchema.validate('form', registry.form);


        //////////////////////////////////////////
        // EXPAND REGISTRY THROUGH INHERITANCE  //
        //////////////////////////////////////////

        registry.expandedModel = exports.expandModels(registry);
        registry.expandedForm = exports.expandForms(registry);

        // Write Registry to file
        fs.outputFileSync(settings.processedModelDir + '/_registry.json', JSON.stringify(registry, null, 4));

        callback(false, registry);


    }).catch(function(error){
        callback(error, false);
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
                log('>>> [WARNING] Form "' + formName + '" is missing its $extend attributes!');
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
            refArray = $extend.split('/');
        } else {
            refArray = obj.$extend.split('/');
        }

        var type = refArray[1];
        var name = refArray[refArray.length - 1].replace('.json', '');

        var reference = registry[type][name];

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
                log('> [WARNING] Model ' + model.id + ' has non existent property "' + propertyName + '" in the propertyOrder array!');
            }
        }

        _.merge(newOrder, model.properties);

        model.properties = newOrder;
    }
    // TODO: Return value is only returned from testing, this method works directly on the object
    return model;

};
