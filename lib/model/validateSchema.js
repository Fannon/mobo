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

/**
 * Validates mobo json files
 *
 *
 * @param {string} type 'field', 'model' or 'form'
 * @param {array} elements from registry
 *
 * @returns {{}}
 */
exports.validate = function (type, elements) {
    'use strict';

    for (var elName in elements) {
        var json = elements[elName];
        var schema = exports[type + 'Schema'];
        var id = json.id || 'UNKNOWN';

        // Hard Requirements
        if (!json.title) {
            log('> [ERROR]   [JSON Structure] ' + type + ' "' + id + '" has no title property!');
        }

        // Validate with the tv4 JSON Schema Validator Library
        var result = tv4.validateMultiple(json, schema);
        if (!result.valid || result.missing.length > 0) {

            for (var i = 0; i < result.errors.length; i++) {

                var error = result.errors[i];

                // Delete the error stack since it's not very helpful and cluttering the console
                delete error.stack;

                if (error.schemaPath === '/additionalProperties') {
                    // Unsupported additional Properties throw only a warning
                    log('> [WARNING] [JSON Structure] ' + type + ' "' + id + '" has unsupported property: ' + error.dataPath);
                } else {
                    log('> [ERROR]   [JSON Structure] ' + type + ' "' + id + '": ' + error.message);
                    log(error);
                }
            }
        }

    }
};

/**
 * JSON Schema Core (draft-04)
 *
 * @type {{}}
 */
exports.jsonSchemaCore = {
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
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
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
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
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": [ "maximum" ],
        "exclusiveMinimum": [ "minimum" ]
    },
    "default": {}
};

// Delete all JSON Schema Core features that mobo doesn't support
delete exports.jsonSchemaCore.properties.multipleOf;
delete exports.jsonSchemaCore.properties.exclusiveMaximum;
delete exports.jsonSchemaCore.properties.exclusiveMinimum;
delete exports.jsonSchemaCore.properties.additionalItems;
delete exports.jsonSchemaCore.properties.uniqueItems;
delete exports.jsonSchemaCore.properties.additionalProperties;
delete exports.jsonSchemaCore.properties.definitions;
delete exports.jsonSchemaCore.properties.patternProperties;
delete exports.jsonSchemaCore.properties.dependencies;
delete exports.jsonSchemaCore.properties.not;

/**
 * This is the mobo version of JSON Schema
 *
 * * Annotates existing properties
 * * Adds a few new properties that are used on a global level (shared by fields, models and forms)
 */
exports.moboJsonSchema = _.merge(exports.jsonSchemaCore, {

    "properties": {

        // ANNOTATE EXISTING PROPERTIES
        "$schema": {
            "description": "Optional JSON Schema $schema URL. Does not need not be included."
        },
        "id": {
            "description": "Usually auto generated id, consisting of the filename"
        },
        "title": {
            "description": "Human readable title of the field"
        },
        "description": {
            "description": "Description of the field. Can be displayed as tooltip info"
        },

        // ADD CUSTOM MOBO SPECIFIC GLOBAL PROPERTIES
        "ignore": {
            "type": "boolean",
            "description": "If true this file will be ignored."
        },
        "abstract": {
            "type": "boolean",
            "description": "If true this object is only used for inheritance and will not be created itself."
        },
        "format": {
            "type": "string",
            "description": "Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend"
        },
        "$extend": {
            "type": "string",
            "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten."
        },
        "propertyOrder": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order."
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
        }
    },
    "required": [
        "id",
        "type"
    ],

    "additionalProperties": false
});

/**
 * JSON Schema for validating mobos field schemas
 *
 * @type {{}}
 */
exports.fieldSchema = _.merge(exports.moboJsonSchema, {

    "description": "mobo field JSON Schema",

    "properties": {
        "smw_property": {
            "type": "boolean",
            "description": "Declares if this field should be saved as a SMW property, through #set or #subobject"
        },
        "smw_form": {
            "type": "object",
            "description": "Object, containing SemanticForms option, that will be redirected to the form",
            "additionalProperties": true
        }
    }
});


/**
 * JSON Schema for validating mobos model schemas
 *
 * @type {{}}
 */
exports.modelSchema = _.merge(exports.moboJsonSchema, {

    "description": "mobo model JSON Schema",

    "properties": {
        "recommended": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array of fields that should be highlighted as recommended (complementary to mandatory)"
        },
        "smw_subobject": {
            "type": "boolean",
            "description": "If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances."
        },
        "smw_category": {
            "type": "boolean",
            "description": "If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances."
        },
        "smw_categories": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array of additional categories the template should set."
        }
    }
});


/**
 * JSON Schema for validating mobos form schemas
 *
 * @type {{}}
 */
exports.formSchema = _.merge(exports.moboJsonSchema, {

    "description": "mobo form JSON Schema",

    "properties": {
        "smw_forminput": {
            "type": "object",
            "description": "Object, containing SemanticForms #forminput options",
            "additionalProperties": true
        },
        "smw_forminfo": {
            "type": "boolean",
            "description": "Object (Set), containing all SemanticForms {{{info}}} parameters."
        },
        "smw_freetext": {
            "type": "boolean",
            "description": "If true, a the freetext textarea will be displayed below the form."
        },
        "smw_summary": {
            "type": "boolean",
            "description": "If true, a summary field will be displayed at the bottom of the form."
        }
    }
});
