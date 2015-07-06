/**
 * This file loads the various JSON Schema files that describe the mobo schema
 * It will remove and merge the features accordingly.
 * The result is used for internal schema validation (meta schema) and documentation generation
 */

var _        = require('lodash');
var fs        = require('fs');
var yaml       = require('js-yaml');
var moboUtil = require('./../util/moboUtil');
var settings = require('./../settings.json');


//////////////////////////////////////////
// Global Mobo Schema                   //
//////////////////////////////////////////

/**
 * JSON Schema Core (draft-04)
 *
 * @type {{}}
 */
exports.jsonSchemaCore = require('./jsonSchemaCore.schema');
delete exports.jsonSchemaCore.id; // Don't inherit the ID

/**
 * Mobos global Schema additions
 */
exports.moboJsonSchemaAdditions = yaml.safeLoad(fs.readFileSync(__dirname + '/moboGlobalAdditions.schema.yaml', 'utf8'));


/**
 * This is the mobo version of JSON Schema
 *
 * * Annotates existing properties
 * * Adds a few new properties that are used on a global level (shared by fields, models and forms)
 */
exports.moboJsonSchema = _.merge(exports.jsonSchemaCore, exports.moboJsonSchemaAdditions);

/**
 * Unsupported JSON Schema features
 */
exports.jsonSchemaCoreRemovals = yaml.safeLoad(fs.readFileSync(__dirname + '/moboGlobalRemovals.yaml', 'utf8'));

// Apply Removals:
for (var i = 0; i < exports.jsonSchemaCoreRemovals.global.length; i++) {
    var globalFeature = exports.jsonSchemaCoreRemovals.global[i];
    delete exports.moboJsonSchema[globalFeature];
}
for (i = 0; i < exports.jsonSchemaCoreRemovals.properties.length; i++) {
    var property = exports.jsonSchemaCoreRemovals.properties[i];
    delete exports.moboJsonSchema.properties[property];
}


//////////////////////////////////////////
// Field Schema                         //
//////////////////////////////////////////

exports.fieldSchemaAdditions = yaml.safeLoad(fs.readFileSync(__dirname + '/moboFieldAdditions.schema.yaml', 'utf8'));
var mergeSchema = _.cloneDeep(exports.moboJsonSchema);
/**
 * JSON Schema for validating mobos field schemas
 *
 * @type {{}}
 */
exports.fieldSchema = _.merge(mergeSchema, exports.fieldSchemaAdditions);


//////////////////////////////////////////
// Model Schema                         //
//////////////////////////////////////////

exports.modelSchemaAdditions = yaml.safeLoad(fs.readFileSync(__dirname + '/moboModelAdditions.schema.yaml', 'utf8'));
// Models inherit all Field properties:
mergeSchema = _.cloneDeep(exports.fieldSchema);
/**
 * JSON Schema for validating mobos model schemas
 *
 * @type {{}}
 */
exports.modelSchema = _.merge(mergeSchema, exports.modelSchemaAdditions);


//////////////////////////////////////////
// Form Schema                          //
//////////////////////////////////////////

exports.formSchemaAdditions = yaml.safeLoad(fs.readFileSync(__dirname + '/moboFormAdditions.schema.yaml', 'utf8'));
// Forms inherit all Model properties:
mergeSchema = _.cloneDeep(exports.modelSchema);

exports.formSchema = _.merge(mergeSchema, exports.formSchemaAdditions);


//////////////////////////////////////////
// Settings Schema                      //
//////////////////////////////////////////

/**
 * mobos settings schema
 * This is used for validation of project settings and auto generated documentation
 *
 * @type {{}}
 */
exports.settingsSchema = yaml.safeLoad(fs.readFileSync(__dirname + '/moboSettings.schema.yaml', 'utf8'));

// Add the default settings from mobos default settings.json
moboUtil.addDefaults(exports.settingsSchema, settings);
