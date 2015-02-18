// This file contains the various JSON Schemas that mobo uses for internal validation

var _           = require('lodash');

/**
 * mobos settings schema
 * This is used for validation of project settings and auto generated documentation
 *
 * @type {{}}
 */
exports.settingsSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "mobo model JSON Schema",

    "properties": {

        "mw_server_url": {
            "type": ["string", "boolean"],
            "description": "URL to your MediaWiki server without trailing slash. Do not include the port or relative path to MediaWiki here!"
        },
        "mw_server_path": {
            "type": ["string", "boolean"],
            "description": "Relative path to the MediaWiki installation without trailing slash"
        },
        "mw_server_port": {
            "type": ["string", "boolean"],
            "description": "The port your MW installation is using.",
            "default": 80
        },
        "mw_username": {
            "type": "string",
            "description": "The username of your mobo bot account"
        },
        "mw_password": {
            "type": "string",
            "description": "The password of your mobo bot account"
        },


        "debug": {
            "type": "boolean",
            "default": false,
            "description": "Turns the debug mode on. This deactivated graceful error handling."
        },
        "verbose": {
            "type": "boolean",
            "default": false,
            "description": "More verbose console output. This will also tighten the model validation and display minor notices"
        },
        "displayTodos": {
            "type": "boolean",
            "default": true,
            "description": "Displays the content of todo properties from your JSON files"
        },
        "writeLogFile": {
            "type": "boolean",
            "default": false,
            "description": "If this is enabled, mobo will create logfiles in /_processed/logfiles/*"
        },


        "watchFilesystem": {
            "type": "boolean",
            "default": true,
            "description": "Watches the (development) project files for changed and automatically triggers re-generation."
        },
        "serveWebApp": {
            "type": "boolean",
            "default": true,
            "description": "Serves the webGUI / app at localhost."
        },
        "webAppPort": {
            "type": "number",
            "default": 8080,
            "description": "Port the WebApp is served on the localhost"
        },
        "autoRefreshWebGui": {
            "type": "boolean",
            "default": true,
            "description": "WebGui is automatically refreshed if the server makes changes to the model"
        },
        "autoRefreshPort": {
            "type": "number",
            "default": 8081,
            "description": "WebSocket port the server and the WebGui are using to notify the change"
        },


        "generateWikiPages": {
            "type": "boolean",
            "default": true,
            "description": "Generates WikiPages (structure) from the development model"
        },
        "buildGraph": {
            "type": "boolean",
            "default": true,
            "description": "Builds graph files from the model. This also includes a lot of structural validation. \nSo it might make sense to keep this activated, even if the graph is not used afterwards."
        },
        "writeExportFiles": {
            "type": "boolean",
            "default": true,
            "description": "If true mobo will write every generated file as a single file into the filesystem. This can be slow due to a lot of HDD I/O"
        },


        "uploadWikiPages": {
            "type": "boolean",
            "default": true,
            "description": "Uploads the generated WikiPages to an external Wiki"
        },
        "deleteWikiPages": {
            "type": "boolean",
            "default": false,
            "description": "Deletes removed WikiPages from the external Wiki (use with care!)"
        },
        "forceUpload": {
            "type": "boolean",
            "default": false,
            "description": "Forces the upload of all generated WikiPages, even if no changes were detected. \nThis can sometimes be useful, if some changes were lost or you want to go for sure."
        },
        "uploadConcurrency": {
            "type": "number",
            "default": 4,
            "minimum": 1,
            "description": "Concurrent upload processes"
        },

        "headerTabs": {
            "type": "boolean",
            "default": false,
            "description": "If true, the HeaderTabs Extension will be used with the generated forms. Keep in mind that you still have to create the headings to make this work!"
        },
        "formEditHelper": {
            "type": "boolean",
            "default": false,
            "description": "If enabled this creates **FormEdit Helper Categories** that tag the WikiPages that were generated through a form as editable by that form."
        },
        "hideFormEditHelper": {
            "type": "boolean",
            "default": false,
            "description": "If true this will hide the introduced Helper Categories from the display"
        },
        "useSimpleTooltipDescriptions": {
            "type": "boolean",
            "default": false,
            "description": "If enabled, descriptions will be included as SimpleTooltip tooltips. WARNING: You need to install the SimpleTooltip extension to make this work."
        },

        "defaultTemplateDisplay": {
            "type": "string",
            "default": "table",
            "description": "Default Template Display renderer. See templates/template.wikitext to see or change how they are rendered."
        },
        "sfDivLayout": {
            "type": "boolean",
            "default": false,
            "description": "If enabled, mobo renders the SemanticForms as a div layout instead of the standard table layout. \nThis enables more control over the layout, including some responsiveness. \nWARNING: You need to style/layout the divs by yourself, or use the VectorUp skin. \nSemanticForms itself does not support / supply this for a div based layout."
        },


        "cwd": {
            "type": "string",
            "description": "AUTO GENERATED, can be overwritten: Working (root) directory of the project where the settings.json is located"
        },
        "importModelDir": {
            "type": "string",
            "description": "AUTO GENERATED, can be overwritten."
        },
        "templateDir": {
            "type": "string",
            "description": "AUTO GENERATED, can be overwritten."
        },
        "logDir": {
            "type": "string",
            "description": "AUTO GENERATED, can be overwritten."
        },
        "processedModelDir": {
            "type": "string",
            "description": "AUTO GENERATED, can be overwritten."
        },


        "buildGraphSettings": {
            "type": "object",
            "properties": {
                "dataTypeNodeSize": {
                    "type": "number",
                    "default": 8,
                    "minimum": 0,
                    "description": ""
                },
                "templateNodeSize": {
                    "type": "number",
                    "default": 12,
                    "minimum": 0,
                    "description": ""
                },
                "modelNodeSize": {
                    "type": "number",
                    "default": 12,
                    "minimum": 0,
                    "description": ""
                },
                "formNodeSize": {
                    "type": "number",
                    "default": 32,
                    "minimum": 0,
                    "description": ""
                },

                "edgeWeight": {
                    "type": "number",
                    "default": 2.0,
                    "minimum": 0,
                    "description": ""
                },
                "multipleEdgeWeight": {
                    "type": "number",
                    "default": 2.0,
                    "minimum": 0,
                    "description": ""
                }
            }
        }
    },

    "required": [

    ],

    "additionalProperties": false
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

exports.moboJsonSchemaAdditions = {

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
        "$extend": {
            "type": "string",
            "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten."
        },
        "$reference": {
            "type": "string",
            "description": "For internal use only! After inheritance is applied, $extend will be replaced through $extend. (For keeping info on the heritage)"
        },
        "$filepath": {
            "type": "string",
            "description": "For Internal use only! This stores the relative path of the .json file. Used for improved debugging messages"
        },
        "ignore": {
            "type": "boolean",
            "default": false,
            "description": "If true this file will be ignored."
        },
        "abstract": {
            "type": "boolean",
            "default": false,
            "description": "If true this object is only used for inheritance and will not be created itself."
        },
        "format": {
            "type": "string",
            "description": "Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend"
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
};


/**
 * This is the mobo version of JSON Schema
 *
 * * Annotates existing properties
 * * Adds a few new properties that are used on a global level (shared by fields, models and forms)
 */
exports.moboJsonSchema = _.merge(exports.jsonSchemaCore, exports.moboJsonSchemaAdditions);

exports.jsonSchemaCoreRemovals = [
    'properties.multipleOf',
    'properties.exclusiveMaximum',
    'properties.exclusiveMinimum',
    'properties.additionalItems',
    'properties.uniqueItems',
    'properties.additionalProperties',
    'properties.definitions',
    'properties.patternProperties',
    'properties.dependencies',
    'properties.not',
    'dependencies'
];

for (var i = 0; i < exports.jsonSchemaCoreRemovals.length; i++) {
    var feature = exports.jsonSchemaCoreRemovals[i];
    delete  exports.moboJsonSchema[feature];
}

// Delete all JSON Schema Core features that mobo doesn't support
delete exports.moboJsonSchema.properties.multipleOf;
delete exports.moboJsonSchema.properties.exclusiveMaximum;
delete exports.moboJsonSchema.properties.exclusiveMinimum;
delete exports.moboJsonSchema.properties.additionalItems;
delete exports.moboJsonSchema.properties.uniqueItems;
delete exports.moboJsonSchema.properties.additionalProperties;
delete exports.moboJsonSchema.properties.definitions;
delete exports.moboJsonSchema.properties.patternProperties;
delete exports.moboJsonSchema.properties.dependencies;
delete exports.moboJsonSchema.properties.not;
delete exports.moboJsonSchema.dependencies;
delete exports.moboJsonSchema.$ref;

exports.fieldSchemaAdditions = {

    "description": "mobo field JSON Schema",

    "properties": {
        "smw_property": {
            "type": "boolean",
            "default": true,
            "description": "Declares if this field should be saved as a SMW property, through #set or #subobject"
        },
        "smw_form": {
            "type": "object",
            "description": "Object, containing SemanticForms option, that will be redirected to the form",
            "additionalProperties": true
        }
    }
};

/**
 * JSON Schema for validating mobos field schemas
 *
 * @type {{}}
 */
exports.fieldSchema = _.merge(exports.moboJsonSchema, exports.fieldSchemaAdditions);


exports.modelSchemaAdditions = {

    "description": "mobo model JSON Schema",

    "properties": {
        "recommended": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array of fields that should be highlighted as recommended (complementary to mandatory)"
        },
        "smw_subobject": {
            "type": "boolean",
            "default": false,
            "description": "If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances."
        },
        "smw_display": {
            "type": "string",
            "enum": ['table', 'ul'],
            "default": 'table',
            "description": "Defines the template output rendering mode, whether the template should use tables, ul, etc."
        },
        "smw_prefix": {
            "type": "object",
            "description": "Adds a prefix wikitext to forms and models. Can auto-generate headers.",
            "properties": {
                "wikitext": {
                    "type": "string",
                    "description": "wikitext to prefix"
                },
                "header": {
                    "type": "number",
                    "description": "Inserts auto generated header of given hierachy (1-6)",
                    "minimum": 1,
                    "maximum": 6
                },
                "template": {
                    "type": "string",
                    "description": "name of a template to inject. Must exist"
                },
                "showForm": {
                    "type": "boolean",
                    "description": "Display prefix in form-view",
                    "default": true
                },
                "showPage": {
                    "type": "boolean",
                    "description": "Display prefix in page-view",
                    "default": true
                }
            },
            "additionalProperties": false
        },
        "smw_postfix": {
            "type": "object",
            "description": "Adds a postfix wikitext to forms and models",
            "properties": {
                "wikitext": {
                    "type": "string",
                    "description": "wikitext to postfix"
                },
                "template": {
                    "type": "string",
                    "description": "name of a template to inject. Must exist"
                },
                "showForm": {
                    "type": "boolean",
                    "description": "Display postfix in form-view",
                    "default": true
                },
                "showPage": {
                    "type": "boolean",
                    "description": "Display postfix in page-view",
                    "default": true
                }
            },
            "additionalProperties": false
        },
        "smw_category": {
            "type": "boolean",
            "default": true,
            "description": "This property decides whether the template should tag the page as a category of the model-name."
        },
        "smw_categories": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array of additional categories the template should set."
        },
        "showForm": {
            "type": "boolean",
            "default": true,
            "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view."
        },
        "showPage": {
            "type": "boolean",
            "default": true,
            "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view."
        },
        "additionalProperties": false
    }
};

/**
 * JSON Schema for validating mobos model schemas
 *
 * @type {{}}
 */
exports.modelSchema = _.merge(exports.moboJsonSchema, exports.modelSchemaAdditions);


exports.formSchemaAdditions = {

    "description": "mobo form JSON Schema",

    "properties": {
        "smw_forminput": {
            "type": "object",
            "description": "Object, containing SemanticForms #forminput options",
            "additionalProperties": true
        },
        "smw_forminfo": {
            "type": "object",
            "description": "Object (Set), containing all SemanticForms {{{info}}} parameters."
        },
        "smw_naming": {
            "type": "string",
            "description": "Provides naming conventions / guideline. Will appear on the form page itself."
        },
        "smw_freetext": {
            "type": "boolean",
            "default": true,
            "description": "Decides whether the freetext textarea will be displayed below the form."
        },
        "smw_summary": {
            "type": "boolean",
            "default": false,
            "description": "Decides whether a summary field will be displayed at the bottom of the form."
        }
    }
};

/**
 * JSON Schema for validating mobos form schemas
 *
 * @type {{}}
 */
exports.formSchema = _.merge(exports.moboJsonSchema, exports.formSchemaAdditions);
