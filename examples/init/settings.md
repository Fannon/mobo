## settings.json documentation 
This file documents all available options for the settings.json and their defaults. 

<table class="schema-description">
   <thead>
       <tr>
           <th><small>ID</small></th>
           <th><small>Type</small></th>
           <th><small>Default</small></th>
           <th><small>Description</small></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><small>mw_server_url</small></td>
           <td><small>string,boolean</small></td>
           <td><small></small></td>
           <td><small>URL to your MediaWiki server without trailing slash. Do not include the port or relative path to MediaWiki here!</small></td>
       </tr>
       <tr>
           <td><small>mw_server_path</small></td>
           <td><small>string,boolean</small></td>
           <td><small></small></td>
           <td><small>Relative path to the MediaWiki installation without trailing slash</small></td>
       </tr>
       <tr>
           <td><small>mw_server_port</small></td>
           <td><small>string,boolean</small></td>
           <td><small>false</small></td>
           <td><small>The port your MW installation is using.</small></td>
       </tr>
       <tr>
           <td><small>mw_username</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>The username of your mobo bot account</small></td>
       </tr>
       <tr>
           <td><small>mw_password</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>The password of your mobo bot account</small></td>
       </tr>
       <tr>
           <td><small>debug</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>Turns the debug mode on. This deactivated graceful error handling.</small></td>
       </tr>
       <tr>
           <td><small>verbose</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>More verbose console output. This will also tighten the model validation and display minor notices</small></td>
       </tr>
       <tr>
           <td><small>displayTodos</small></td>
           <td><small>boolean</small></td>
           <td><small>true</small></td>
           <td><small>Displays the content of todo properties from your JSON files</small></td>
       </tr>
       <tr>
           <td><small>writeLogFile</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If this is enabled, mobo will create logfiles in /_processed/logfiles/*</small></td>
       </tr>
       <tr>
           <td><small>watchFilesystem</small></td>
           <td><small>boolean</small></td>
           <td><small>true</small></td>
           <td><small>Watches the (development) project files for changed and automatically triggers re-generation.</small></td>
       </tr>
       <tr>
           <td><small>serveWebApp</small></td>
           <td><small>boolean</small></td>
           <td><small>true</small></td>
           <td><small>Serves the webGUI / app at localhost.</small></td>
       </tr>
       <tr>
           <td><small>webAppPort</small></td>
           <td><small>number</small></td>
           <td><small>8080</small></td>
           <td><small>Port the WebApp is served on the localhost</small></td>
       </tr>
       <tr>
           <td><small>autoRefreshWebGui</small></td>
           <td><small>boolean</small></td>
           <td><small>true</small></td>
           <td><small>WebGui is automatically refreshed if the server makes changes to the model</small></td>
       </tr>
       <tr>
           <td><small>autoRefreshPort</small></td>
           <td><small>number</small></td>
           <td><small>8081</small></td>
           <td><small>WebSocket port the server and the WebGui are using to notify the change. Change this if the port is already used.</small></td>
       </tr>
       <tr>
           <td><small>buildGraph</small></td>
           <td><small>boolean</small></td>
           <td><small>true</small></td>
           <td><small>Builds graph files from the model. This also includes a lot of structural validation. 
So it might make sense to keep this activated, even if the graph is not used afterwards.</small></td>
       </tr>
       <tr>
           <td><small>writeExportFiles</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If true mobo will write every generated file as a single file into the filesystem. This can be slow due to a lot of HDD I/O</small></td>
       </tr>
       <tr>
           <td><small>uploadWikiPages</small></td>
           <td><small>boolean</small></td>
           <td><small>true</small></td>
           <td><small>Uploads the generated WikiPages to an external Wiki</small></td>
       </tr>
       <tr>
           <td><small>deleteWikiPages</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>Deletes removed WikiPages from the external Wiki (use with care!)</small></td>
       </tr>
       <tr>
           <td><small>forceUpload</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>Forces the upload of all generated WikiPages, even if no changes were detected. 
This can sometimes be useful, if some changes were lost or you want to go for sure.</small></td>
       </tr>
       <tr>
           <td><small>uploadConcurrency</small></td>
           <td><small>number</small></td>
           <td><small>4</small></td>
           <td><small>Concurrent upload processes</small></td>
       </tr>
       <tr>
           <td><small>headerTabs</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If true, the HeaderTabs Extension will be used with the generated forms. Keep in mind that you still have to create the headings to make this work!</small></td>
       </tr>
       <tr>
           <td><small>formEditHelper</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If enabled this creates **FormEdit Helper Categories** that tag the WikiPages that were generated through a form as editable by that form.</small></td>
       </tr>
       <tr>
           <td><small>hideFormEditHelper</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If true this will hide the introduced Helper Categories from the display</small></td>
       </tr>
       <tr>
           <td><small>arraymapSeparator</small></td>
           <td><small>string</small></td>
           <td><small>;</small></td>
           <td><small>Separator to seperate between multiple items</small></td>
       </tr>
       <tr>
           <td><small>useSimpleTooltipDescriptions</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If enabled, descriptions will be included as SimpleTooltip tooltips. WARNING: You need to install the SimpleTooltip extension to make this work.</small></td>
       </tr>
       <tr>
           <td><small>defaultTemplateDisplay</small></td>
           <td><small>string</small></td>
           <td><small>table</small></td>
           <td><small>Default Template Display renderer. See templates/template.wikitext to see or change how they are rendered.</small></td>
       </tr>
       <tr>
           <td><small>sfDivLayout</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If enabled, mobo renders the SemanticForms as a div layout instead of the standard table layout. 
This enables more control over the layout, including some responsiveness. 
WARNING: You need to style/layout the divs by yourself, or use the VectorUp skin. 
SemanticForms itself does not support / supply this for a div based layout.</small></td>
       </tr>
       <tr>
           <td><small>generatedByMobo</small></td>
           <td><small>boolean</small></td>
           <td><small>false</small></td>
           <td><small>If enabled, mobo appends a warning and a category to each wiki page generated.</small></td>
       </tr>
       <tr>
           <td><small>generatedByMoboText</small></td>
           <td><small>string</small></td>
           <td><small><noinclude><div class="mobo-generated">This page is autogenerated, do not edit it manually!</div> [[Category:mobo-generated]]
</noinclude></small></td>
           <td><small>Wikitext that will be prefixed to each mobo generated page</small></td>
       </tr>
       <tr>
           <td><small>cwd</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>AUTO GENERATED, can be overwritten: Working (root) directory of the project where the settings.json is located</small></td>
       </tr>
       <tr>
           <td><small>importModelDir</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>AUTO GENERATED, can be overwritten.</small></td>
       </tr>
       <tr>
           <td><small>templateDir</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>AUTO GENERATED, can be overwritten.</small></td>
       </tr>
       <tr>
           <td><small>logDir</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>AUTO GENERATED, can be overwritten.</small></td>
       </tr>
       <tr>
           <td><small>processedModelDir</small></td>
           <td><small>string</small></td>
           <td><small></small></td>
           <td><small>AUTO GENERATED, can be overwritten.</small></td>
       </tr>
       <tr>
           <td><small>buildGraphSettings</small></td>
           <td><small>object</small></td>
           <td><small></small></td>
           <td><small><table class="schema-description">
   <thead>
       <tr>
           <th><small>ID</small></th>
           <th><small>Type</small></th>
           <th><small>Default</small></th>
           <th><small>Description</small></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><small>dataTypeNodeSize</small></td>
           <td><small>number</small></td>
           <td><small>8</small></td>
           <td><small></small></td>
       </tr>
       <tr>
           <td><small>templateNodeSize</small></td>
           <td><small>number</small></td>
           <td><small>12</small></td>
           <td><small></small></td>
       </tr>
       <tr>
           <td><small>modelNodeSize</small></td>
           <td><small>number</small></td>
           <td><small>12</small></td>
           <td><small></small></td>
       </tr>
       <tr>
           <td><small>formNodeSize</small></td>
           <td><small>number</small></td>
           <td><small>32</small></td>
           <td><small></small></td>
       </tr>
       <tr>
           <td><small>edgeWeight</small></td>
           <td><small>number</small></td>
           <td><small>2</small></td>
           <td><small></small></td>
       </tr>
       <tr>
           <td><small>multipleEdgeWeight</small></td>
           <td><small>number</small></td>
           <td><small>2</small></td>
           <td><small></small></td>
       </tr>
   </tbody>
   </table>
</small></td>
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
