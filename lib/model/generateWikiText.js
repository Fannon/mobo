//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs-extra');

var logger     = require('./../logger.js');
var log        = logger.log;

var parseField = require('./parseField.js');
var parseModel = require('./parseModel.js');
var parseForm  = require('./parseForm.js');
var parseQuery = require('./parseQuery.js');

/**
 * Generates the wikitext from the JSON model
 * Each Site Type has its own parser (e.g. parseField.js) and its own template (field.wikitext)
 * Uses the handlebars.js template engine.
 *
 * @param settings
 * @param registry
 * @returns {{}}
 */
exports.exec = function(settings, registry) {


    //////////////////////////////////////////
    // Variables                            //
    //////////////////////////////////////////

    /**
     * Generated wiki pages
     * @type {{}}
     */
    var generated = {};

    /**
     * Counts the output pages for statistics
     * @type {{}}
     */
    var outputStats = {
        property: 0,
        category: 0,
        form: 0,
        template: 0,
        page: 0,
        smw_query: 0
    };


    //////////////////////////////////////////
    // Parse the Model                      //
    //////////////////////////////////////////

    // Get Fields
    exports.callParser(settings, parseField, registry.field, registry, generated, outputStats);

    // Get Models
    exports.callParser(settings, parseModel, registry.expandedModel, registry, generated, outputStats);

    // Get Forms
    exports.callParser(settings, parseForm, registry.expandedForm, registry, generated, outputStats);


    //////////////////////////////////////////
    // Parse Queries                        //
    //////////////////////////////////////////

    exports.callParser(settings, parseQuery, registry.smw_query, registry, generated, outputStats);


    //////////////////////////////////////////
    // Parse MediaWiki Templates            //
    //////////////////////////////////////////

    // Get / overwrite MediaWiki Templates
    for (var templateName in registry.smw_template) {
        var template = registry.smw_template[templateName];
        var templatePageName = 'template:' + templateName.replace('.wikitext', '');
        templatePageName = templatePageName.replace('---', '/');

        if (generated[templatePageName] && settings.verbose) {
            log('>>> [i] Overwriting Template ' + templateName + '');
        }

        generated[templatePageName] = template;

        outputStats.template += 1;
    }

    //////////////////////////////////////////
    // Parse MediaWiki Sites                //
    //////////////////////////////////////////

    for (var pageName in registry.smw_page) {

        var page = registry.smw_page[pageName];
        var newPageName = pageName.replace('.wikitext', '');
        newPageName = newPageName.replace('___', ':');
        newPageName = newPageName.replace('---', '/');

        if (generated[newPageName]) {
            log('>>> [i] Overwriting Site ' + pageName + '');
            generated[newPageName] = page;
        } else {
            generated[newPageName] = page;
        }

        outputStats.page += 1;
    }


    //////////////////////////////////////////
    // GENERATE STRUCTURAL SITES            //
    //////////////////////////////////////////

    // If the HeaderTabs Extension is activated, create a HeaderTabs Helper Template
    if (settings.headerTabs) {
        generated['template:HeaderTabs'] = '<headertabs />';
        outputStats.template += 1;
    }

    // Add the category for the mobo bot report
    generated['category:' + settings.mw_username + 'Report'] = '.';


    //////////////////////////////////////////
    // WRITE TO FILE AND REPORT             //
    //////////////////////////////////////////

    // Write generated pages object to file
    fs.outputFileSync(settings.processedModelDir + '/_generated.json', JSON.stringify(generated, null, 4));

    log(' ' + outputStats.property + ' Properties | ' +
        outputStats.template + ' Templates | ' +
        outputStats.form + ' Forms | ' +
        outputStats.category + ' Categories | ' +
        outputStats.page + ' Pages');
    log('-------------------------------------------------------------------------');

    return generated;

};

/**
 * Parses a specific Model Type from JSON Schema to WikiText
 *
 * Uses generator sub-modules
 * Escapes filenames
 * The Incoming datastructure of the generator is identical to the registry object
 * with the difference that only the created pages are returned.
 * Those will be converted to the flat generated object structure which has only pagenames as keys
 *
 * @param generator
 * @param data
 * @param settings
 * @param registry
 * @param generated
 */
exports.callParser = function(settings, generator, data, registry, generated, outputStats) {

    var fileName;

    for (var name in data) {

        var json = data[name];

        if (!json || json === '') {
            log('>>> [i] File ' + name + ' is empty, will not be parsed!');
        } else {

            // Display to-do entry if given
            if (json.todo && settings.displayTodos) {
                log(' [TODO] ' + fileName + ': ' + json.todo);
            }

            var output = generator.exec(settings, json, name, registry);

            for (var outputType in output) {

                for (var pageName in output[outputType]) {

                    var escapedName = pageName.replace('.', '-');
                    fileName = outputType + ':' + escapedName;

                    generated[fileName] = output[outputType][pageName];

                    outputStats[outputType] += 1;
                }
            }
        }
    }

    return generated;

};
