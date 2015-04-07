//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs          = require('fs-extra');
var path        = require('path');
var _           = require('lodash');

var moboUtil    = require('./moboUtil');
var log         = moboUtil.log;


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

    // Calculate the Input Model Size (in numbers of files)
    var inputStats = {
        field: Object.keys(registry.field).length,
        model: Object.keys(registry.model).length,
        form: Object.keys(registry.form).length,
        smw_template: Object.keys(registry.smw_template).length,
        smw_query: Object.keys(registry.smw_query).length,
        smw_page: Object.keys(registry.smw_page).length
    };

    // Calculate total inputStats
    inputStats.total = 0;
    for (var categoryName in inputStats) {
        inputStats.total += inputStats[categoryName];
    }

    // Output statistics have already been calculated.
    var outputStats = registry.statistics.outputStats;

    // Graph statistics
    var graphStats = {
        nodes: _.size(registry.graph.nodes) || 0,
        edges: _.size(registry.graph.edges) || 0
    };

    var complexity = {
        devModelSize: registry.statistics.inputSize.total,
        processedModelSize: JSON.stringify(processedModel).length,
        generatedSize: JSON.stringify(registry.generated).length
    };

    // Calculate the difference to the development model in percentage
    complexity.processedModelPercentage = Math.round((complexity.processedModelSize / complexity.devModelSize) * 1000) / 10;
    complexity.generatedPercentage = Math.round((complexity.generatedSize / complexity.devModelSize) * 1000) / 10;


    //////////////////////////////////////////
    // PRINT STATISTICS                     //
    //////////////////////////////////////////

    // INPUT STATISTICS
    exports.printStatistics(' IN:    ', {
        'Field': inputStats.field,
        'Model': inputStats.model,
        'Form': inputStats.form,
        'Template': inputStats.smw_template,
        'Query': inputStats.smw_query,
        'Page': inputStats.smw_page
    });

    // OUTPUT STATISTICS
    exports.printStatistics(' OUT:   ', {
        'Property': outputStats.property,
        'Template': outputStats.template,
        'Form': outputStats.form,
        'Category': outputStats.category,
        'Page': outputStats.page
    });

    // COMPLEXITY STATISTICS
    exports.printStatistics(' COMPL: ', {
        'DevM': moboUtil.prettyNumber(complexity.devModelSize),
        'ProcM': moboUtil.prettyNumber(complexity.processedModelSize) + ' (' + complexity.processedModelPercentage + '%)',
        'Final': moboUtil.prettyNumber(complexity.generatedSize) + ' (' + complexity.generatedPercentage + '%)'
    });

    // GRAPH STATISTICS
    if (settings.buildGraph) {
        exports.printStatistics(' GRAPH: ', {
            'Node': graphStats.nodes,
            'Edge': graphStats.edges
        });
    }


    //////////////////////////////////////////
    // LOG STATISTICS TO FILE               //
    //////////////////////////////////////////

    registry.statistics.inputStats = inputStats;
    registry.statistics.graphStats = graphStats;
    registry.statistics.complexity = complexity;

    return registry;
};

/**
 * Prints a statistic object to the console output
 * @param prefix
 * @param statObj
 */
exports.printStatistics = function(prefix, statObj) {

    var print = prefix;
    var separator = ' | ';
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
    var statisticsJsonPath = path.join(directory + '/_statistics.json');

    var header = [];
    var content = [];
    
    var statisticsSortedOrder = Object.keys(statistics).sort();

    // Convert the statistics object to two flattened arrays
    // They will be used to generate the csv file
    // Categories and subcategories will be sorted alphabetically
    for (var i = 0; i < statisticsSortedOrder.length; i++) {
        var statCategory = statisticsSortedOrder[i];
        var statSortedOrder = Object.keys(statistics[statCategory]).sort();

        for (var j = 0; j < statSortedOrder.length; j++) {
            var statName = statSortedOrder[j];
            var statValue = statistics[statCategory][statName];
            header.push('"' + statCategory + '_' + statName + '"');
            content.push('"' + statValue + '"'); // Use , for separating numbers in excel
        }
    }

    // Write / append statistics to historical CSV file
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

    // Write _statistics.json file that contains only the latest statistics
    try {
        fs.outputFile(statisticsJsonPath, JSON.stringify(statistics, null, 4));
    } catch (e) {
        log(' [E] Could not write statistics to ' + statisticsJsonPath);
        log(e);
    }
};
