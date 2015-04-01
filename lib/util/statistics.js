//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                = require('fs-extra');
var path              = require('path');

var moboUtil     = require('./moboUtil');
var log          = moboUtil.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Calculates statistics from the registry object
 * They will be displayed in the CLI and stored to the logfiles
 *
 * @param {{}} settings
 * @param {{}} registry
 */
exports.registryStatistics = function(settings, registry) {
    'use strict';

    exports.settings = settings;


    //////////////////////////////////////////
    // CALCULATE STATISTICS                 //
    //////////////////////////////////////////

    /**
     * The Development model as it is written by the user
     */
    var devModel = {
        field: registry.field,
        model: registry.model,
        form: registry.form,
        smw_template: registry.smw_template,
        smw_query: registry.smw_query,
        smw_page: registry.smw_page
    };

    /**
     * The processed model with inheritance and further processing applied.
     * Only count the expandedForm, since it already includes the fields and models!
     */
    var processedModel = {
        expandedForm: registry.expandedForm,
        smw_template: registry.smw_template,
        smw_query: registry.smw_query,
        smw_page: registry.smw_page
    };

    // Calculate the Input Model Size
    var inputStats = {
        field: Object.keys(registry.field).length,
        model: Object.keys(registry.model).length,
        form: Object.keys(registry.form).length,
        smw_template: Object.keys(registry.smw_template).length,
        smw_query: Object.keys(registry.smw_query).length,
        smw_page: Object.keys(registry.smw_page).length
    };

    // Output statistics have already been calculated.
    var outputStats = registry.statistics.outputStats;

    // Calculate the complexity of the model in its various stages (in character length)
    var complexity = {
        devModelSize: JSON.stringify(devModel).length,
        processedModelSize: JSON.stringify(processedModel).length,
        generatedSize: JSON.stringify(registry.generated).length
    };

    // Calculate the difference to the development model in percentage

    complexity.processedModelPercentage = Math.round(
        (complexity.processedModelSize / complexity.devModelSize) * 1000) / 10;
    complexity.generatedPercentage = Math.round(
        (complexity.generatedSize / complexity.devModelSize) * 1000) / 10;

    //////////////////////////////////////////
    // PRINT STATISTICS                     //
    //////////////////////////////////////////

    // INPUT STATISTICS
    exports.printStatistics(' IN:    ', {
        'Fields': inputStats.field,
        'Models': inputStats.model,
        'Forms': inputStats.form,
        'Templates': inputStats.smw_template,
        'Queries': inputStats.smw_query,
        'Pages': inputStats.smw_page
    });

    // OUTPUT STATISTICS
    exports.printStatistics(' OUT:   ', {
        'Properties': outputStats.property,
        'Templates': outputStats.template,
        'Forms': outputStats.form,
        'Categories': outputStats.category,
        'Pages': outputStats.page
    });

    // COMPLEXITY STATISTICS
    exports.printStatistics(' COMPL: ', {
        'DevModel': moboUtil.prettyNumber(complexity.devModelSize),
        'ProcModel': moboUtil.prettyNumber(complexity.processedModelSize) + ' (' + complexity.processedModelPercentage + '%)',
        'Result': moboUtil.prettyNumber(complexity.generatedSize) + ' (' + complexity.generatedPercentage + '%)'
    });

    registry.statistics.inputStats = inputStats;
    registry.statistics.complexity = complexity;

    //////////////////////////////////////////
    // LOG STATISTICS TO FILE               //
    //////////////////////////////////////////

    exports.writeStatistics(registry.statistics, settings.processedModelDir);

    return registry;
};

/**
 * Prints a statistic object to the console output
 * @param prefix
 * @param statObj
 */
exports.printStatistics = function(prefix, statObj) {

    var print = prefix;
    var separator = ', ';
    for (var key in statObj) {
        var value = statObj[key];
        print += value + ' ' + key + separator;
    }

    log(print.substring(0, print.length - separator.length)); // Omit last separator
    log('--------------------------------------------------------------------------------');
};

/**
 * Writes the statistics object to the logfile and a CSV history
 *
 * @param {{}}      statistics
 * @param {string}  directory
 */
exports.writeStatistics = function(statistics, directory) {

    // To Logobject / report
    log(statistics, true);

    // To CSV File (/_processed/_statistics.csv)
    var statisticsCsvPath = path.join(directory, '/_statistics.csv');
    var header = ['timestamp', 'date'];
    var content = [exports.start, moboUtil.humanDate()];

    // Convert the statistics object to two flattened arrays
    // They will be used to generate the csv file
    for (var statCategory in statistics) {
        for (var statName in statistics[statCategory]) {
            var statValue = statistics[statCategory][statName];
            header.push(statCategory + '_' + statName);
            content.push(statValue);
        }
    }

    try {

        // If file does not exist, create it with the header first
        if (!fs.existsSync(statisticsCsvPath)) {
            fs.outputFileSync(statisticsCsvPath, header.join(';') + '\n');
        }

        // Append to CSV Value
        var file = fs.openSync(statisticsCsvPath, 'a'); // Append only
        fs.writeSync(file, content.join(';') + '\n');

    } catch (e) {
        log(' [E] Could not write statistics to ' + statisticsCsvPath);
    }
};

