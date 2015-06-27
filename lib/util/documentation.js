//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var moboSchema   = require('./../schema/moboSchema');
var moboUtil     = require('./moboUtil');
var semlog     = require('semlog');
var log        = semlog.log;
var _ = require('lodash');


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

    var dir = path.resolve(process.cwd(), './_code/schemas');

    var schemaExports = [
        'field',
        'model',
        'form'
    ];

    var files = {};

    try {

        //////////////////////////////////////////
        // MOBO-MODEL SPECIFIC DOCUMENTATION    //
        //////////////////////////////////////////
        for (var i = 0; i < schemaExports.length; i++) {
            var specificSchema = moboSchema[schemaExports[i] + 'Schema'];
            var specificSchemaAdditions = moboSchema[schemaExports[i] + 'SchemaAdditions'];
            files[schemaExports[i] + '-schema.md'] = exports.convertSchemaToTable(specificSchema);
            files[schemaExports[i] + '-schema-additions.md'] = exports.convertSchemaToTable(specificSchemaAdditions);
            files[schemaExports[i] + '-schema.json'] = '```json\n' + JSON.stringify(specificSchema, null, 4) + '\n```';
        }


        //////////////////////////////////////////
        // Global Schemas DOCUMENTATION         //
        //////////////////////////////////////////

        // Settings
        files['settings.md'] = exports.convertSchemaToTable(moboSchema.settingsSchema);

        // Default Settings
        files['default-settings.md'] = '```json\n' + JSON.stringify(settings, null, 4) + '\n```';

        // Mobo Schema Additions
        files['mobo-schema-additions.md'] = exports.convertSchemaToTable(moboSchema.moboJsonSchemaAdditions);
        files['mobo-schema.md'] = exports.convertSchemaToTable(moboSchema.moboJsonSchema);
        files['mobo-schema.json'] = '```json\n' + JSON.stringify(moboSchema.moboJsonSchema, null, 4) + '\n```';

        //jsonSchemaCoreRemovals
        files['mobo-schema-removals.md'] = '```json\n' + JSON.stringify(moboSchema.jsonSchemaCoreRemovals, null, 4) + '\n```';

        // Programmatic import example
        var importExample = fs.readFileSync(__dirname + '/../../examples/hardware/import/data/import.js');
        files['programmatic-import-example.md'] = '```javascript\n' + importExample + '\n```';

    } catch (e) {
        log('[E] Could not write schema documentation!');
        log(e);
    }

    for (var fileName in files) {
        var filePath = path.resolve(dir, './' + fileName);
        fs.outputFileSync(filePath, files[fileName]);
        log('[i] Written ' + filePath);
    }


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

        var order = Object.keys(schema.properties).sort();
        var descriptionColumn = false;
        var defaultColumn = false;
        var specificColumn = false;

        for (var i = 0; i < order.length; i++) {
            var prop = schema.properties[order[i]];

            if (prop.description || prop.link || prop.enum) {
                descriptionColumn = true;
            }
            if (prop['default'] || prop['default'] === false) {
                defaultColumn = true;
            }
            if (prop.specific) {
                specificColumn = true;
            }
        }

        html += '<table class="schema-table" style="font-size: 0.75em;">\n   <thead>\n       <tr>\n';

        html += '           <th>ID</th>\n';
        html += '           <th>Type</th>\n';
        if (defaultColumn) {
            html += '           <th>Default</th>\n';
        }
        if (descriptionColumn) {
            html += '           <th>Description</th>\n';
        }
        if (specificColumn) {
            html += '           <th>Specific</th>\n';
        }
        html += '       </tr>\n   </thead>\n   <tbody>\n';


        for (i = 0; i < order.length; i++) {
            var propertyName = order[i];
            var property = schema.properties[propertyName];

            if (propertyName === 'additionalProperties') {
                continue;
            }
            if (property.internal) {
                continue;
            }

            // If no specific property is given, assume 'domain'
            var specific = property.specific || 'domain';

            var typeHtml = '';

            // Types (tags)
            if (!property.type) {
                property.type = [];
            }
            if (!_.isArray(property.type)) {
                property.type = [property.type];
            }
            property.type.sort();
            for (var j = 0; j < property.type.length; j++) {
                var type = property.type[j];
                typeHtml += '<span class="schema-type schema-type-' + type + '">' + type + '</span>';
            }

            // Default
            var defaultValue = property['default'];
            if (defaultValue === undefined || defaultValue === null) {
                defaultValue = '';
            } else {
                defaultValue = JSON.stringify(defaultValue, null, 4);
            }

            var description = property.description || '';

            if (property.properties) {
                description += '<br/>' + exports.convertSchemaToTable(property);
            }

            if (property.link) {
                description += '<p class="schema-link"><strong>External Link</strong>: <a href="' + property.link + ' target="_blank">Documentation</a></p>';
            }

            if (property.enum) {
                description += '<p class="schema-enum"><strong>Valid entries</strong>: ' + property.enum.join(', ') + '</p>';
            }

            if (property.example) {
                if (!_.isArray(property.example)) {
                    property.example = [property.example];
                }
                for (var p = 0; p < property.example.length; p++) {
                    var example = property.example[p];
                    description += '<pre class="schema-example"><code>' + example + '</code></pre>';
                }

            }

            html += '       <tr>\n';
            html += '           <td class="schema-propertyName">' + propertyName + '</td>\n';
            html += '           <td class="schema-propertyType">' + typeHtml + '</td>\n';
            if (defaultColumn) {
                html += '           <td class="schema-defaultValue">' + defaultValue + '</td>\n';
            }
            if (descriptionColumn) {
                html += '           <td class="schema-description">' + description + '</td>\n';
            }
            if (specificColumn) {
                html += '           <td class="schema-specific schema-specific-' + specific + '">' + specific + '</td>\n';
            }
            html += '       </tr>\n';

        }

        html += '   </tbody>\n</table>\n';
    }

    return html;
};
