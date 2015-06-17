/**
 * This file contains the various JSON Schemas that mobo uses for internal validation
 */

var _        = require('lodash');

/**
 * mobos settings schema
 * This is used for validation of project settings and auto generated documentation
 *
 * @type {{}}
 */
exports.settingsSchema = require('./schema/moboSettings');

/**
 * JSON Schema Core (draft-04)
 *
 * @type {{}}
 */
exports.jsonSchemaCore = require('./schema/jsonSchemaCore');
delete exports.jsonSchemaCore.id; // Don't inherit the ID

exports.moboJsonSchemaAdditions = require('./schema/moboGlobalAdditions');


/**
 * This is the mobo version of JSON Schema
 *
 * * Annotates existing properties
 * * Adds a few new properties that are used on a global level (shared by fields, models and forms)
 */
exports.moboJsonSchema = _.merge(exports.jsonSchemaCore, exports.moboJsonSchemaAdditions);

exports.jsonSchemaCoreRemovals = require('./schema/moboGlobalRemovals');


for (var i = 0; i < exports.jsonSchemaCoreRemovals.global.length; i++) {
    var globalFeature = exports.jsonSchemaCoreRemovals.global[i];
    delete exports.moboJsonSchema[globalFeature];
}
for (i = 0; i < exports.jsonSchemaCoreRemovals.properties.length; i++) {
    var property = exports.jsonSchemaCoreRemovals.properties[i];
    delete exports.moboJsonSchema.properties[property];
}


var fs = require('fs-extra');
fs.writeJsonSync('./debug.json', exports.moboJsonSchema);

exports.fieldSchemaAdditions = require('./schema/moboFieldAdditions');

/**
 * JSON Schema for validating mobos field schemas
 *
 * @type {{}}
 */
exports.fieldSchema = _.merge(exports.moboJsonSchema, exports.fieldSchemaAdditions);

exports.modelSchemaAdditions = require('./schema/moboModelAdditions');

/**
 * JSON Schema for validating mobos model schemas
 *
 * @type {{}}
 */
exports.modelSchema = _.merge(exports.moboJsonSchema, exports.modelSchemaAdditions);


exports.formSchemaAdditions = require('./schema/moboFormAdditions');

/**
 * JSON Schema for validating mobos form schemas
 *
 * @type {{}}
 */
exports.formSchema = _.merge(exports.moboJsonSchema, exports.formSchemaAdditions);
