exports.exec = function(fileMap, importHelper, lib, registry, callback) {


    //////////////////////////////////////
    // Imports                          //
    //////////////////////////////////////

    // The lib object contains some useful, injected libraries
    // It is also possible to install local npm modules into the current dir and require() them

    var log   = exports.log = lib.semlog.log; // https://www.npmjs.com/package/semlog
    var chalk = lib.semlog.chalk;             // https://www.npmjs.com/package/chalk
    var _     = exports._   = lib.lodash;     // https://www.npmjs.com/package/lodash
    var yaml  = lib['js-yaml'];               // https://www.npmjs.com/package/js-yaml


    //////////////////////////////////////
    // Documentation                    //
    //////////////////////////////////////

    /**
     * Object, containing all generated pages
     * The key is the wiki pagename
     * the value is a string of the wikitext result
     */
    var generatedPages = {};

    // The fileMap Object contains all files within the current import folder.
    // The key is the filename, the value is the content
    // If it is a JSON file, the value is already a JavaScript object
    log('[D] Found files: ' + Object.keys(fileMap).join(', '));

    // The import Helper contains some useful helper functions
    // They assist in creating wikitext.
    // If a mobo development model is available it also allows for:
    // * Automatic validation of the imported data
    // * Automatic completion /
    log('[D] Available helper functions: ' + Object.keys(importHelper).join(', '));

    // The registry object contains the complete mobo registry object
    // It contains:
    // * The development model in its original state
    // * The intermediary (expanded) model
    // * The current settings
    // * Statistics
    // * The generated wikitext
    // * ...
    log('[D] Found Registry, containing: ' + Object.keys(registry).join(', '))
    log('[D] Current Working Directory: ' + registry.settings.cwd);


    //////////////////////////////////////
    // Simple Data Import               //
    //////////////////////////////////////

    // Simplest case: Just add wikitext to the generatedPages Object:
    var wikitext = '==Automatically imported Page==\n';
    wikitext    += 'With some minor logic: ' + Math.random() * 5000;
    generatedPages['Import Test Page'] = wikitext;

    // Pages on the blacklist (see import.yaml) will be ignored
    generatedPages['Ignored Page'] = 'Will be ignored, because of the blacklist (see import.yaml)';


    //////////////////////////////////////
    // Advanced Data Import             //
    //////////////////////////////////////

    // Advanced case: Import data into existing wiki structure and automatically validate / enhance
    // Using random locations from http://beta.json-generator.com/CQJneWj

    // Deliberatly sabotage one dataset: (The validation will notice and give feedback)
    fileMap.exampleData[2].streetNumber = 'invalid number';

    // Iterate the exampleData:
    for (var i = 0; i < fileMap.exampleData.length; i++) {

        var data = fileMap.exampleData[i];

        // Calculate the page name
        var pageName = data.streetAdress + ' ' + data.streetNumber;

        log('--------------------------------------------------------------------');
        log('Importing random data: ' + pageName);
        log('--------------------------------------------------------------------');

        // Create a new collection that will be transformed into the final wiki page
        var locationColl = [];

        // Add a Location Template
        locationColl.push({
            name: 'Location',
            template: {
                streetAdress: data.streetAdress,
                streetNumber: data.streetNumber,
                town: data.town
            }
        });

        // Add a Headertabs Template (without content)
        locationColl.push({
            name: 'HeaderTabs'
        });

        locationColl.push('==Some arbitrary wikitext==');
        locationColl.push('Will be appended at the bottom');

        // Validate the Location Collection against the models in the registry
        importHelper.validate(locationColl, registry);

        // Enhance the Location Collection through Location form
        // This rearranges the order of the templates and adds empty template if they need to be added
        var locationEnhColl = importHelper.enhanceWithForm(locationColl, registry.expandedForm.Location);

        // Convert the (enhanced) objColletion to wikitext
        var locationWikitext = importHelper.objCollectionToWikitext(locationEnhColl);

        log('[i] Resulting wikitext:');
        log(locationWikitext);

        // Add the page to the generated page object
        generatedPages[pageName] = locationWikitext;

    };

    // Execute the callback when the import is completed.
    // This allows to use async actions like AJAX within the import script
    // The first parameter is the error object, the second the generated Pages Object
    return callback(false, generatedPages);
};