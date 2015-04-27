//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                = require('fs');
var path              = require('path');

var validate          = require('./../util/validate');
var moboUtil          = require('./../util/moboUtil');
var log               = moboUtil.log;

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

    if (!obj) {
        return '{{' + name + '}}\n'; // No unnecessary linebreaks
    }

    var wikitext = '{{' + name + '\n';

    for (var propertyName in obj) {
        var property = obj[propertyName];

        if (property && typeof property === 'object' && !property instanceof Array) {
            log(' [W] importHelper.objToTemplate() cannot convert objects to template values!');
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

        if (prop && typeof prop === 'object' && !obj instanceof Array) {
            log(' [W] importHelper.objToFunction() cannot convert objects to function parameters!');
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
    var example = [
        '==Pure Wikitext==',
        {
            name: 'Person',
            template: {
                email: 'rosalind.chan@optique.biz',
                phone: '+1 (864) 421-2744'
            }
        },
        {
            name: '#set',
            function: {
                var1: 1,
                var2: 'zwei'
            }
        }
    ];

    var wikitext = '';

    for (var i = 0; i < objCollection.length; i++) {

        var obj = objCollection[i];

        if (typeof obj === 'string') {
            wikitext += obj + '\n';
        } else if (typeof obj === 'object' && obj.template) {
            wikitext += exports.objToTemplate(obj.name, obj.template);
        } else if (typeof obj === 'object' && obj.function) {
            wikitext += exports.objToFunction(obj.name, obj.function);
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
                log(' [D] Validated: ' + obj.name + ' with ' + result.errors.length + ' errors.');
            } else {
                log(' [E] Model "' + obj.name + '" not found in registry');
            }
        }
    }

};


exports.enhanceWithForm = function(objCollection, formSchema) {

    if (formSchema) {

        log(objCollection);
        log(' ');

        //if (!registry.deepForm[formName]) {
        //    log(' [E] importHelper.applyForm() could not find the form "' + formName + '" within the mobo model');
        //    return objCollection;
        //}



        var newCollection = [];
        return newCollection;

    } else {
        log(' [E] importHelper.applyForm() found no /_processed/_registry.json!');
        log(' [i] The applyForm() helper function can only be used for mobo projects.');
        log(' [i] mobo has to be run at least once successfully in order to generate this file');
        return objCollection;
    }
};
