//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var moboUtil   = require('./../util/moboUtil');


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Executes the parsing of queries
 * Will generate SMW templates
 *
 * @param   {object}    settings
 * @param   {object}    registry
 *
 * @returns {object}    generated wikipages
 */
exports.exec = function(settings, registry) {
    'use strict';

    exports.reportTemplate = moboUtil.loadTemplate(exports, 'report', settings);

    var uploaded = registry.uploaded || {};
    var logfile = 'No logfile uploaded. @See "uploadLogFile" setting.';

    if (settings.uploadLogFile) {
        logfile = JSON.stringify(moboUtil.getLogHistory(), false, 4);
    }

    return exports.reportTemplate({
        now: registry.statistics.$mobo.date,
        added: uploaded.added || 0,
        changed: uploaded.changed || 0,
        removed: uploaded.removed || 0,
        logfile: logfile,
        statistics: JSON.stringify(registry.statistics, false, 4)
    });
};
