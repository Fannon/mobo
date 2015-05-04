//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var moboSchema   = require('./../moboSchema');
var moboUtil     = require('./moboUtil');
var semlog     = require('semlog');
var log        = semlog.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Helper Function that reads the current JSON Schema objects for validation
 * and generates a simple markdown document.
 * This is necessary since the JSON Schema objects are calculated in JavaScript, using inheritance.
 */
exports.writeSchemas = function() {
    'use strict';

    // Requirements are function specific, because this function is very rarely called at all
    var fs = require('fs-extra');
    var path = require('path');
    var settings = require('./../settings.json');

    var dir = path.resolve(__dirname, '../../examples/init');
    var schemaExports = [
        'field',
        'model',
        'form'
    ];

    var files = {};


    //////////////////////////////////////////
    // MOBO-MODEL SPECIFIC DOCUMENTATION    //
    //////////////////////////////////////////

    // Load (internal) templates
    var moboModelTemplate = moboUtil.loadTemplate(exports, 'moboModel.md', settings, true);
    var settingsTemplate = moboUtil.loadTemplate(exports, 'settings.md', settings, true);

    for (var i = 0; i < schemaExports.length; i++) {

        var schemaName = schemaExports[i];
        var specificSchema = moboSchema[schemaName + 'SchemaAdditions'];
        var fullSchema = moboSchema[schemaName + 'Schema'];
        var fileName = path.resolve(dir, './' + schemaName + '/SCHEMA.md');

        var fileContent = moboModelTemplate({
            schemaName: schemaName,
            specificSchema: exports.convertSchemaToTable(specificSchema),
            fullSchema: JSON.stringify(fullSchema, false, 4),
            moboJsonSchemaAdditions: exports.convertSchemaToTable(moboSchema.moboJsonSchemaAdditions),
            jsonSchemaCoreRemovals:exports.convertSchemaToTable(moboSchema.jsonSchemaCoreRemovals)
        });


        log('[i] Writing ' + fileName);
        fs.outputFileSync(fileName, fileContent);
        files[fileName] = fileContent;
    }


    //////////////////////////////////////////
    // SETTINGS.JSON DOCUMENTATION          //
    //////////////////////////////////////////

    fileName = path.resolve(dir, './settings.md');

    var settingsFileContent = settingsTemplate({
        settingsTable: exports.convertSchemaToTable(moboSchema.settingsSchema),
        defaultSettings: JSON.stringify(settings, false, 4)
    });

    log('[i] Writing ' + fileName);
    fs.outputFileSync(fileName, settingsFileContent);
    files[fileName] = settingsFileContent;

    return files;
};

/**
 * Converts JSON Schema to simple HTML tables
 * This works recursively, so tables can be stacked into tables.
 * This will only make sense until a certain point of course.
 *
 * @param schema        JSON Schema
 * @returns {string}    HTML table
 */
exports.convertSchemaToTable = function(schema) {
    'use strict';

    var html = '';

    if (schema.properties) {

        html += '<table class="schema-description">\n   <thead>\n       <tr>\n';

        html += '           <th><sub>ID</sub></th>\n';
        html += '           <th><sub>Type</sub></th>\n';
        html += '           <th><sub>Default</sub></th>\n';
        html += '           <th><sub>Description</sub></th>\n';

        html += '       </tr>\n   </thead>\n   <tbody>\n';

        for (var propertyName in schema.properties) {

            if (propertyName === 'additionalProperties') {
                continue;
            }

            var property = schema.properties[propertyName];
            var type = property.type || '';

            var defaultValue = property['default'];
            if (defaultValue === undefined) {
                defaultValue = '';
            }

            var description = property.description || '';

            if (property.properties) {
                description = exports.convertSchemaToTable(property);
            }

            html += '       <tr>\n';
            html += '           <td><sub>' + propertyName + '</sub></td>\n';
            html += '           <td><sub>' + type + '</sub></td>\n';
            html += '           <td><sub>' + defaultValue + '</sub></td>\n';
            html += '           <td><sub>' + description + '</sub></td>\n';
            html += '       </tr>\n';

        }

        html += '   </tbody>\n</table>\n';
    }

    return html;
};
