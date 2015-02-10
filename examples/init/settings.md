## settings.json documentation 
This file documents all available options for the settings.json and their defaults. 

```json
{
    "mw_server_url": {
        "type": [
            "string",
            "boolean"
        ],
        "description": "URL to your MediaWiki server without trailing slash. Do not include the port or relative path to MediaWiki here!"
    },
    "mw_server_path": {
        "type": [
            "string",
            "boolean"
        ],
        "description": "Relative path to the MediaWiki installation without trailing slash"
    },
    "mw_server_port": {
        "type": [
            "string",
            "boolean"
        ],
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
                "default": 2,
                "minimum": 0,
                "description": ""
            },
            "multipleEdgeWeight": {
                "type": "number",
                "default": 2,
                "minimum": 0,
                "description": ""
            }
        }
    }
}
```

## Default settings
These are the default settings that mobo comes with:

```json
{
    "mw_server_url": false,
    "mw_server_path": false,
    "mw_server_port": false,
    "mw_username": "username",
    "mw_password": "password",
    "debug": false,
    "verbose": false,
    "displayTodos": true,
    "watchFilesystem": true,
    "serveWebApp": true,
    "generateWikiPages": true,
    "uploadWikiPages": true,
    "deleteWikiPages": false,
    "forceUpload": false,
    "buildGraph": true,
    "writeExportFiles": false,
    "writeLogFile": false,
    "uploadConcurrency": 4,
    "webAppPort": 8080,
    "autoRefreshWebGui": true,
    "autoRefreshPort": 8081,
    "headerTabs": false,
    "formEditHelper": false,
    "hideFormEditHelper": false,
    "defaultTemplateDisplay": "table",
    "useSimpleTooltipDescriptions": false,
    "sfDivLayout": false,
    "buildGraphSettings": {
        "dataTypeNodeSize": 8,
        "templateNodeSize": 12,
        "modelNodeSize": 20,
        "formNodeSize": 32,
        "edgeWeight": 2,
        "multipleEdgeWeight": 2
    }
}
```
