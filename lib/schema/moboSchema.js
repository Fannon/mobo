/**
 * This file loads the various JSON Schema files that describe the mobo schema
 * It will remove and merge the features accordingly.
 * The result is used for internal schema validation (meta schema) and documentation generation
 */

var _        = require('lodash');
var moboUtil = require('./../util/moboUtil');
var settings = require('./../settings.json');

/**
 * mobos settings schema
 * This is used for validation of project settings and auto generated documentation
 *
 * @type {{}}
 */
exports.settingsSchema = require('./moboSettings.schema');

// Add the default settings from mobos default settings.json
moboUtil.addDefaults(exports.settingsSchema, settings);


/**
 * JSON Schema Core (draft-04)
 *
 * @type {{}}
 */
exports.jsonSchemaCore = require('./jsonSchemaCore.schema');
delete exports.jsonSchemaCore.id; // Don't inherit the ID

exports.moboJsonSchemaAdditions = require('./moboGlobalAdditions.schema');


/**
 * This is the mobo version of JSON Schema
 *
 * * Annotates existing properties
 * * Adds a few new properties that are used on a global level (shared by fields, models and forms)
 */
exports.moboJsonSchema = _.merge(exports.jsonSchemaCore, exports.moboJsonSchemaAdditions);

exports.jsonSchemaCoreRemovals = require('./moboGlobalRemovals');

// Apply Removals:
for (var i = 0; i < exports.jsonSchemaCoreRemovals.global.length; i++) {
    var globalFeature = exports.jsonSchemaCoreRemovals.global[i];
    delete exports.moboJsonSchema[globalFeature];
}
for (i = 0; i < exports.jsonSchemaCoreRemovals.properties.length; i++) {
    var property = exports.jsonSchemaCoreRemovals.properties[i];
    delete exports.moboJsonSchema.properties[property];
}

var fs = require('fs-extra');
fs.writeJSONSync('./debug.json', exports.moboJsonSchema);

exports.fieldSchemaAdditions = require('./moboFieldAdditions.schema');

/**
 * JSON Schema for validating mobos field schemas
 *
 * @type {{}}
 */
exports.fieldSchema = _.merge(exports.moboJsonSchema, exports.fieldSchemaAdditions);

exports.modelSchemaAdditions = require('./moboModelAdditions.schema');

/**
 * JSON Schema for validating mobos model schemas
 *
 * @type {{}}
 */
exports.modelSchema = _.merge(exports.moboJsonSchema, exports.modelSchemaAdditions);


exports.formSchemaAdditions = require('./moboFormAdditions.schema');

/**
 * JSON Schema for validating mobos form schemas
 *
 * @type {{}}
 */
exports.formSchema = _.merge(exports.moboJsonSchema, exports.formSchemaAdditions);
