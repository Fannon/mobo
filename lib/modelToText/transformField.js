//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _   = require('lodash');
var moboUtil   = require('./../util/moboUtil');
var semlog     = require('semlog');
var log        = semlog.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Execute the parsing of the fields
 * Will generate SMW Attribute sites
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 *
 * @returns {object}    generated wikipages
 */
exports.exec = function(settings, obj, name) {
    'use strict';

    // Do not create abstract or ignored fields
    if (obj.$abstract || obj.$ignore) {
        return {};
    }

    //////////////////////////////////////////
    // Inner Variables                      //
    //////////////////////////////////////////

    /** Return Object, matching the data structure of the registry */
    var returnObj = {
        property: {}
    };


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    exports.propertyTemplate = moboUtil.loadTemplate(exports, 'property.wikitext', settings);


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Analyze the data type
    //var type = exports.analyzeType(obj);

    // Generate the SMW property wikitext
    var propertyWikitext = exports.generateProperty(settings, obj);

    if (propertyWikitext) {
        returnObj.property[name] = propertyWikitext;
    }

    return returnObj;
};


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Takes the json and the calculated datatype and creates the SMW property through a template
 *
 * @param {{}}      settings
 * @param {{}}      obj  Field in JSON format
 *
 * @returns {String}    Wikitext of the property
 */
exports.generateProperty = function(settings, obj) {
    'use strict';

    var inspect = obj.items || obj;

    var data = {
        type: obj.smw_type,
        id: obj.id,
        description: obj.description || false,
        usesForms: inspect.form || [],

        fieldObj: obj,
        settingsObj: settings
    };

    return exports.propertyTemplate(data);
};
