Available settings
==================

```javascript
{
    // URL to your MediaWiki server without trailing slash. Do not include the port here!
    "mw_server_url": "http://localhost",
    
    // path where the MediaWiki is installed without trailing slash
    "mw_server_path": "/wiki",
    
    // The port your MW installation is using. Use false to use the default (80 / 443)
    "mw_server_port": false,
    
    // The username of your mobo bot account
    "mw_username": "username",
    
    // Password of your mobo bot account
    "mw_password": "password",
    
    // Turns the debug mode on. This deactivated graceful error handling.
    "debug": false,

    // If true the console output will be more verbose
    // This will also tighten the model validation and display notices too
    "verbose": false,
    
    // Displays "todo" properties from your JSON files
    "displayTodos": true,
    
    // Watches the (development) project files for changed and automatically triggers re-generation. 
    "watchFilesystem": true,
    
    // Serves the WebGUI / App at the localhost.
    "serveWebApp": true,
    
    // Generates WikiPages from the development model
    "generateWikiPages": true,
    
    // Uploads the generated WikiPages to an external Wiki (
    "uploadWikiPages": true,
    
    // Deletes removed WikiPages from the external Wiki (use with care!)
    "deleteWikiPages": false,
    
    // Forces the upload of all generated WikiPages, even if no changes were detected
    // This can sometimes be useful, if some changes were lost or you want to go for sure.
    "forceUpload": false,
    
    // Builds graph files from the model. This also includes a lot of structural validation.
    // So it might make sense to keep this activated, even if the graph is not used afterwards.
    "buildGraph": true,
    
    // If true mobo will write every generated file as a single file into the filesystem. 
    // This can be slow due to a lot of HDD I/O
    "writeExportFiles": false,

    // Concurrent upload processes
    "uploadConcurrency": 4,
    
    // Port the WebApp is served on the localhost
    "webAppPort": 8080,
    
    // WebGui is automatically refreshed if the server makes changes to the model
    "autoRefreshWebGui": true,
    
    // WebSocket port the server and the WebGui are using to notify the change
    "autoRefreshPort": 8081,
        
    // If true, the HeaderTabs Extension will be used with the generated forms
    // Keep in mind that you still have to create the headings to make this work!
    "headerTabs": false,
    
    // If enabled this creates "* FormEdit" Helper Categories that tag the WikiPages that were generated
    // through a form as editable by that form. 
    "formEditHelper": false,
    
    // If true this will hide the introduced Helper Categories from the display
    "hideFormEditHelper": false
    
}
```