/**
 * Generates a Report of the mobo activity
 * The report will be generated through a template file and uploaded to the remote wiki
 *
 * TODO: Integrate this smarter or throw it away.
 *
 * @param settings
 * @param data
 */
module.exports = function (settings, data) {


    //////////////////////////////////////////
    // Requirements                         //
    //////////////////////////////////////////

    var fs         = require('fs');
    var handlebars = require('handlebars');

    var moboUtil   = require('./../util/moboUtil.js');

    // Inject the current settings into the template engine
    handlebars.setMoboSettings(settings);


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var reportTemplateFile = fs.readFileSync(settings.templateDir + 'report.wikitext').toString();
    var reportTemplate     = handlebars.compile(reportTemplateFile);


    //////////////////////////////////////////
    // Logic                                //
    //////////////////////////////////////////

    var returnObj = {};

    if (Object.keys(data.removed).length === 0) {
        data.removed = false;
    }

    if (Object.keys(data.changed).length === 0) {
        data.changed = false;
    }

    if (Object.keys(data.added).length === 0) {
        data.added = false;
    }

    data.logfile = JSON.stringify(moboUtil.getLogHistory(), false, 4);

    data.now = moboUtil.humanDate();

    returnObj['User:' + data.name] = reportTemplate(data);

    return returnObj;

};
