//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var handlebars = require('./../handlebarsExtended');
var logger     = require('./../logger.js');
var log        = logger.log;


//////////////////////////////////////////
// Outer Variables                      //
//////////////////////////////////////////

var askQueryTemplateFile;
var askQueryTemplate;

var sparqlQueryTemplateFile;
var sparqlQueryTemplate;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of queries
 * Will generate SMW templates
 *
 * @param settings
 * @param json
 * @param name
 *
 * @returns {{}}
 */
exports.exec = function (settings, json, name) {

    'use strict';

    // Inject the current settings into the template engine
    handlebars.setMoboSettings(settings);

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

    // If the templates are not loaded already, do so:
    if (!askQueryTemplateFile) {
        askQueryTemplateFile = fs.readFileSync(settings.templateDir + 'query-ask.wikitext').toString();
        askQueryTemplate = handlebars.compile(askQueryTemplateFile);
    }

    if (!sparqlQueryTemplateFile) {
        sparqlQueryTemplateFile = fs.readFileSync(settings.templateDir + 'query-sparql.wikitext').toString();
        sparqlQueryTemplate = handlebars.compile(sparqlQueryTemplateFile);
    }


    //////////////////////////////////////////
    // Execution                            //
    //////////////////////////////////////////

    // Generate Form
    var queryWikitext = exports.generateQuery(json, name);

    if (queryWikitext) {
        returnObject.template[name] = queryWikitext;
    }

    return returnObject;
};

/**
 * Generates the template data from the query file / filetype
 *
 * @param json
 * @param name
 * @returns {*}
 */
exports.generateQuery = function(json, name) {

    var queryNameArray = name.split('.');
    var queryName = queryNameArray[0];
    var queryType = queryNameArray[1];

    var data = {
        query: json,
        name: queryName
    };

    if (queryType === 'ask') {
        return askQueryTemplate(data);
    } else if (queryType === 'rq' || 'sparql' ) {
        return sparqlQueryTemplate(data);
    } else {
        log('>>> [WARNING] Query "' + name + '" has wrong filetype!');
    }

};
