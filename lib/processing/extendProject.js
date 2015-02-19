//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
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
        registry.expandedForm = exports.expandForms(registry);

        // Write Registry to file
        fs.outputFileSync(settings.processedModelDir + '/_registry.json', JSON.stringify(registry, null, 4));

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

    // Resolve all Models in the Deep Registry
    for (var name in registry[expandedName]) {
        exports.inherit(registry[expandedName][name], registry);
    }

    return registry[expandedName];
};


/**
 * Expands all Forms through their $extend atributes
 *
 * @TODO: Integrate this into the generic expandRegistry
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
 * TODO: Make this function simpler by making it more general. Just apply $extend whereever it occurs.
 *
 * @param obj
 * @param registry
 */
exports.inherit = function(obj, registry) {

    // Field inheritance may be implemented through a simple $extend
    // Note: In JSON Schema inheritance is usually implemented via allOf[].
    // Mobo uses a simper "$extend" instead.
    if (obj.$extend) {

        var refArray = [];

        if (Array.isArray(obj.$extend)) {
            refArray = obj.$extend;
        } else {
            refArray.push(obj.$extend);
        }

        for (var i = 0; i < refArray.length; i++) {
            refArray[i].$parent = obj.id;
            obj = exports.extend(obj, refArray[i].$extend, registry);
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

    if (obj.$extend || $extend) {

        var refArray = [];

        if ($extend) {
            refArray = $extend.split('/'); // E.g. "/model/ip.json"
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

        if (type === 'model') {
            type = 'expandedModel';
        } else if (type === 'field') {
            type = 'expandedField';
        } else if (type === 'form') {
            type = 'expandedForm';
        }

        var reference = registry[type][name];

        if (!reference){
            var id = obj.$filepath || obj.id || obj.$parent || '(Unknown)';
            log(' [E] ' + id + ': invalid $extend to missing "' + obj.$extend + '"!');
        }

        // If referenced object has an unresolved $extend, extend it first
        // Check for circular references
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

    return model;

};
