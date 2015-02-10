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
    var moment     = require('moment');

    var moboUtil   = require('./util/moboUtil.js');

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

    data.logfile = JSON.stringify(moboUtil.returnLogObject(), false, 4);

    data.now = moment().format("DD.MM.YYYY HH:mm:ss");

    // Report Self Referencing (hack)
    var nowUrl = moment().format("YYYY-MM-DD_HH-mm-ss");


    returnObj['User:' + data.name] = reportTemplate(data);
    returnObj['User:' + data.name + '/' + nowUrl] = returnObj['User:' + data.name];

    return returnObj;

};
