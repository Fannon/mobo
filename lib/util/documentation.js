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
            var specificSchema = moboSchema[schemaExports[i] + 'SchemaAdditions'];
            files[schemaExports[i] + '-schema.md'] = exports.convertSchemaToTable(specificSchema);
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

        //jsonSchemaCoreRemovals
        files['mobo-schema-removals.md'] = '```json\n' + JSON.stringify(moboSchema.jsonSchemaCoreRemovals, null, 4) + '\n```';

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

        for (var i = 0; i < order.length; i++) {
            var prop = schema.properties[order[i]];

            if (prop.description) {
                descriptionColumn = true;
            }
            if (prop['default']) {
                defaultColumn = true;
            }
        }

        html += '<table class="schema-table" style="font-size: 0.75em; word-wrap: break-word;">\n   <thead>\n       <tr>\n';

        html += '           <th>ID</th>\n';
        html += '           <th>Type</th>\n';
        if (defaultColumn) {
            html += '           <th>Default</th>\n';
        }
        if (descriptionColumn) {
            html += '           <th>Description</th>\n';
        }
        html += '       </tr>\n   </thead>\n   <tbody>\n';


        for (i = 0; i < order.length; i++) {
            var propertyName = order[i];

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
                description += '<br/>' + exports.convertSchemaToTable(property);
            }

            html += '       <tr>\n';
            html += '           <td class="schema-propertyName">' + propertyName + '</td>\n';
            html += '           <td class="schema-type">' + type + '</td>\n';
            if (defaultColumn) {
                html += '           <td class="schema-defaultValue">' + JSON.stringify(defaultValue, null, 4) + '</td>\n';
            }
            if (descriptionColumn) {
                html += '           <td class="schema-description">' + description + '</td>\n';
            }
            html += '       </tr>\n';

        }

        html += '   </tbody>\n</table>\n';
    }

    return html;
};
