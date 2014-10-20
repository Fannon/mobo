//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs');

var handlebars = require('./../handlebarsExtended');
var logger     = require('./../logger.js');
var log        = logger.log;


//////////////////////////////////////////
// Logic                                //
//////////////////////////////////////////

var formTemplate;

/**
 * Executes the parsing of the forms
 * Will generate SMW Form Sites
 *
 * @param settings
 * @param json
 * @param name
 * @returns {{}}
 */
exports.exec = function(settings, json, name) {

    var returnObject = {
        form: {},
        category: {},
        template: {}
    };

    //////////////////////////////////////////
    // Templates                            //
    //////////////////////////////////////////

    var formTemplateFile = fs.readFileSync(settings.templateDir + 'form.wikitext').toString();
    formTemplate = handlebars.compile(formTemplateFile);


    // Generate Form
    var form = exports.generateForm(json, name, settings);
    if (form) {
        returnObject.form[name] = form;
    }

    // Generate Helper Template that tags the form with a "FormEdit" Category
    if (settings.formEditHelper) {

        var category = exports.generateHelperCategory(json, name, settings);
        if (category) {
            returnObject.category[name + ' FormEdit'] = category;
        }
        var template = exports.generateHelperTemplate(json, name, settings);
        if (template) {
            returnObject.template[name + ' FormEdit'] = template;
        }
    }


    return returnObject;
};

/**
 * Generates Form for all not abstract models
 *
 * @param json
 * @param name
 * @param settings
 * @returns {*}
 */
exports.generateForm = function(json, name, settings) {

    var freetext = true;
    var formEdit = true;

    if (json.smw_formedit === false || settings.formEditHelper === false) {
        formEdit = false;
    }

    if (json.smw_freetext === false) {
        freetext = false;
    }

    if (json.smw_forminfo) {
        console.dir('FORMINFO');
    }

    var data = {
        title: json.title || name,
        name: name,
        description: json.description || false,
        naming: json.naming || false,

        template: [],

        headerTabs: settings.headerTabs,

        freetext: freetext,
        formEdit: formEdit,

        formInput: json.smw_forminput || false,
        formInfo: json.smw_forminfo || false,


        summary: json.smw_summary || false
    };

    for (var modelName in json.properties) {

        var model = json.properties[modelName];

        if (model) {
            var label = true;

            if (!model.items || model.smw_noLabel) {
                label = false;
            }

            if (model.wikitext) {
                data.template.push({
                    multiple: false,
                    name: modelName,
                    title: model.title || modelName,
                    label: label,
                    wikitext: model.wikitext
                });

            } else if (model.template) {

                var showSite = true;
                var showForm = true;

                if (model.showSite === false) {
                    showSite = false;
                }

                if (model.showForm === false) {
                    showForm = false;
                }

                data.template.push({
                    multiple: false,
                    name: model.id,
                    title: model.title || modelName,
                    label: label,
                    template: model.template,
                    showSite: showSite,
                    showForm: showForm
                });

            } else if (model.items) {

                data.template.push({
                    multiple: {
                        minItems: model.items.minItems || 0,
                        maxItems: model.items.maxItems || false
                    },
                    name: modelName,
                    title: model.title || modelName,
                    label: label,
                    model: model.items
                });

            } else {
                data.template.push({
                    multiple: false,
                    name: modelName,
                    title: model.title || modelName,
                    label: label,
                    model: model
                });
            }

        } else {
            log('> [WARNING] Model "' + modelName + '" is no valid model!');
        }

    }

    return formTemplate(data);

};

exports.generateHelperCategory = function(json, name, settings) {

    var wikitext = false;

    if (!json.smw_category && json.smw_category !== false) {

        var categoryTemplateFile = fs.readFileSync(settings.templateDir + 'category.wikitext').toString();
        var categoryTemplate = handlebars.compile(categoryTemplateFile);

        var data = {
            name: name,
            title: json.title || name,
            overview: false,
            template: false,
            hidden: settings.hideFormEditHelper || false,
            form: true
        };

        wikitext = categoryTemplate(data);
    }

    return wikitext;

};

exports.generateHelperTemplate = function(json, name, settings) {

    var wikitext = false;

    if (!json.smw_category && json.smw_category !== false) {
        wikitext = ' [[Category:' + name + ' FormEdit]]';
    }

    return wikitext;

};
