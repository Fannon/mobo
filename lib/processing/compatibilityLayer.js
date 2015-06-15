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

/**
 * Global Message Set, containing each error message only once and a counter how often it appeared
 * Add new Messages via exports.addMessage(msg)
 * @type {{}}
 */
exports.messages = {};

exports.exec = function(settings, registry) {

    exports.settings = settings;
    exports.registry = registry;

    exports.messages = {};
    var todo = ['field', 'model', 'form'];

    for (var i = 0; i < todo.length; i++) {

        var modelPartName = todo[i];
        var modelPart = registry[modelPartName];

        for (var key in modelPart) {

            var obj = registry[modelPartName][key];

            // Remove nulls from YAML
            exports.removeNulls(obj);

            // Upgrade old, deprecated property names to the newest standard
            exports.upgradeChangedProperties(obj, modelPartName);

            // Add implicit properties
            exports.applyImplicit(obj);

            // Convert all property arrays to property objects
            // TODO: Refactor this to always use items!
            if (obj.properties && Array.isArray(obj.properties)) {
                obj.properties = exports.convertPropertyArray(obj.properties, obj.id);
            }

        }
    }

    // Print compatibility messages

    for (var msgText in exports.messages) {
        log(msgText + ' (' + exports.messages[msgText] + ')');
    }

    return registry;
};


//////////////////////////////////////////
// Functions                            //
//////////////////////////////////////////

/**
 * Adds a message to the exports.messages set
 * This takes care that a deprecated warning is only shown once, with a counter how often it triggered
 *
 * @param msg
 */
exports.addMessage = function(msg) {

    if (!exports.messages[msg]) {
        exports.messages[msg] = 1;
    } else {
        exports.messages[msg] += 1;
    }
};

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
exports.upgradeChangedProperties = function(obj, modelPartName) {

    var messages = {}; // A message Set, that contains each message only once, the value beeing the counter


    //////////////////////////////////////////
    // Simple Renames                       //
    //////////////////////////////////////////

    var renamed = [];

    // 2015.05.15 mobo v1.4.2
    renamed.push(['smw_output', 'smw_overwriteOutput']);
    renamed.push(['smw_outputLink', 'smw_overwriteOutputToLink']);

    // 2015.06.13 mobo 1.5.0
    renamed.push(['smw_categoryPrefix', 'smw_prefixCategory']);
    renamed.push(['smw_categoryPostfix', 'smw_postfixCategory']);

    // 2015.06.15 mobo 1.6.0 release
    renamed.push(['smw_prefix', 'smw_prepend']);
    renamed.push(['smw_prefixCategory', 'smw_prependCategory']);
    renamed.push(['smw_prefixForm', 'smw_prependForm']);
    renamed.push(['smw_prefixPage', 'smw_prependPage']);

    renamed.push(['smw_postfix', 'smw_append']);
    renamed.push(['smw_postfixForm', 'smw_appendForm']);
    renamed.push(['smw_postfixPage', 'smw_appendPage']);
    renamed.push(['smw_postfixCategory', 'smw_appendCategory']);

    renamed.push(['smw_naming', 'naming']);
    renamed.push(['smw_form', 'sf_form']);
    renamed.push(['smw_forminfo', 'sf_forminfo']);
    renamed.push(['smw_forminput', 'sf_forminput']);
    renamed.push(['smw_freetext', 'sf_freetext']);
    renamed.push(['smw_summary', 'sf_summary']);


    for (var key in obj) {

        // Rename properties
        for (var i = 0; i < renamed.length; i++) {
            var rename = renamed[i];
            var msg = '';

            if (key === rename[0]) {
                // http://stackoverflow.com/a/14592469
                Object.defineProperty(obj, rename[1], Object.getOwnPropertyDescriptor(obj, rename[0]));
                delete obj[rename[0]];
                exports.addMessage('[i] Renaming deprecated properties "' + rename[0] + '" to "' + rename[1] + '"');

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

    //////////////////////////////////////////
    // Transformations                      //
    //////////////////////////////////////////

    if (modelPartName === 'field') {

        // 2015.06.13 Moving smw_prefix.showForm & smw_prefix.showPage
        exports.upgradeFormLinks(obj);
    }

    if (modelPartName === 'model') {

        // 2015.06.13 Moving smw_prefix.showForm & smw_prefix.showPage
        exports.upgradePrePostfixes(obj, 'smw_prefix');
        exports.upgradePrePostfixes(obj, 'smw_postfix');
    }

};


/**
 * If the "type" attribute is missing and there is a "properties" attribute
 * add the missing type depending on the property type
 *
 * @param {object} obj
 * @returns {object}
 */
exports.applyImplicit = function(obj) {

    'use strict';

    var inspect = obj.items || obj;

    // If the object has "properties", it must be an object
    // TODO: Objects should not be supported anymore, anywhere!
    if (obj.properties) {
        obj.type = 'object';
    }

    // If the object has "items", it must be an array
    if (obj.items) {
        obj.type = 'array';
    }

    // Convert single strings to arrays (if the type is ['array', 'string'])
    if (inspect.form && _.isString(inspect.form)) {
        inspect.form = [inspect.form];
    }

    // If a field links to one or more form, it is always of type string and format Page!
    if (inspect.form && !inspect.format) {
        inspect.type = 'string';
        inspect.format = 'Page';
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

exports.upgradePropertiesToItems = function(obj) {
    // TODO!
    return obj;
};

exports.upgradeFormLinks = function(obj) {

    var inspect = obj.items || obj;

    if (inspect.format && inspect.format.indexOf('/form/') > -1) {
        inspect.form = inspect.format.replace('/form/', '');
        inspect.format = 'Page';
        exports.addMessage('[i] Linking to a form with "format": "/form/formName" is now deprecated. Use "form": "formName" instead.');
    }

    if (inspect.oneOf) {
        var formats = [];
        for (var i = 0; i < inspect.oneOf.length; i++) {
            formats.push(inspect.oneOf[i].format.replace('/form/', ''));
        }

        exports.addMessage('[i] The use of oneOf is now deprecated. Use "form": ["formName1", "formName2"] instead.');

        inspect.format = 'Page';
        inspect.type = 'string';
        delete inspect.oneOf;
        inspect.form = formats;
    }
};

exports.upgradePrePostfixes = function(obj, prePostFix) {

    // Prefix
    if (obj[prePostFix]) {

        if (obj[prePostFix].hasOwnProperty('showPage') || obj[prePostFix].hasOwnProperty('showForm')) {
            exports.addMessage('[i] ' + prePostFix + '.showPage / ' + prePostFix + '.showForm are deprecated. Use the simpler ' + prePostFix + 'Page / ' + prePostFix + 'Form properties instead');
        }

        var prefixPage = !obj[prePostFix].hasOwnProperty('showPage') || obj[prePostFix].showPage;
        var prefixForm = !obj[prePostFix].hasOwnProperty('showForm') || obj[prePostFix].showForm;

        if (prefixPage && prefixForm) {
            // Has already the new default behaviour
            delete obj[prePostFix].showPage;
            delete obj[prePostFix].showForm;
        } else if (prefixForm && !prefixPage) {
            delete obj[prePostFix].showPage;
            obj[prePostFix + 'Form'] = obj[prePostFix];
            delete obj[prePostFix];
        }  else if (prefixPage && !prefixForm) {
            delete obj[prePostFix].showForm;
            obj[prePostFix + 'Page'] = obj[prePostFix];
            delete obj[prePostFix];
        } else {
            log('[E] ' + obj.$path + ': ' + prePostFix + ' is neither displayed in form or page!');
        }
    }
};
