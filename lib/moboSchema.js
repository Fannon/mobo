// This file contains the various JSON Schemas that mobo uses for internal validation

var _        = require('lodash');

var settings = require('./settings.json');

/**
 * mobos settings schema
 * This is used for validation of project settings and auto generated documentation
 *
 * @type {{}}
 */
exports.settingsSchema = {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'description': 'mobo model JSON Schema',

    'properties': {

        'mw_server_url': {
            'type': ['string', 'boolean'],
            'description': 'URL to your MediaWiki server without trailing slash. Do not include the port or relative path to MediaWiki here!'
        },
        'mw_server_path': {
            'type': ['string', 'boolean'],
            'description': 'Relative path to the MediaWiki installation without trailing slash',
            'default': settings.mw_server_path
        },
        'mw_server_port': {
            'type': ['string', 'boolean'],
            'description': 'The port your MW installation is using.',
            'default': settings.mw_server_port
        },
        'mw_username': {
            'type': 'string',
            'description': 'The username of your mobo bot account'
        },
        'mw_password': {
            'type': 'string',
            'description': 'The password of your mobo bot account'
        },


        'debug': {
            'type': 'boolean',
            'default': settings.debug,
            'description': 'Turns the debug mode on. This deactivated graceful error handling.'
        },
        'verbose': {
            'type': 'boolean',
            'default': settings.verbose,
            'description': 'More verbose console output. This will also tighten the model validation and display minor notices'
        },
        'logDate': {
            'type': 'boolean',
            'default': settings.logDate,
            'description': 'Prepend the time (and eventually date) on each logging message'
        },
        'logLongDate': {
            'type': 'boolean',
            'default': settings.logLongDate,
            'description': 'If true and logDate is enabled, the full date will be logged in addition to the time'
        },
        'displayTodos': {
            'type': 'boolean',
            'default': settings.displayTodos,
            'description': 'Displays the content of todo properties from your JSON files'
        },
        'writeLogFile': {
            'type': 'boolean',
            'default': settings.writeLogFile,
            'description': 'If this is enabled, mobo will create logfiles in /_processed/logfiles/*'
        },
        'uploadReport': {
            'type': 'boolean',
            'default': settings.uploadReport,
            'description': 'If this is enabled, mobo will upload a report at User at /User:<bot username>"'
        },
        'uploadOutline': {
            'type': 'boolean',
            'default': settings.uploadOutline,
            'description': 'If this is enabled, mobo will upload an outline of the model at /User:<bot username>/outline'
        },
        'uploadOutlineCountRefs': {
            'type': 'boolean',
            'default': settings.uploadOutlineCountRefs,
            'description': 'Adds an counter how often a template / property was internally referenced'
        },
        'uploadLogFile': {
            'type': 'boolean',
            'default': settings.uploadLogFile,
            'description': 'If this is enabled, mobo will upload the logfile in addition to the report'
        },
        'overwriteImportedPages': {
            'type': 'boolean',
            'default': settings.overwriteImportedPages,
            'description': 'If this is enabled, mobo in --import mode will overwrite already existing wiki pages'
        },


        'watchFilesystem': {
            'type': 'boolean',
            'default': settings.watchFilesystem,
            'description': 'Watches the (development) project files for changed and automatically triggers re-generation.'
        },
        'serveWebApp': {
            'type': 'boolean',
            'default': settings.serveWebApp,
            'description': 'Serves the webGUI / app at localhost.'
        },
        'webAppPort': {
            'type': 'number',
            'default': settings.webAppPort,
            'description': 'Port the WebApp is served on the localhost'
        },
        'autoRefreshWebGui': {
            'type': 'boolean',
            'default': settings.autoRefreshWebGui,
            'description': 'WebGui is automatically refreshed if the server makes changes to the model'
        },
        'autoRefreshPort': {
            'type': 'number',
            'default': settings.autoRefreshPort,
            'description': 'WebSocket port the server and the WebGui are using to notify the change. Change this if the port is already used.'
        },


        'statistics': {
            'type': 'boolean',
            'default': settings.statistics,
            'description': 'Displays simple statistics about the project model. Statistics will also be written / appended to `/_processed/_statistics.csv`'
        },
        'buildGraph': {
            'type': 'boolean',
            'default': settings.buildGraph,
            'description': 'Builds graph files (.gexf) from the model.'
        },
        'writeExportFiles': {
            'type': 'boolean',
            'default': settings.writeExportFiles,
            'description': 'If true mobo will write every generated file as a single file into the filesystem. This can be slow due to a lot of HDD I/O'
        },


        'force': {
            'type': 'boolean',
            'default': settings.force,
            'description': 'Forces mobo to continue despite possible errors'
        },
        'uploadWikiPages': {
            'type': 'boolean',
            'default': settings.uploadWikiPages,
            'description': 'Uploads the generated WikiPages to an external Wiki'
        },
        'deleteWikiPages': {
            'type': 'boolean',
            'default': settings.deleteWikiPages,
            'description': 'Deletes removed WikiPages from the external Wiki (use with care, this destroys the polymorphism!)'
        },
        'forceUpload': {
            'type': 'boolean',
            'default': settings.forceUpload,
            'description': 'Forces the upload of all generated WikiPages, even if no changes were detected. \nThis can sometimes be useful, if some changes were lost or you want to go for sure.'
        },
        'uploadConcurrency': {
            'type': 'number',
            'default': settings.uploadConcurrency,
            'minimum': 1,
            'description': 'Concurrent upload processes'
        },

        'headerTabs': {
            'type': 'boolean',
            'default': settings.headerTabs,
            'description': 'If true, the HeaderTabs Extension will be used with the generated forms. Keep in mind that you still have to create the headings to make this work!'
        },
        'formEditHelper': {
            'type': 'boolean',
            'default': settings.formEditHelper,
            'description': 'If enabled this creates **FormEdit Helper Categories** that tag the WikiPages that were generated through a form as editable by that form.'
        },
        'hideFormEditHelper': {
            'type': 'boolean',
            'default': settings.hideFormEditHelper,
            'description': 'If true this will hide the introduced Helper Categories from the display'
        },
        'smw_semanticDrilldown': {
            'type': 'boolean',
            'default': settings.smw_semanticDrilldown,
            'description': 'Automatically generates SemanticDrilldown #drilldowninfo functions.'
        },

        'firstAlternativeFormAsDefault': {
            'type': 'boolean',
            'default': settings.firstAlternativeFormAsDefault,
            'description': 'If more than one form is defined through an oneOf array, this setting will set the first form as the default if true. If set to false, no form will be used as default and the user has to choose first.'
        },
        'arraymapSeparator': {
            'type': 'string',
            'default': settings.arraymapSeparator,
            'description': 'Separator to seperate between multiple items'
        },
        'useSimpleTooltipDescriptions': {
            'type': 'boolean',
            'default': settings.useSimpleTooltipDescriptions,
            'description': 'If enabled, descriptions will be included as SimpleTooltip tooltips. WARNING: You need to install the SimpleTooltip extension to make this work.'
        },

        'defaultTemplateDisplay': {
            'type': 'string',
            'default': settings.defaultTemplateDisplay,
            'description': 'Default Template Display renderer. See mobo_template/template.wikitext to see or change how they are rendered.'
        },

        'generatedByMobo': {
            'type': 'boolean',
            'default': settings.generatedByMobo,
            'description': 'If enabled, mobo appends a warning and a category to each wiki page generated.'
        },
        'generatedByMoboText': {
            'type': 'string',
            'default': settings.generatedByMoboText,
            'description': 'Wikitext that will be prefixed to each mobo generated page'
        },

        // Semantic Forms Related
        'sf_responsiveForms': {
            'type': 'boolean',
            'default': settings.sf_divLayout,
            'description': 'If enabled, mobo renders the SemanticForms as a div layout instead of the standard table layout. \nThis enables more control over the layout, including some responsiveness (Bootstrap grid layout). \nWARNING: You need to style/layout the divs by yourself, or use the Chameleon skin. \nSemanticForms itself does not support / supply this for a div based layout.'
        },
        'sf_wpPreview': {
            'type': 'boolean',
            'default': settings.sf_wpPreview,
            'description': 'Semantic Forms Edit-View: Render the Preview Button'
        },
        'sf_wpDiff': {
            'type': 'boolean',
            'default': settings.sf_wpDiff,
            'description': 'Semantic Forms Edit-View: Render the Diff Button'
        },
        'sf_wpWatchthis': {
            'type': 'boolean',
            'default': settings.sf_wpWatchthis,
            'description': 'Semantic Forms Edit-View: Render the Watch this checkbox option'
        },


        'cwd': {
            'type': 'string',
            'description': 'AUTO GENERATED, can be overwritten: Working (root) directory of the project where the settings.json is located'
        },
        'importModelDir': {
            'type': 'string',
            'description': 'AUTO GENERATED, can be overwritten.'
        },
        'templateDir': {
            'type': 'string',
            'description': 'AUTO GENERATED, can be overwritten.'
        },
        'logDir': {
            'type': 'string',
            'description': 'AUTO GENERATED, can be overwritten.'
        },
        'processedModelDir': {
            'type': 'string',
            'description': 'AUTO GENERATED, can be overwritten.'
        },


        'buildGraphSettings': {
            'type': 'object',
            'properties': {
                'dataTypeNodeSize': {
                    'type': 'number',
                    'default': settings.buildGraphSettings.dataTypeNodeSize,
                    'minimum': 0,
                    'description': ''
                },
                'templateNodeSize': {
                    'type': 'number',
                    'default': settings.buildGraphSettings.templateNodeSize,
                    'minimum': 0,
                    'description': ''
                },
                'modelNodeSize': {
                    'type': 'number',
                    'default': settings.buildGraphSettings.modelNodeSize,
                    'minimum': 0,
                    'description': ''
                },
                'formNodeSize': {
                    'type': 'number',
                    'default': settings.buildGraphSettings.formNodeSize,
                    'minimum': 0,
                    'description': ''
                },

                'edgeWeight': {
                    'type': 'number',
                    'default': settings.buildGraphSettings.edgeWeight,
                    'minimum': 0,
                    'description': ''
                },
                'multipleEdgeWeight': {
                    'type': 'number',
                    'default': settings.buildGraphSettings.multipleEdgeWeight,
                    'minimum': 0,
                    'description': ''
                }
            }
        }
    },

    'required': [

    ],

    'additionalProperties': false
};

/**
 * JSON Schema Core (draft-04)
 *
 * @type {{}}
 */
exports.jsonSchemaCore = {
    'id': 'http://json-schema.org/draft-04/schema#',
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'description': 'Core schema meta-schema',
    'definitions': {
        'schemaArray': {
            'type': 'array',
            'minItems': 1,
            'items': { '$ref': '#' }
        },
        'positiveInteger': {
            'type': 'integer',
            'minimum': 0
        },
        'positiveIntegerDefault0': {
            'allOf': [
                { '$ref': '#/definitions/positiveInteger' },
                { 'default': 0 }
            ]
        },
        'simpleTypes': {
            'enum': ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string']
        },
        'stringArray': {
            'type': 'array',
            'items': { 'type': 'string' },
            'minItems': 1,
            'uniqueItems': true
        }
    },
    'type': 'object',
    'properties': {
        'id': {
            'type': 'string',
            'format': 'uri'
        },
        '$schema': {
            'type': 'string',
            'format': 'uri'
        },
        'title': {
            'type': 'string'
        },
        'description': {
            'type': 'string'
        },
        'default': {},
        'multipleOf': {
            'type': 'number',
            'minimum': 0,
            'exclusiveMinimum': true
        },
        'maximum': {
            'type': 'number'
        },
        'exclusiveMaximum': {
            'type': 'boolean',
            'default': false
        },
        'minimum': {
            'type': 'number'
        },
        'exclusiveMinimum': {
            'type': 'boolean',
            'default': false
        },
        'maxLength': { '$ref': '#/definitions/positiveInteger' },
        'minLength': { '$ref': '#/definitions/positiveIntegerDefault0' },
        'pattern': {
            'type': 'string',
            'format': 'regex'
        },
        'additionalItems': {
            'anyOf': [
                { 'type': 'boolean' },
                { '$ref': '#' }
            ],
            'default': {}
        },
        'items': {
            'anyOf': [
                { '$ref': '#' },
                { '$ref': '#/definitions/schemaArray' }
            ],
            'default': {}
        },
        'maxItems': { '$ref': '#/definitions/positiveInteger' },
        'minItems': { '$ref': '#/definitions/positiveIntegerDefault0' },
        'uniqueItems': {
            'type': 'boolean',
            'default': false
        },
        'maxProperties': { '$ref': '#/definitions/positiveInteger' },
        'minProperties': { '$ref': '#/definitions/positiveIntegerDefault0' },
        'required': { '$ref': '#/definitions/stringArray' },
        'additionalProperties': {
            'anyOf': [
                { 'type': 'boolean' },
                { '$ref': '#' }
            ],
            'default': {}
        },
        'definitions': {
            'type': 'object',
            'additionalProperties': { '$ref': '#' },
            'default': {}
        },
        'properties': {
            'type': 'object',
            'additionalProperties': { '$ref': '#' },
            'default': {}
        },
        'patternProperties': {
            'type': 'object',
            'additionalProperties': { '$ref': '#' },
            'default': {}
        },
        'dependencies': {
            'type': 'object',
            'additionalProperties': {
                'anyOf': [
                    { '$ref': '#' },
                    { '$ref': '#/definitions/stringArray' }
                ]
            }
        },
        'enum': {
            'type': 'array',
            'minItems': 1,
            'uniqueItems': true
        },
        'type': {
            'anyOf': [
                { '$ref': '#/definitions/simpleTypes' },
                {
                    'type': 'array',
                    'items': { '$ref': '#/definitions/simpleTypes' },
                    'minItems': 1,
                    'uniqueItems': true
                }
            ]
        },
        'allOf': { '$ref': '#/definitions/schemaArray' },
        'anyOf': { '$ref': '#/definitions/schemaArray' },
        'oneOf': { '$ref': '#/definitions/schemaArray' },
        'not': { '$ref': '#' }
    },
    'dependencies': {
        'exclusiveMaximum': ['maximum'],
        'exclusiveMinimum': ['minimum']
    },
    'default': {}
};

exports.moboJsonSchemaAdditions = {

    'properties': {

        // CHANGE EXISTING PROPERTIES

        // Mobo supports optional array notation for the properties attribute
        // This will be converted to an object, to ensure JSON Schema compatibility
        'properties': {
            'type': ['object', 'array'],
            'description': 'Mobo supports to (optionally) use the array notation instead of the object notation for the property attribute.'
        },

        // ANNOTATE EXISTING PROPERTIES
        'id': {
            'description': 'Usually auto generated id, consisting of the filename',
            'type': 'string'
        },
        'title': {
            'description': 'Human readable title of the field',
            'type': 'string',
            'default': undefined
        },
        'description': {
            'description': 'Description of the field. Can be displayed as tooltip info',
            'type': 'string',
            'default': undefined
        },
        'format': {
            'type': 'string',
            'description': 'Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend',
            'default': undefined
        },

        // ADD CUSTOM MOBO SPECIFIC GLOBAL PROPERTIES
        '$extend': {
            'type': ['string', 'array'],
            'description': 'This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten.',
            'default': undefined,
            'pattern': '^\/.*\/\_*.*$',
            'uniqueItems': true
        },
        '$remove': {
            'type': 'array',
            'description': 'Array, containing all properties to remove from the current object',
            'default': undefined,
            'minItems': 1,
            'uniqueItems': true
        },
        '$reference': {
            'type': 'object',
            'description': 'For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)',
            'default': undefined,
            'minItems': 1,
            'uniqueItems': true
        },
        '$path': {
            'type': 'string',
            'description': 'For internal use only! This stores the path of the object, as used in "$extend" or "format". Used for improved debugging messages',
            'default': undefined
        },
        '$filepath': {
            'type': 'string',
            'description': 'For internal use only! This stores the complete relative path of the .json file. Used for improved debugging messages',
            'default': undefined
        },
        'ignore': {
            'type': 'boolean',
            'description': 'If true this file will be ignored.',
            'default': false
        },
        'abstract': {
            'type': 'boolean',
            'default': false,
            'description': 'If true this object is only used for inheritance and will not be created itself.'
        },
        deprecated: {
            'type': 'boolean',
            'description': 'If true, the field will be deprecated. This means it will not be displayed in forms, but the template will keep it in order to display old entries.',
            'default': false
        },
        'propertyOrder': {
            '$ref': '#/definitions/schemaArray',
            'type': 'array',
            'description': 'Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order.',
            'default': undefined,
            'minItems': 1,
            'uniqueItems': true
        },
        'todo': {
            'type': 'string',
            'description': 'If todo notes are placed here, mobo can output them (this is a setting)',
            'default': undefined
        },
        'note': {
            'description': 'Notes can be strings or objects and their content will be ignored',
            'type': ['string', 'object'],
            'default': undefined
        }
    },

    'additionalProperties': false
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
    'properties.allOf',
    'properties.anyOf',
    'dependencies',
    '$ref'
];

for (var i = 0; i < exports.jsonSchemaCoreRemovals.length; i++) {
    var feature = exports.jsonSchemaCoreRemovals[i];
    delete  exports.moboJsonSchema[feature];
}

exports.fieldSchemaAdditions = {

    'title': 'mobo fields',
    'description': 'mobo field JSON Schema',

    'properties': {
        'smw_property': {
            'type': 'boolean',
            'default': true,
            'description': 'If set to false, the property will not be saved as a SMW property, through #set or #subobject'
        },
        'smw_form': {
            'type': 'object',
            'description': 'Object, containing SemanticForms option, that will be redirected to the form',
            'additionalProperties': true
        },
        'smw_hideInPage': {
            'type': 'boolean',
            'description': 'If true the field will not be visibly renderd in the page view',
            'default': false
        },
        'smw_hideInForm': {
            'type': 'boolean',
            'description': 'If true, the field will not be visible in the form edit view',
            'default': false
        },
        'smw_overwriteOutput': {
            'type': 'string',
            'description': 'Overwrites the final value of the field, used for both display and data set',
            'default': undefined
        },
        'smw_overwriteOutputToLink': {
            'type': 'boolean',
            'description': 'If true, this will create a link in display mode, but the data will not receive the appended [[]]',
            'default': undefined
        },
        'smw_overwriteDisplay': {
            'type': 'string',
            'description': 'Overwrites only the display value of the current field',
            'default': undefined
        },
        'smw_overwriteData': {
            'type': 'string',
            'description': 'Overwrites the final #set or #subobject value of the field. This will also overwrite smw_overwriteOutput.'
        },
        'smw_forceSet': {
            'type': 'boolean',
            'description': 'Forces the semantic storage of the attribute through the #set parser function. This is useful for #subobject models that want to expose one or more fields as regular #set properties.',
            'default': false
        },
        'smw_arraymaptemplate': {
            'type': 'string',
            'description': 'Name of the arraymap template (https://www.mediawiki.org/wiki/Extension:Semantic_Forms/Semantic_Forms_and_templates#arraymaptemplate) to use. Field needs to be of type "array".',
            'default': false
        },
        'smw_drilldown': {
            'type': 'boolean',
            'description': 'If the global settings "smw_semanticDrilldown" is enabled, fields with smw_drilldown set to true will be filterable. ',
            'default': false
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

    'description': 'mobo model JSON Schema',

    'properties': {
        'recommended': {
            '$ref': '#/definitions/schemaArray',
            'description': 'Array of fields that should be highlighted as recommended (complementary to mandatory)'
        },
        'smw_subobject': {
            'type': 'boolean',
            'default': false,
            'description': 'If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances.'
        },
        'smw_subobjectExtend': {
            'type': 'object',
            'default': undefined,
            'description': 'Contains a set (object) of additional #subobject properties'
        },
        'smw_display': {
            'type': 'string',
            'default': 'table',
            'description': 'Defines the template output rendering mode, whether the template should use tables, ul, etc.'
        },
        'smw_prefix': {
            'type': 'object',
            'description': 'Adds a prefix wikitext to forms and models. Can auto-generate headers.',
            'properties': {
                'wikitext': {
                    'type': 'string',
                    'description': 'wikitext to prefix',
                    'default': undefined
                },
                'header': {
                    'type': 'number',
                    'description': 'Inserts auto generated header of given hierachy (1-6)',
                    'minimum': 1,
                    'maximum': 6,
                    'default': undefined
                },
                'template': {
                    'type': 'string',
                    'description': 'name of a template to inject. Must exist',
                    'default': undefined
                },
                'showForm': {
                    'type': 'boolean',
                    'description': 'Display prefix in form-view',
                    'default': true
                },
                'showPage': {
                    'type': 'boolean',
                    'description': 'Display prefix in page-view',
                    'default': true
                }
            },
            'additionalProperties': false,
            'default': undefined
        },
        'smw_postfix': {
            'type': 'object',
            'description': 'Adds a postfix wikitext to forms and models',
            'properties': {
                'wikitext': {
                    'type': 'string',
                    'description': 'wikitext to postfix',
                    'default': undefined
                },
                'template': {
                    'type': 'string',
                    'description': 'name of a template to inject. Must exist',
                    'default': undefined
                },
                'showForm': {
                    'type': 'boolean',
                    'description': 'Display postfix in form-view',
                    'default': true
                },
                'showPage': {
                    'type': 'boolean',
                    'description': 'Display postfix in page-view',
                    'default': true
                }
            },
            'additionalProperties': false,
            'default': undefined
        },
        'smw_categoryPrefix': {
            'type': 'string',
            'description': 'wikitext to prefix on the category page',
            'default': undefined
        },
        'smw_categoryPostfix': {
            'type': 'string',
            'description': 'wikitext to postfix on the category page',
            'default': undefined
        },
        'smw_category': {
            'type': 'boolean',
            'default': true,
            'description': 'This property decides whether the template should tag the page as a category of the model-name.'
        },
        'smw_categories': {
            '$ref': '#/definitions/schemaArray',
            'description': 'Array of additional categories the template should set.',
            'default': undefined
        },
        'showForm': {
            'type': 'boolean',
            'default': true,
            'description': 'This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view.'
        },
        'showPage': {
            'type': 'boolean',
            'default': true,
            'description': 'This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view.'
        },
        'additionalProperties': false
    }
};

/**
 * JSON Schema for validating mobos model schemas
 *
 * @type {{}}
 */
exports.modelSchema = _.merge(exports.moboJsonSchema, exports.modelSchemaAdditions);


exports.formSchemaAdditions = {

    'description': 'mobo form JSON Schema',

    'properties': {
        'smw_forminput': {
            'type': 'object',
            'description': 'Object, containing SemanticForms #forminput options',
            'additionalProperties': true
        },
        'smw_forminfo': {
            'type': 'object',
            'description': 'Object (Set), containing all SemanticForms info parameters.'
        },
        'smw_naming': {
            'type': 'string',
            'description': 'Provides naming conventions / guideline. Will appear on the form page itself.'
        },
        'smw_freetext': {
            'type': 'boolean',
            'default': true,
            'description': 'Decides whether the freetext textarea will be displayed below the form.'
        },
        'smw_summary': {
            'type': 'boolean',
            'default': false,
            'description': 'Decides whether a summary field will be displayed at the bottom of the form.'
        }
    }
};

/**
 * JSON Schema for validating mobos form schemas
 *
 * @type {{}}
 */
exports.formSchema = _.merge(exports.moboJsonSchema, exports.formSchemaAdditions);
