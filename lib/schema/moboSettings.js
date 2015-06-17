// Load default settings
var settings = require('./../settings.json');

/**
 * mobos settings schema
 * This is used for validation of project settings and auto generated documentation
 *
 * @type {{}}
 */
module.exports = {
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
        'logObjectsAsYaml': {
            'type': 'boolean',
            'default': settings.logObjectsAsYaml,
            'description': 'Logging / CLI output: Prints JavaScript Object as colorized YAML'
        },

        'arrayMergeOptions': {
            'type': 'object',
            'default': settings.arrayMergeOptions,
            'description': 'Default settings (using @annotations) for array merges',
            'properties': {
                '$remove': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.$remove
                },
                'enum': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.enum
                },
                'form': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.form
                },
                'recommended': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.recommended
                },
                'required': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.required
                },
                'itemsOrder': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.itemsOrder
                },
                'smw_categories': {
                    'type': 'array',
                    'default': settings.arrayMergeOptions.smw_categories
                }
            }
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
        'gitStatistics': {
            'type': 'boolean',
            'default': settings.gitStatistics,
            'description': 'Adds some git related statistics. Will only work if git is installed and the project is a git repository.'
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
        'compatibilityLayer': {
            'type': 'boolean',
            'default': settings.compatibilityLayer,
            'description': 'Set to false, if you want to skip the compatibility layer that migrates deprecated models to the latest standard.'
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
            'default': settings.sf_responsiveForms,
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
            'default': settings.buildGraphSettings,
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

    'additionalProperties': false
};
