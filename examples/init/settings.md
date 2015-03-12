## settings.json documentation 
This file documents all available options for the settings.json and their defaults. 

<h3></h3>
<div class="description">mobo model JSON Schema</div>
<table class="schema-description">
   <thead>
       <tr>
           <th>ID</th>
           <th>Type</th>
           <th>Default</th>
           <th>Description</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td>mw_server_url</td>
           <td>string,boolean</td>
           <td></td>
           <td>URL to your MediaWiki server without trailing slash. Do not include the port or relative path to MediaWiki here!</td>
       </tr>
       <tr>
           <td>mw_server_path</td>
           <td>string,boolean</td>
           <td></td>
           <td>Relative path to the MediaWiki installation without trailing slash</td>
       </tr>
       <tr>
           <td>mw_server_port</td>
           <td>string,boolean</td>
           <td>false</td>
           <td>The port your MW installation is using.</td>
       </tr>
       <tr>
           <td>mw_username</td>
           <td>string</td>
           <td></td>
           <td>The username of your mobo bot account</td>
       </tr>
       <tr>
           <td>mw_password</td>
           <td>string</td>
           <td></td>
           <td>The password of your mobo bot account</td>
       </tr>
       <tr>
           <td>debug</td>
           <td>boolean</td>
           <td>false</td>
           <td>Turns the debug mode on. This deactivated graceful error handling.</td>
       </tr>
       <tr>
           <td>verbose</td>
           <td>boolean</td>
           <td>false</td>
           <td>More verbose console output. This will also tighten the model validation and display minor notices</td>
       </tr>
       <tr>
           <td>displayTodos</td>
           <td>boolean</td>
           <td>true</td>
           <td>Displays the content of todo properties from your JSON files</td>
       </tr>
       <tr>
           <td>writeLogFile</td>
           <td>boolean</td>
           <td>false</td>
           <td>If this is enabled, mobo will create logfiles in /_processed/logfiles/*</td>
       </tr>
       <tr>
           <td>watchFilesystem</td>
           <td>boolean</td>
           <td>true</td>
           <td>Watches the (development) project files for changed and automatically triggers re-generation.</td>
       </tr>
       <tr>
           <td>serveWebApp</td>
           <td>boolean</td>
           <td>true</td>
           <td>Serves the webGUI / app at localhost.</td>
       </tr>
       <tr>
           <td>webAppPort</td>
           <td>number</td>
           <td>8080</td>
           <td>Port the WebApp is served on the localhost</td>
       </tr>
       <tr>
           <td>autoRefreshWebGui</td>
           <td>boolean</td>
           <td>true</td>
           <td>WebGui is automatically refreshed if the server makes changes to the model</td>
       </tr>
       <tr>
           <td>autoRefreshPort</td>
           <td>number</td>
           <td>8081</td>
           <td>WebSocket port the server and the WebGui are using to notify the change. Change this if the port is already used.</td>
       </tr>
       <tr>
           <td>buildGraph</td>
           <td>boolean</td>
           <td>true</td>
           <td>Builds graph files from the model. This also includes a lot of structural validation. 
So it might make sense to keep this activated, even if the graph is not used afterwards.</td>
       </tr>
       <tr>
           <td>writeExportFiles</td>
           <td>boolean</td>
           <td>false</td>
           <td>If true mobo will write every generated file as a single file into the filesystem. This can be slow due to a lot of HDD I/O</td>
       </tr>
       <tr>
           <td>uploadWikiPages</td>
           <td>boolean</td>
           <td>true</td>
           <td>Uploads the generated WikiPages to an external Wiki</td>
       </tr>
       <tr>
           <td>deleteWikiPages</td>
           <td>boolean</td>
           <td>false</td>
           <td>Deletes removed WikiPages from the external Wiki (use with care!)</td>
       </tr>
       <tr>
           <td>forceUpload</td>
           <td>boolean</td>
           <td>false</td>
           <td>Forces the upload of all generated WikiPages, even if no changes were detected. 
This can sometimes be useful, if some changes were lost or you want to go for sure.</td>
       </tr>
       <tr>
           <td>uploadConcurrency</td>
           <td>number</td>
           <td>4</td>
           <td>Concurrent upload processes</td>
       </tr>
       <tr>
           <td>headerTabs</td>
           <td>boolean</td>
           <td>false</td>
           <td>If true, the HeaderTabs Extension will be used with the generated forms. Keep in mind that you still have to create the headings to make this work!</td>
       </tr>
       <tr>
           <td>formEditHelper</td>
           <td>boolean</td>
           <td>false</td>
           <td>If enabled this creates **FormEdit Helper Categories** that tag the WikiPages that were generated through a form as editable by that form.</td>
       </tr>
       <tr>
           <td>hideFormEditHelper</td>
           <td>boolean</td>
           <td>false</td>
           <td>If true this will hide the introduced Helper Categories from the display</td>
       </tr>
       <tr>
           <td>arraymapSeparator</td>
           <td>string</td>
           <td>;</td>
           <td>Separator to seperate between multiple items</td>
       </tr>
       <tr>
           <td>useSimpleTooltipDescriptions</td>
           <td>boolean</td>
           <td>false</td>
           <td>If enabled, descriptions will be included as SimpleTooltip tooltips. WARNING: You need to install the SimpleTooltip extension to make this work.</td>
       </tr>
       <tr>
           <td>defaultTemplateDisplay</td>
           <td>string</td>
           <td>table</td>
           <td>Default Template Display renderer. See templates/template.wikitext to see or change how they are rendered.</td>
       </tr>
       <tr>
           <td>sfDivLayout</td>
           <td>boolean</td>
           <td>false</td>
           <td>If enabled, mobo renders the SemanticForms as a div layout instead of the standard table layout. 
This enables more control over the layout, including some responsiveness. 
WARNING: You need to style/layout the divs by yourself, or use the VectorUp skin. 
SemanticForms itself does not support / supply this for a div based layout.</td>
       </tr>
       <tr>
           <td>generatedByMobo</td>
           <td>boolean</td>
           <td>false</td>
           <td>If enabled, mobo appends a warning and a category to each wiki page generated.</td>
       </tr>
       <tr>
           <td>generatedByMoboText</td>
           <td>string</td>
           <td><noinclude><div class="mobo-generated">This page is autogenerated, do not edit it manually!</div> [[Category:mobo-generated]]
</noinclude></td>
           <td>Wikitext that will be prefixed to each mobo generated page</td>
       </tr>
       <tr>
           <td>cwd</td>
           <td>string</td>
           <td></td>
           <td>AUTO GENERATED, can be overwritten: Working (root) directory of the project where the settings.json is located</td>
       </tr>
       <tr>
           <td>importModelDir</td>
           <td>string</td>
           <td></td>
           <td>AUTO GENERATED, can be overwritten.</td>
       </tr>
       <tr>
           <td>templateDir</td>
           <td>string</td>
           <td></td>
           <td>AUTO GENERATED, can be overwritten.</td>
       </tr>
       <tr>
           <td>logDir</td>
           <td>string</td>
           <td></td>
           <td>AUTO GENERATED, can be overwritten.</td>
       </tr>
       <tr>
           <td>processedModelDir</td>
           <td>string</td>
           <td></td>
           <td>AUTO GENERATED, can be overwritten.</td>
       </tr>
       <tr>
           <td>buildGraphSettings</td>
           <td>object</td>
           <td></td>
           <td><h3></h3>
<table class="schema-description">
   <thead>
       <tr>
           <th>ID</th>
           <th>Type</th>
           <th>Default</th>
           <th>Description</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td>dataTypeNodeSize</td>
           <td>number</td>
           <td>8</td>
           <td></td>
       </tr>
       <tr>
           <td>templateNodeSize</td>
           <td>number</td>
           <td>12</td>
           <td></td>
       </tr>
       <tr>
           <td>modelNodeSize</td>
           <td>number</td>
           <td>12</td>
           <td></td>
       </tr>
       <tr>
           <td>formNodeSize</td>
           <td>number</td>
           <td>32</td>
           <td></td>
       </tr>
       <tr>
           <td>edgeWeight</td>
           <td>number</td>
           <td>2</td>
           <td></td>
       </tr>
       <tr>
           <td>multipleEdgeWeight</td>
           <td>number</td>
           <td>2</td>
           <td></td>
       </tr>
   </tbody>
   </table>
</td>
       </tr>
   </tbody>
   </table>

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
    "arraymapSeparator": ";",
    "defaultTemplateDisplay": "table",
    "useSimpleTooltipDescriptions": false,
    "sfDivLayout": false,
    "generatedByMobo": false,
    "generatedByMoboText": "<noinclude><div class=\"mobo-generated\">This page is autogenerated, do not edit it manually!</div> [[Category:mobo-generated]]\n</noinclude>",
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
