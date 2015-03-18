//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var moboSchema   = require('./../moboSchema');
var moboUtil     = require('./moboUtil');
var log          = moboUtil.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Helper Function that reads the current JSON Schema objects for validation
 * and generates a simple markdown document.
 * This is necessary since the JSON Schema objects are calculated in JavaScript, using inheritance.
 */
exports.writeSchemas = function() {

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

    var schemaName = '';
    var fullSchema = {};
    var specificSchema = {};
    var fileName = '';
    var fileContent = '';
    var files = {};

    for (var i = 0; i < schemaExports.length; i++) {

        schemaName = schemaExports[i];
        specificSchema = moboSchema[schemaName + 'SchemaAdditions'];
        fullSchema = moboSchema[schemaName + 'Schema'];

        fileName = path.resolve(dir, './' + schemaName + '/SCHEMA.md');
        fileContent  = '# ' + schemaName.toUpperCase() + ' JSON Schema\n';
        fileContent += '> Read this file online at GitHub: [' + schemaName + '/README.md](https://github.com/Fannon/mobo/blob/master/examples/init/' + schemaName + '/SCHEMA.md)\n\n';
        fileContent += 'This file documents all available attributes mobo will use and validate for your ' + schemaName + 's.\n';

        // type specific properties
        fileContent += '\n## ' + schemaName + ' specific properties\n';
        fileContent += 'These properties will only work in context of ' + schemaName + 's.\n';
        fileContent += exports.convertSchemaToTable(specificSchema);

        // mobo specific properties
        fileContent += '\n## mobo specific properties\n';
        fileContent += 'These mobo custom properties are global and can be used for fields, models and forms. \n';
        fileContent += exports.convertSchemaToTable(moboSchema.moboJsonSchemaAdditions);

        // mobo specific properties
        fileContent += '\n## Unsupported JSON Schema Core features\n';
        fileContent += 'These features / properties of JSON Schema Core are not supported by mobo: \n';
        fileContent += exports.convertSchemaToTable(moboSchema.jsonSchemaCoreRemovals);

        // Complete JSON Schema
        fileContent += '\n## Complete JSON Schema\n';
        fileContent += 'This is the final JSON Schema, including a simplified JSON Schema core and all mobo and ' + schemaName + ' specific addons / changes. \n';
        fileContent +=  '```json\n' + JSON.stringify(fullSchema, false, 4) + '\n```\n';

        log(' [i] Writing ' + fileName);
        fs.outputFileSync(fileName, fileContent);
        files[fileName] = fileContent;
    }

    // Write settings.json documentation
    fileName = path.resolve(dir, './settings.md');

    fileContent  = '## settings.json documentation \n';
    fileContent += '> Read this file online at GitHub: [form/README.md](https://github.com/Fannon/mobo/blob/master/examples/settings.md) \n\n';
    fileContent += 'This file documents all available options for the settings.json and their defaults. \n\n';
    fileContent += exports.convertSchemaToTable(moboSchema.settingsSchema);

    fileContent += '\n## Default settings\n';
    fileContent += 'These are the default settings that mobo comes with:\n\n';
    fileContent +=  '```json\n' + JSON.stringify(settings, false, 4) + '\n```\n';

    log(' [i] Writing ' + fileName);
    fs.outputFileSync(fileName, fileContent);
    files[fileName] = fileContent;

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

    var html = '';

    if (schema.properties) {

        html += '<table class="schema-description">\n';

        html += '   <thead>\n';
        html += '       <tr>\n';
        html += '           <th><sub>ID</sub></th>\n';
        html += '           <th><sub>Type</sub></th>\n';
        html += '           <th><sub>Default</sub></th>\n';
        html += '           <th><sub>Description</sub></th>\n';
        html += '       </tr>\n';
        html += '   </thead>\n';
        html += '   <tbody>\n';

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

        html += '   </tbody>\n';
        html += '</table>\n';
    }

    return html;
};