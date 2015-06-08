## settings.json documentation
 > Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/init/settings.md).
This file documents all available options for the settings.json and their defaults.
<table class="schema-description">
   <thead>
       <tr>
           <th><sub>ID</sub></th>
           <th><sub>Type</sub></th>
           <th><sub>Default</sub></th>
           <th><sub>Description</sub></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><sub>mw_server_url</sub></td>
           <td><sub>string,boolean</sub></td>
           <td><sub></sub></td>
           <td><sub>URL to your MediaWiki server without trailing slash. Do not include the port or relative path to MediaWiki here!</sub></td>
       </tr>
       <tr>
           <td><sub>mw_server_path</sub></td>
           <td><sub>string,boolean</sub></td>
           <td><sub></sub></td>
           <td><sub>Relative path to the MediaWiki installation without trailing slash</sub></td>
       </tr>
       <tr>
           <td><sub>mw_server_port</sub></td>
           <td><sub>string,boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>The port your MW installation is using.</sub></td>
       </tr>
       <tr>
           <td><sub>mw_username</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>The username of your mobo bot account</sub></td>
       </tr>
       <tr>
           <td><sub>mw_password</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>The password of your mobo bot account</sub></td>
       </tr>
       <tr>
           <td><sub>debug</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Turns the debug mode on. This deactivated graceful error handling.</sub></td>
       </tr>
       <tr>
           <td><sub>verbose</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>More verbose console output. This will also tighten the model validation and display minor notices</sub></td>
       </tr>
       <tr>
           <td><sub>logDate</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Prepend the time (and eventually date) on each logging message</sub></td>
       </tr>
       <tr>
           <td><sub>logLongDate</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true and logDate is enabled, the full date will be logged in addition to the time</sub></td>
       </tr>
       <tr>
           <td><sub>displayTodos</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Displays the content of todo properties from your JSON files</sub></td>
       </tr>
       <tr>
           <td><sub>writeLogFile</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>If this is enabled, mobo will create logfiles in /_processed/logfiles/*</sub></td>
       </tr>
       <tr>
           <td><sub>uploadReport</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>If this is enabled, mobo will upload a report at User at /User:<bot username>"</sub></td>
       </tr>
       <tr>
           <td><sub>uploadOutline</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>If this is enabled, mobo will upload an outline of the model at /User:<bot username>/outline</sub></td>
       </tr>
       <tr>
           <td><sub>uploadOutlineCountRefs</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Adds an counter how often a template / property was internally referenced</sub></td>
       </tr>
       <tr>
           <td><sub>uploadLogFile</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If this is enabled, mobo will upload the logfile in addition to the report</sub></td>
       </tr>
       <tr>
           <td><sub>overwriteImportedPages</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If this is enabled, mobo in --import mode will overwrite already existing wiki pages</sub></td>
       </tr>
       <tr>
           <td><sub>watchFilesystem</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Watches the (development) project files for changed and automatically triggers re-generation.</sub></td>
       </tr>
       <tr>
           <td><sub>serveWebApp</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Serves the webGUI / app at localhost.</sub></td>
       </tr>
       <tr>
           <td><sub>webAppPort</sub></td>
           <td><sub>number</sub></td>
           <td><sub>8080</sub></td>
           <td><sub>Port the WebApp is served on the localhost</sub></td>
       </tr>
       <tr>
           <td><sub>autoRefreshWebGui</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>WebGui is automatically refreshed if the server makes changes to the model</sub></td>
       </tr>
       <tr>
           <td><sub>autoRefreshPort</sub></td>
           <td><sub>number</sub></td>
           <td><sub>8081</sub></td>
           <td><sub>WebSocket port the server and the WebGui are using to notify the change. Change this if the port is already used.</sub></td>
       </tr>
       <tr>
           <td><sub>statistics</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Displays simple statistics about the project model. Statistics will also be written / appended to `/_processed/_statistics.csv`</sub></td>
       </tr>
       <tr>
           <td><sub>buildGraph</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Builds graph files (.gexf) from the model.</sub></td>
       </tr>
       <tr>
           <td><sub>writeExportFiles</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true mobo will write every generated file as a single file into the filesystem. This can be slow due to a lot of HDD I/O</sub></td>
       </tr>
       <tr>
           <td><sub>force</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Forces mobo to continue despite possible errors</sub></td>
       </tr>
       <tr>
           <td><sub>uploadWikiPages</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Uploads the generated WikiPages to an external Wiki</sub></td>
       </tr>
       <tr>
           <td><sub>deleteWikiPages</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Deletes removed WikiPages from the external Wiki (use with care, this destroys the polymorphism!)</sub></td>
       </tr>
       <tr>
           <td><sub>forceUpload</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Forces the upload of all generated WikiPages, even if no changes were detected. 
This can sometimes be useful, if some changes were lost or you want to go for sure.</sub></td>
       </tr>
       <tr>
           <td><sub>uploadConcurrency</sub></td>
           <td><sub>number</sub></td>
           <td><sub>4</sub></td>
           <td><sub>Concurrent upload processes</sub></td>
       </tr>
       <tr>
           <td><sub>headerTabs</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true, the HeaderTabs Extension will be used with the generated forms. Keep in mind that you still have to create the headings to make this work!</sub></td>
       </tr>
       <tr>
           <td><sub>formEditHelper</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If enabled this creates **FormEdit Helper Categories** that tag the WikiPages that were generated through a form as editable by that form.</sub></td>
       </tr>
       <tr>
           <td><sub>hideFormEditHelper</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true this will hide the introduced Helper Categories from the display</sub></td>
       </tr>
       <tr>
           <td><sub>smw_semanticDrilldown</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Automatically generates SemanticDrilldown {{#drilldowninfo functions.</sub></td>
       </tr>
       <tr>
           <td><sub>firstAlternativeFormAsDefault</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If more than one form is defined through an oneOf array, this setting will set the first form as the default if true. If set to false, no form will be used as default and the user has to choose first.</sub></td>
       </tr>
       <tr>
           <td><sub>arraymapSeparator</sub></td>
           <td><sub>string</sub></td>
           <td><sub>;</sub></td>
           <td><sub>Separator to seperate between multiple items</sub></td>
       </tr>
       <tr>
           <td><sub>useSimpleTooltipDescriptions</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If enabled, descriptions will be included as SimpleTooltip tooltips. WARNING: You need to install the SimpleTooltip extension to make this work.</sub></td>
       </tr>
       <tr>
           <td><sub>defaultTemplateDisplay</sub></td>
           <td><sub>string</sub></td>
           <td><sub>ul</sub></td>
           <td><sub>Default Template Display renderer. See mobo_template/template.wikitext to see or change how they are rendered.</sub></td>
       </tr>
       <tr>
           <td><sub>generatedByMobo</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If enabled, mobo appends a warning and a category to each wiki page generated.</sub></td>
       </tr>
       <tr>
           <td><sub>generatedByMoboText</sub></td>
           <td><sub>string</sub></td>
           <td><sub><noinclude><div class="mobo-generated">This page is autogenerated, do not edit it manually!</div> [[Category:mobo-generated]]
</noinclude></sub></td>
           <td><sub>Wikitext that will be prefixed to each mobo generated page</sub></td>
       </tr>
       <tr>
           <td><sub>sf_responsiveForms</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub></sub></td>
           <td><sub>If enabled, mobo renders the SemanticForms as a div layout instead of the standard table layout. 
This enables more control over the layout, including some responsiveness (Bootstrap grid layout). 
WARNING: You need to style/layout the divs by yourself, or use the Chameleon skin. 
SemanticForms itself does not support / supply this for a div based layout.</sub></td>
       </tr>
       <tr>
           <td><sub>sf_wpPreview</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Semantic Forms Edit-View: Render the Preview Button</sub></td>
       </tr>
       <tr>
           <td><sub>sf_wpDiff</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Semantic Forms Edit-View: Render the Diff Button</sub></td>
       </tr>
       <tr>
           <td><sub>sf_wpWatchthis</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Semantic Forms Edit-View: Render the Watch this checkbox option</sub></td>
       </tr>
       <tr>
           <td><sub>cwd</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>AUTO GENERATED, can be overwritten: Working (root) directory of the project where the settings.json is located</sub></td>
       </tr>
       <tr>
           <td><sub>importModelDir</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>AUTO GENERATED, can be overwritten.</sub></td>
       </tr>
       <tr>
           <td><sub>templateDir</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>AUTO GENERATED, can be overwritten.</sub></td>
       </tr>
       <tr>
           <td><sub>logDir</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>AUTO GENERATED, can be overwritten.</sub></td>
       </tr>
       <tr>
           <td><sub>processedModelDir</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>AUTO GENERATED, can be overwritten.</sub></td>
       </tr>
       <tr>
           <td><sub>buildGraphSettings</sub></td>
           <td><sub>object</sub></td>
           <td><sub></sub></td>
           <td><sub><table class="schema-description">
   <thead>
       <tr>
           <th><sub>ID</sub></th>
           <th><sub>Type</sub></th>
           <th><sub>Default</sub></th>
           <th><sub>Description</sub></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><sub>dataTypeNodeSize</sub></td>
           <td><sub>number</sub></td>
           <td><sub>8</sub></td>
           <td><sub></sub></td>
       </tr>
       <tr>
           <td><sub>templateNodeSize</sub></td>
           <td><sub>number</sub></td>
           <td><sub>12</sub></td>
           <td><sub></sub></td>
       </tr>
       <tr>
           <td><sub>modelNodeSize</sub></td>
           <td><sub>number</sub></td>
           <td><sub>24</sub></td>
           <td><sub></sub></td>
       </tr>
       <tr>
           <td><sub>formNodeSize</sub></td>
           <td><sub>number</sub></td>
           <td><sub>36</sub></td>
           <td><sub></sub></td>
       </tr>
       <tr>
           <td><sub>edgeWeight</sub></td>
           <td><sub>number</sub></td>
           <td><sub>2</sub></td>
           <td><sub></sub></td>
       </tr>
       <tr>
           <td><sub>multipleEdgeWeight</sub></td>
           <td><sub>number</sub></td>
           <td><sub>2</sub></td>
           <td><sub></sub></td>
       </tr>
   </tbody>
</table>
</sub></td>
       </tr>
   </tbody>
</table>


## Default settings
These are the default settings that mobo comes with:
```json
{
    "mw_server_url": false,
    "mw_server_path": "",
    "mw_server_port": false,
    "mw_username": "username",
    "mw_password": "password",
    "force": false,
    "debug": false,
    "verbose": false,
    "displayTodos": true,
    "watchFilesystem": true,
    "serveWebApp": true,
    "uploadWikiPages": true,
    "deleteWikiPages": false,
    "forceUpload": false,
    "buildGraph": true,
    "statistics": true,
    "writeExportFiles": false,
    "writeLogFile": true,
    "uploadReport": true,
    "uploadOutline": true,
    "uploadOutlineCountRefs": false,
    "uploadLogFile": false,
    "overwriteImportedPages": false,
    "logDate": true,
    "logLongDate": false,
    "uploadConcurrency": 4,
    "webAppPort": 8080,
    "autoRefreshWebGui": true,
    "autoRefreshPort": 8081,
    "headerTabs": false,
    "formEditHelper": false,
    "hideFormEditHelper": false,
    "smw_semanticDrilldown": false,
    "firstAlternativeFormAsDefault": false,
    "arraymapSeparator": ";",
    "defaultTemplateDisplay": "ul",
    "useSimpleTooltipDescriptions": false,
    "generatedByMobo": false,
    "generatedByMoboText": "<noinclude><div class=\"mobo-generated\">This page is autogenerated, do not edit it manually!</div> [[Category:mobo-generated]]\n</noinclude>",
    "sf_responsiveForms": false,
    "sf_wpPreview": true,
    "sf_wpDiff": true,
    "sf_wpWatchthis": true,
    "buildGraphSettings": {
        "dataTypeNodeSize": 8,
        "templateNodeSize": 12,
        "modelNodeSize": 24,
        "formNodeSize": 36,
        "edgeWeight": 2,
        "multipleEdgeWeight": 2
    }
}
```