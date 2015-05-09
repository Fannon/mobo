//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var _     = require('lodash');

var moboUtil   = require('./../util/moboUtil');


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * TODO: Sort the registry first!
 *
 * @param   {object}    settings
 * @param   {object}    registry
 *
 * @returns {object}    generated wikipages
 */
exports.exec = function(settings, registry) {
    'use strict';

    exports.outlineTemplate = moboUtil.loadTemplate(exports, 'outline.wikitext', settings);

    //////////////////////////////////////////
    // Statistics                           //
    //////////////////////////////////////////

    var statistics = '';

    for (var statName in registry.statistics.outputStats) {
        statistics += '* ' + statName + ': ' + registry.statistics.outputStats[statName] + '\n';
    }


    //////////////////////////////////////////
    // Tree Outline                         //
    //////////////////////////////////////////

    var tree = '';

    // Iterate Forms alphabetically
    var sortedFormKeys = _.sortBy(_.keys(registry.expandedForm), function(a) { return a; });

    for (var i = 0; i < sortedFormKeys.length; i++) {
        var formName = sortedFormKeys[i];
        var form = registry.expandedForm[formName];

        if (!form.abstract) {

            // Print form info
            tree += '\n===[[Form:' + formName + ']] <span class="text-muted"> - ' + form.title + '</span>===\n';

            // Iterate models
            for (var modelName in form.properties) {
                var model = form.properties[modelName];
                if (!model.abstract && model.properties) {

                    // Print model info
                    var modelStats = ' <span class="text-muted"> - ' + model.title + '</span>';

                    if (settings.uploadOutlineCountRefs) {
                        var modelReferences = model.$referenceCounter || 1;
                        modelStats += ' <span class="label label-warning">' + modelReferences + '</span>';
                    }

                    tree += '* [[Template:' + modelName + ']]' + modelStats + '\n';

                    // Iterate fields
                    for (var fieldName in model.properties) {

                        // TODO: Analyzing fields could happen on a global level, saved then as metadata
                        var field = model.properties[fieldName];
                        var analyze = field.items || field;

                        if (!field.abstract) {

                            var type = analyze.type;
                            var format = [];
                            if (analyze.format) {
                                format.push(analyze.format);
                            }

                            if (analyze.oneOf) {
                                type = analyze.oneOf[0].type;
                                format = [];
                                for (var j = 0; j < analyze.oneOf.length; j++) {
                                    format.push(analyze.oneOf[j].format);
                                }
                            }

                            // Print field info
                            var fieldStats = ' <span class="text-muted"> - ' + field.title + '</span>';

                            if (settings.uploadOutlineCountRefs) {
                                fieldStats += ' <span class="label label-warning">' + (field.$referenceCounter || 1) + '</span>';
                            }

                            if (field.items) {
                                fieldStats += ' <span class="label label-danger">multiple</span>';
                            }

                            fieldStats += ' <span class="label label-primary">' + type + '</span>';

                            for (var k = 0; k < format.length; k++) {
                                fieldStats += ' <span class="label label-info">' + format[k] + '</span>';
                            }

                            tree += '** [[Property:' + fieldName + ']]' + fieldStats + '\n';
                        }
                    }
                }
            }
        }
    }

    return exports.outlineTemplate({
        statistics: statistics,
        tree: tree
    });
};
