/**
 * Generates a Report of the mobo activity
 * The report will be generated through a template file and uploaded to the remote wiki
 *
 * @param settings
 * @param data
 */
module.exports = function (settings, data) {

    //////////////////////////////////////////
    // Requirements                         //
    //////////////////////////////////////////

    var fs = require('fs');
    var handlebars = require('handlebars');
    var moment = require('moment');

    var logger         = require('./logger.js');
    var log            = logger.log;


    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var reportTemplateFile = fs.readFileSync(settings.templateDir + 'report.wikitext').toString();
    var reportTemplate = handlebars.compile(reportTemplateFile);


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

    data.logfile = JSON.stringify(log('__return__'), false, 4);

    data.now = moment().format("DD.MM.YYYY HH:mm:ss");

    // Report Self Referencing (hack)
    var nowUrl = moment().format("YYYY-MM-DD_HH-mm-ss");


    returnObj['Benutzer:' + data.name] = reportTemplate(data);
    returnObj['Benutzer:' + data.name + '/' + nowUrl] = returnObj['Benutzer:' + data.name];

    return returnObj;

};
