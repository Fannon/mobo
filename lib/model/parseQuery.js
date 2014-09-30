//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');
var handlebars = require('./../handlebarsExtended');

var logger     = require('./../logger.js');
var log        = logger.log;

var askQueryTemplate, sparqlQueryTemplate, generateQuery;

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


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var askQueryTemplateFile = fs.readFileSync(settings.templateDir + 'query-ask.wikitext').toString();
    askQueryTemplate = handlebars.compile(askQueryTemplateFile);

    var sparqlQueryTemplateFile = fs.readFileSync(settings.templateDir + 'query-sparql.wikitext').toString();
    sparqlQueryTemplate = handlebars.compile(sparqlQueryTemplateFile);


    //////////////////////////////////////////
    // Logic                                //
    //////////////////////////////////////////

    var returnObject = {};
//    var queryNameArray = name.split('.');

    // Generate Form
    var query = generateQuery(json, name);

    if (query) {
        returnObject.template = query;
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
generateQuery = function(json, name) {

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
