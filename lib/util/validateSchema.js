//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var tv4         = require('tv4');

var moboSchema   = require('./../moboSchema');
var moboUtil     = require('./moboUtil');
var log          = moboUtil.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

/**
 * Validates the mobo registry against the mobo JSON Schema
 *
 * @param {object}  registry mobo registry
 *
 * @returns {{}}
 */
exports.validateRegistry = function (registry) {
    'use strict';

    var registryTypes = ['field', 'model', 'form'];

    // Iterate registry types
    for (var type = 0; type < registryTypes.length; type++) {
        var elements = registry[type];

        // Iterate each element of a type and validate it
        for (var elName in elements) {
            var json = elements[elName];
            var schema = moboSchema[type + 'Schema'];
            var id = json.$filepath || json.id || '(unknown)';

            // Hard mobo Requirements
            if (!json.title) {
                log(' [E] [JSON Structure] ' + type + ' "' + id + '" has no title property!');
            }

            exports.validate(json, schema);
        }
    }
};

/**
 * Validates a settings object against mobos settings schema
 *
 * @param {object} settings
 *
 * @returns {Object} validation result
 */
exports.validateSettings = function (settings) {
    return exports.validate(settings, moboSchema.settingsSchema);
};

/**
 * Wrapper around a JSON Schema Validator, uses tv4
 * Uses promise pattern and mobo style error / warning messages
 *
 * @see https://www.npmjs.com/package/tv4)
 *
 * @param {object}  json
 * @param {object}  schema
 *
 * @returns {object} result object
 */
exports.validate = function (json, schema) {

    var id = json.$filepath || json.id || '(unknown)';

    // Validate with the tv4 JSON Schema Validator Library
    // Use multiple option to catch and report multiple errors in one json object
    var result = tv4.validateMultiple(json, schema);

    if (!result.valid || result.errors.length > 0) {
        for (var i = 0; i < result.errors.length; i++) {

            var error = result.errors[i];

            if (error.schemaPath === '/additionalProperties') {
                // Unsupported additional Properties throw only a warning
                log(' [W] [JSON Structure] ' + id + ' > Unsupported property ' + error.dataPath);
            } else {
                log(' [E] [JSON Structure] ' + id + ' > ' + error.message);
                delete error.stack; // Delete the error stack since it's not very helpful and cluttering the console
                log(error);
            }
        }
    }

    return result;

};

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
        fileContent  = '# ' + schemaName.toUpperCase() + ' JSON SCHEMA\n\n';
        fileContent += 'This file documents all properties mobo will use and validate for your ' + schemaName + 's.\n\n';
        fileContent += 'They are described in the JSON Schema format. \n';
        fileContent += 'For descriptions and default, look for the corresponding properties. \n';

        // type specific properties
        fileContent += '\n## ' + schemaName + ' specific properties\n';
        fileContent += 'These properties will only work in context of ' + schemaName + 's.\n';
        fileContent +=  '```json\n' + JSON.stringify(specificSchema.properties, false, 4) + '\n```\n';

        // mobo specific properties
        fileContent += '\n## mobo specific properties\n';
        fileContent += 'These mobo custom properties are global and can be used for fields, models and forms. \n';
        fileContent +=  '```json\n' + JSON.stringify(moboSchema.moboJsonSchemaAdditions.properties, false, 4) + '\n```\n';

        // mobo specific properties
        fileContent += '\n## Unsupported JSON Schema Core features\n';
        fileContent += 'These features / properties of JSON Schema Core are not supported by mobo: \n';
        fileContent +=  '```json\n' + JSON.stringify(moboSchema.jsonSchemaCoreRemovals, false, 4) + '\n```\n';

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
    fileContent = '## settings.json documentation \n';
    fileContent += 'This file documents all available options for the settings.json and their defaults. \n\n';
    fileContent +=  '```json\n' + JSON.stringify(moboSchema.settingsSchema.properties, false, 4) + '\n```\n';
    fileContent += '\n## Default settings\n';
    fileContent += 'These are the default settings that mobo comes with:\n\n';
    fileContent +=  '```json\n' + JSON.stringify(settings, false, 4) + '\n```\n';

    log(' [i] Writing ' + fileName);
    fs.outputFileSync(fileName, fileContent);
    files[fileName] = fileContent;

    return files;
};
