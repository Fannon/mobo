//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var Promise    = require('bluebird');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

var parseField = require('./parseField.js');
var parseModel = require('./parseModel.js');
var parseForm  = require('./parseForm.js');
var parseQuery = require('./parseQuery.js');

//////////////////////////////////////////
// Variables                            //
//////////////////////////////////////////

/**
 * Counts the output pages for statistics
 * @type {{}}
 */
exports.outputStats = {
    property: 0,
    category: 0,
    form: 0,
    template: 0,
    page: 0
};

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

    return new Promise(function (resolve) {

        //////////////////////////////////////////
        // Variables                            //
        //////////////////////////////////////////

        /**
         * Generated wiki pages
         * @type {{}}
         */
        var generated = {};

        // Reset output statistics
        exports.outputStats = {
            property: 0,
            category: 0,
            form: 0,
            template: 0,
            page: 0
        };


        //////////////////////////////////////////
        // Parse the Model                      //
        //////////////////////////////////////////

        // Get Fields
        exports.callParser(settings, parseField, registry.expandedField, registry, generated);

        // Get Models
        exports.callParser(settings, parseModel, registry.expandedModel, registry, generated);

        // Get Forms
        exports.callParser(settings, parseForm, registry.expandedForm, registry, generated);


        //////////////////////////////////////////
        // Parse Queries                        //
        //////////////////////////////////////////

        exports.callParser(settings, parseQuery, registry.smw_query, registry, generated);


        //////////////////////////////////////////
        // Parse MediaWiki Templates            //
        //////////////////////////////////////////

        // Get / overwrite MediaWiki Templates
        for (var templateName in registry.smw_template) {
            var template = registry.smw_template[templateName];
            var templatePageName = 'template:' + templateName.replace('.wikitext', '');
            templatePageName = templatePageName.split('---').join('/');

            if (generated[templatePageName] && settings.verbose) {
                log('>>> [i] Overwriting Template ' + templateName + '');
            }

            generated[templatePageName] = template;

            exports.outputStats.template += 1;
        }

        //////////////////////////////////////////
        // Parse MediaWiki pages                //
        //////////////////////////////////////////

        for (var pageName in registry.smw_page) {

            var page = registry.smw_page[pageName];
            var newPageName = pageName.replace('.wikitext', '');
            newPageName = newPageName.split('___').join(':');   // Namespaces
            newPageName = newPageName.split('---').join('/');   // Subpages

            if (generated[newPageName]) {
                log('>>> [i] Overwriting Site ' + pageName + '');
                generated[newPageName] = page;
            } else {
                generated[newPageName] = page;
            }

            exports.outputStats.page += 1;
        }


        //////////////////////////////////////////
        // GENERATE STRUCTURAL SITES            //
        //////////////////////////////////////////

        // If the HeaderTabs Extension is activated, create a HeaderTabs Helper Template
        if (settings.headerTabs) {
            generated['template:HeaderTabs'] = '<headertabs />';
            exports.outputStats.template += 1;
        }

        registry.generated = generated;

        //////////////////////////////////////////
        // WRITE TO FILE AND REPORT             //
        //////////////////////////////////////////

        // Write Registry to file
        fs.outputFileSync(settings.processedModelDir + '/_registry.json', JSON.stringify(registry, null, 4));

        log(' ' + exports.outputStats.property + ' Properties | ' +
            exports.outputStats.template + ' Templates | ' +
            exports.outputStats.form + ' Forms | ' +
            exports.outputStats.category + ' Categories | ' +
            exports.outputStats.page + ' Pages');
        log('-------------------------------------------------------------------------');

        resolve(registry);

    });

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
exports.callParser = function(settings, generator, data, registry, generated) {

    for (var name in data) {

        var obj = data[name];

        if (!obj || obj === '') {
            log('>>> [W] File ' + name + ' is empty, will not be parsed!');
        } else {

            // Display to-do entry if given
            if (obj.todo && settings.displayTodos) {
                log(' [TODO] ' + obj.id + ': ' + obj.todo);
            }

            // Execute the generator
            var output = generator.exec(settings, obj, name, registry);

            // Iterate over the generated pages, do escaping and statistics
            for (var outputType in output) {

                for (var pageName in output[outputType]) {

                    var escapedName = pageName.replace('.', '-');
                    var fileName = outputType + ':' + escapedName;

                    generated[fileName] = output[outputType][pageName];

                    exports.outputStats[outputType] += 1;
                }
            }
        }
    }

    return generated;

};
