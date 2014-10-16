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

    // If true the console output will be more verbose
    // This will also tighten the model validation and display notices too
    "verbose": false,
    
    // Watches your development model for changes and triggers re-generation automatically
    "watchFilesystem": true,
    
    // Serves the WebGUI / App at the localhost.
    "serveWebApp": true,
    
    
    "upload": true,
    "forceUpload": false,
    "deleteSites": false,
    "generateWikiPages": true,
    "buildGraph": true,
    "writeExportFiles": false,

    "uploadConcurrency": 4,
    "webAppPort": 8080,

    "headerTabs": false,
    "formEditHelper": false,
    "hideFormEditHelper": false
}
```