//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of queries
 * Will generate SMW templates
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 *
 * @returns {object}    generated wikipages
 */
exports.exec = function(settings, obj, name) {
    'use strict';


    //////////////////////////////////////////
    // Inner Variables                      //
    //////////////////////////////////////////

    /** Return Object, matching the data structure of the registry */
    var returnObject = {
        template: {}
    };


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    exports.askQueryTemplate = moboUtil.loadTemplate(exports, 'query-ask', settings);
    exports.sparqlQueryTemplate = moboUtil.loadTemplate(exports, 'query-sparql', settings);


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Generate Form
    var queryWikitext = exports.generateQuery(settings, obj, name);

    if (queryWikitext) {
        returnObject.template[name] = queryWikitext;
    }

    return returnObject;
};

/**
 * Generates the template data from the query file / filetype
 *
 * @param   {object}    settings
 * @param   {object}    obj
 * @param   {string}    name        key-name of the current obj
 *
 * @returns {string|boolean}        generated wikitext
 */
exports.generateQuery = function(settings, obj, name) {
    'use strict';

    var queryNameArray = name.split('.');
    var queryName = queryNameArray[0];
    var queryType = queryNameArray[1];

    var data = {
        query: obj,
        name: queryName
    };

    if (queryType === 'ask') {
        return exports.askQueryTemplate(data);
    } else if (queryType === 'rq' || 'sparql') {
        return exports.sparqlQueryTemplate(data);
    } else {
        log('>>> [W] Query "' + name + '" has wrong filetype!');
    }

};
