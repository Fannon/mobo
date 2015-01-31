//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var tv4 = require('tv4');
var _ = require('lodash');

var logger     = require('./../logger.js');
var log        = logger.log;


//////////////////////////////////////////
// CORE FUNCTIONS                       //
//////////////////////////////////////////

exports.fields = function(fields) {
    for (var fieldName in fields) {
        var field = fields[fieldName];
        exports.validate(field, exports.fieldSchema);
    }
};

/**
 * Executes the parsing of queries
 * Will generate SMW templates
 *
 * @param schema
 * @param json
 *
 * @returns {{}}
 */
exports.validate = function (json, schema) {
    'use strict';

    var id = json.id || 'UNKNOWN';

    // Validate with the tv4 JSON Schema Validator Library
    var result = tv4.validateMultiple(json, schema);
    if (!result.valid || result.missing.length > 0) {

        for (var i = 0; i < result.errors.length; i++) {

            var error = result.errors[i];

            // Delete the error stack since it's not very helpful and cluttering the console
            delete error.stack;

            if (error.schemaPath === '/additionalProperties') {
                // Unsupported additional Properties throw only a warning
                log('> [WARNING] [Invalid JSON Structure] "' + id + '" has unsupported property: ' + error.dataPath);
            } else {
                log('> [ERROR] [Invalid JSON Structure] ' + error.message);
                log(error);
            }
        }

    }

};

/**
 * This is a reduced / simplified version of JSON SchemaCore v4
 *
 * It will be shared by fields, model and forms.
 * @see https://raw.githubusercontent.com/json-schema/json-schema/master/draft-04/schema
 *
 * @type {{}}
 */
exports.simplifiedJsonSchemaCore = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",

    "properties": {
        "$schema": {
            "type": "string",
            "format": "uri",
            "description": "Optional JSON Schema $schema URL. Should not be included"
        },

        "id": {
            "type": "string",
            "description": "Usually auto generated id, consisting of the filename"
        },
        "title": {
            "type": "string",
            "description": "Human readable title of the field"
        },
        "description": {
            "type": "string",
            "description": "Description of the field. Can be displayed as tooltip info"
        },
        "default": {},
        "maximum": {
            "type": "number"
        },
        "minimum": {
            "type": "number"
        },
        "maxLength": {"$ref": "#/definitions/positiveInteger"},
        "minLength": {"$ref": "#/definitions/positiveIntegerDefault0"},
        "maxItems": {"$ref": "#/definitions/positiveInteger"},
        "minItems": {"$ref": "#/definitions/positiveIntegerDefault0"},
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {"$ref": "#/definitions/type"},

        "format": {
            "type": "string"
        },

        "items": {
            "type": "object",
            "description": "If the type is an array, the actual items go in here.",
            "properties": {
                "type": {"$ref": "#/definitions/type"},
                "format": {
                    "type": "string"
                },
                "allOf": {"$ref": "#/definitions/schemaArray"},
                "anyOf": {"$ref": "#/definitions/schemaArray"},
                "oneOf": {"$ref": "#/definitions/schemaArray"}
            },
            "additionalProperties": false

        },
        "allOf": {"$ref": "#/definitions/schemaArray"},
        "anyOf": {"$ref": "#/definitions/schemaArray"},
        "oneOf": {"$ref": "#/definitions/schemaArray"}
    },

    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#/definitions/items" }
        },
        "items": {
            "type": "object",
            "description": "If the type is an array, the actual items go in here.",
            "properties": {
                "id": { "type": "string" },
                "title": { "type": "string" },
                "description": { "type": "string" },
                "type": { "$ref": "#/definitions/type" },
                "format": { "type": "string" },
                "allOf": { "$ref": "#/definitions/schemaArray" },
                "anyOf": { "$ref": "#/definitions/schemaArray" },
                "oneOf": { "$ref": "#/definitions/schemaArray" }
            },
            "additionalProperties": false
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
        },
        "simpleTypes": {
            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    }
};
/**
 * // MOBO CUSTOM FIELD PROPERTIES
 * @type {{}}
 */
exports.fieldSchema = _.merge(exports.simplifiedJsonSchemaCore, {
    "description": "mobo field JSON Schema",

    "properties": {

        "abstract": {
            "type": "boolean",
            "description": "If true this object is only used for inheritance and will not be created itself."
        },

        "smw_property": {
            "type": "boolean",
            "description": "Declares if this field should be saved as a SMW property, through #set or #subobject"
        },
        "smw_form": {
            "type": "object",
            "description": "Object, containing SemanticForms option, that will be redirected to the form",
            "additionalProperties": true
        },

        "todo": {
            "type": "string",
            "description": "If todo notes are placed here, mobo can output them (this is a setting)"
        },

        "note": {
            "description": "Notes can be strings or objects and their content will be ignored",
            "anyOf": [
                { "type": "string" },
                { "type": "object" }
            ]
        },

        "readonly": { "type": "boolean" }
    },

    "required": [
        "title",
        "type",
        "id"
    ],

    "additionalProperties": false
});
