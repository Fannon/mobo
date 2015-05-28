//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var validate          = require('./../util/validate');
var semlog            = require('semlog');
var log               = semlog.log;


//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

/** Default settings */
exports.settings = {
    arraymapSeparator: ';'
};


//////////////////////////////////////////
// FUNCTIONS                            //
//////////////////////////////////////////

exports.setSettings = function(settings) {
    exports.settins = settings;
};


/**
 * Converts an object to a wikitext template
 *
 * @param {string}      name    name of the template
 * @param {object}      obj
 *
 * @returns {string}    wikitext
 */
exports.objToTemplate = function(name, obj) {

    if (!obj || Object.keys(obj).length === 0) {
        return '{{' + name + '}}\n'; // No unnecessary linebreaks
    }

    var wikitext = '{{' + name + '\n';

    for (var propertyName in obj) {
        var property = obj[propertyName];

        if (property && typeof property === 'object' && !(property instanceof Array)) {
            log('[W] importHelper.objToTemplate() cannot convert objects to template values!');
        } else if (property === true) {
            wikitext += ' |' + propertyName + '\n';
        } else if (Array.isArray(property)) {
            wikitext += ' |' + propertyName + '=' + property.join(exports.settings.arraymapSeparator + ' ') + '\n';
        } else {
            wikitext += ' |' + propertyName + '=' + property.toString().trim() + '\n';
        }

    }

    wikitext += '}}\n';

    return wikitext;
};

/**
 * Converts an object to a MediaWiki parser function call
 *
 * @param {string}      name    name of the function
 * @param {object}      obj
 *
 * @returns {string}    wikitext
 */
exports.objToFunction = function(name, obj) {

    var wikitext = '{{' + name + ':\n';

    for (var propertyName in obj) {

        var prop = obj[propertyName];

        if (prop && typeof prop === 'object' && !(obj instanceof Array)) {
            log('[W] importHelper.objToFunction() cannot convert objects to function parameters!');
        } else if (prop === true) {
            wikitext += ' |' + propertyName + '\n';
        } else if (Array.isArray(prop)) {
            wikitext += ' |' + propertyName + '=' + prop.join(exports.settings.arraymapSeparator) + '\n';
        } else {
            wikitext += ' |' + propertyName + '=' + prop.toString().trim() + '\n';
        }
    }

    wikitext += '}}\n';

    return wikitext;

};


/**
 * Converts a collection of wikitext, templates and function calls to a combined wikitext document
 * See the example object for the objCollection object structure
 *
 * @param objCollection
 * @returns {string}
 */
exports.objCollectionToWikitext = function(objCollection) {

    /** Example objCollection */
    //var example = [
    //    '==Pure Wikitext==',
    //    {
    //        name: 'Person',
    //        template: {
    //            email: 'rosalind.chan@optique.biz',
    //            phone: '+1 (864) 421-2744'
    //        }
    //    },
    //    {
    //        name: '#set',
    //        function: {
    //            var1: 1,
    //            var2: 'zwei'
    //        }
    //    }
    //];

    var wikitext = '';

    for (var i = 0; i < objCollection.length; i++) {

        var obj = objCollection[i];

        if (typeof obj === 'string') {
            wikitext += obj + '\n';
        } else if (typeof obj === 'object' && obj.function) {
            wikitext += exports.objToFunction(obj.name, obj.function);
        } else if (typeof obj === 'object') {
            // If no data is given, asume it's an empty template
            var template = obj.template || {};
            wikitext += exports.objToTemplate(obj.name, template);
        }
    }

    return wikitext;
};

/**
 * Validates an object collection against the mobo registry
 * @param objCollection
 * @param registry
 */
exports.validate = function(objCollection, registry) {

    for (var i = 0; i < objCollection.length; i++) {
        var obj = objCollection[i];

        if (typeof obj === 'object' && obj.name && obj.template) {

            if (registry && registry.expandedModel[obj.name]) {
                var result = validate.validate(obj.template, registry.expandedModel[obj.name], obj.name);
                if (exports.settings.verbose) {
                    log('[D] Validated: ' + obj.name + ' with ' + result.errors.length + ' errors.');
                }

            } else {
                log('[E] Model "' + obj.name + '" not found in registry');
            }
        }
    }

};


exports.enhanceWithForm = function(objCollection, formSchema) {

    if (formSchema && formSchema.$path) {

        var newCollection = [];
        var inserted = [];

        log(' ');
        if (exports.settings.verbose) {
            log('[D] Enhancing import collection with ' + formSchema.$path);
        }

        for (var templateName in formSchema.properties) {

            var template = formSchema.properties[templateName];

            if (template.$reference && template.$reference.type === 'smw_template') {

                // Handle wikitext templates

                //log('[D] Inserting empty template: ' + template.id);
                newCollection.push({
                    name: template.id,
                    template: {}
                });

            } else if (template.$reference && template.$reference.type === 'model') {

                // Handle single-instance models

                var item = exports.findInCollection(objCollection, template.id);

                if (item.length === 1) {
                    //log('[D] Inserting single instance template: ' + template.id);

                    newCollection.push({
                        name: template.id,
                        template: item[0].template || {}
                    });
                    inserted.push(template.id);
                } else {
                    newCollection.push({
                        name: template.id,
                        template: {}
                    });
                }

                if (item.length > 1) {
                    log('[W] Cannot add a single instance template more than once: ' + template.id);
                }

            } else if (template.items && template.items.$reference.type === 'model') {

                // Handle multiple-instance models

                var items = exports.findInCollection(objCollection, templateName);

                for (var i = 0; i < items.length; i++) {
                    if (exports.settings.verbose) {
                        log('[D] Inserting multiple instance template: ' + templateName);
                    }
                    newCollection.push(items[i]);
                    inserted.push(templateName);
                }

            } else if (template.wikitext) {

                // Ignore "wikitext" properties, since they'll only be rendered on the form edit page

                //log('[D] Ignoring form-only "wikitext" injection');
            } else {
                log('[W] Unknown template type: ' + template.id);
                log(template);
            }

        }


        // Add all items from the object collection that haven't been added yet
        // They will be appended at the bottom
        for (var j = 0; j < objCollection.length; j++) {

            var obj = objCollection[j];

            // If the item has not been inserted already
            if (obj.name && inserted.indexOf(obj.name) === -1) {

                if (exports.settings.verbose) {
                    log('[D] Appending additional item: ' + obj.name);
                }
                newCollection.push(obj);

            } else if (typeof obj === 'string') {
                if (exports.settings.verbose) {
                    log('[D] Appending wikitext: ' + obj);
                }
                newCollection.push(obj);
            }

        }


        return newCollection;

    } else {
        log('[E] No valid form schema given!');
        log('[i] The applyForm() helper function can only be used for mobo projects.');
        log('[i] mobo has to be run at least once successfully in order to access the mobo registry');
        return objCollection;
    }
};

exports.findInCollection = function(collection, name) {

    var results = [];

    for (var i = 0; i < collection.length; i++) {
        var obj = collection[i];
        if (obj.name && obj.name === name) {
            results.push(obj);
        }
    }

    return results;

};
