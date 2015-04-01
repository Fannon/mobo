#! /usr/bin/env node
/* global console, __dirname */
'use strict';

/**
 * mobo is a JSON Schema based Modeling Bot for Semantic MediaWiki
 *
 * @author  Simon Heimler <heimlersimon@gmail.com>
 * https://github.com/Fannon/mobo
 */

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var path         = require('path');
var fs           = require('fs-extra');
var argv         = require('minimist')(process.argv.slice(2));

var mobo         = require('./mobo');
var readSettings = require('./input/readSettings');
var nuker        = require('./output/nuker');
var moboUtil     = require('./util/moboUtil.js');
var log          = moboUtil.log;


//////////////////////////////////////////
// VARIABLES                            //
//////////////////////////////////////////

/** If refreshWebGui setting is true, this will become a function that triggers the refresh */
var refreshWebGui   = false;


//////////////////////////////////////////
// CLI COMMANDS (1/2)                   //
//////////////////////////////////////////

// Returns the contents of the /cli.md help file
if (argv.h || argv.help) {
    log(mobo.getHelp());
    process.exit();
}

// Returns the version number of mobo
if (argv.v || argv.version) {
    log(mobo.getVersion());
    process.exit();
}

// Initializes a new project
if (argv.i || argv.init) {
    mobo.install('init', false);
    process.exit();
}

// Installs an example project.
if (argv.example) {
    if (argv.example === true) {
        log(' [W] You must provide the name of an existing example:');
        log(' [i] E.g. mobo --example shapes');
    } else {
        mobo.install(argv.example, false);
    }

    process.exit();
}

// Force upload: Will upload everything and ignore the DIFF
if (argv['update-schemas']) {
    log(' [i] DEVELOPER COMMAND: Updating SCHEMA.md files');
    var documentation = require('./util/documentation.js');
    documentation.writeSchemas();
    process.exit();
}

var settings    = readSettings.exec();

// If settings are provided
if (settings) {


    //////////////////////////////////////////
    // CLI COMMANDS (2/2)                   //
    //////////////////////////////////////////

    // Returns the currently used settings including all calculated and inherited attributes
    if (argv.u || argv.update) {
        mobo.update(settings, function() {});
        return;
    }

    // Returns the currently used settings including all calculated and inherited attributes
    if (argv.s || argv.c || argv.settings) {
        if (settings) {
            log(' [i] Currently used settings:');
            log(settings);
        }

        return;
    }

    // Run-through mode (will exit after run, no filewatcher or webapp is available)
    if (argv.r || argv['run-through']) {
        settings.serveWebApp = false;
        settings.watchFilesystem = false;
    }

    // Skip Upload mode
    if (argv['skip-upload']) {
        settings.uploadWikiPages = false;
        settings.deleteWikiPages = false;
    }

    // Force upload: Will upload everything and ignore the DIFF
    if (argv.f || argv.force) {
        log(' [i] Forcing upload of all sites!');
        settings.forceUpload = true;
        settings.serveWebApp = false;
        settings.watchFilesystem = false;
    }

    // Mobo Nuker
    if (argv['nuke-content']) {
        settings.nuke = true;
        settings.nukeContent = true;
    }

    if (argv['nuke-structure']) {
        settings.nuke = true;
        settings.nukeStructure = true;
    }

    if (argv['nuke-custom-namespaces']) {
        settings.nuke = true;
        settings.nukeCustomNamespaces = true;
    }

    if (settings.nuke) {
        nuker.exec(settings);
        return;
    }


    //////////////////////////////////////////
    // RUN MOBO GENERATOR                   //
    //////////////////////////////////////////

    mobo.exec(settings, false, function() {
        // done.
    });


    //////////////////////////////////////////
    // SERVE WEBAPP                         //
    //////////////////////////////////////////

    if (settings.serveWebApp) {

        var fileServer = require('node-static');

        var file = new fileServer.Server(path.resolve(__dirname, './../webapp'));

        log(' [i] INTERACTIVE MODE: Serving the webapp at http://localhost:' + settings.webAppPort + '/');

        var webserver = require('http').createServer(function(request, response) {

            request.addListener('end', function() {

                // If the webapp requests a file from the /_processed/ directory
                // Serve it from the current project dir, not the mobo /webapp/ dir
                if (request.url.indexOf('_processed/') > -1 || request.url === '/settings.json') {

                    var filename = path.join(settings.cwd, request.url);
                    fs.exists(filename, function(exists) {
                        if (!exists) {
                            console.log('> 404 Not Found: ' + filename);
                            response.writeHead(200, {'Content-Type': 'text/plain'});
                            response.write('404 Not Found\n');
                            response.end();
                        } else {
                            response.writeHead(200, 'text/javascript');
                            var fileStream = fs.createReadStream(filename);
                            fileStream.pipe(response);
                        }
                    });

                } else {
                    // Serve static files from /webapp/
                    file.serve(request, response);
                }

            }).resume();

        });

        webserver.listen(settings.webAppPort);

        webserver.on('error', function(err) {
            if (err.errno === 'EADDRINUSE') {
                log(' [E] Webserver failed, port ' + settings.webAppPort + ' is already in use!');
            } else {
                log(' [E] Webserver failed to run!');
                console.log(err);
            }
        });

    }

    //////////////////////////////////////////
    // RefreshWebGui                        //
    //////////////////////////////////////////

    if (settings.serveWebApp && settings.autoRefreshWebGui) {

        var WebSocketServer = require('ws').Server;
        var wss = new WebSocketServer({port: settings.autoRefreshPort});

        wss.broadcast = function(data) {
            for (var i in this.clients) {
                this.clients[i].send(data);
            }
        };

        refreshWebGui = function() {
            wss.broadcast();
        };

    }


    //////////////////////////////////////////
    // WATCH MODEL (FILESYSTEM)             //
    //////////////////////////////////////////

    if (settings.watchFilesystem) {

        var chokidar = require('chokidar');

        log(' [i] INTERACTIVE MODE: Watching for changes in the filesystem');

        // Create filesystem watcher
        var watcher = chokidar.watch(
            [
                settings.cwd + '/field',
                settings.cwd + '/form',
                settings.cwd + '/model',
                settings.cwd + '/smw_query',
                settings.cwd + '/smw_page',
                settings.cwd + '/smw_template'
            ],
            {
                ignored: /[\/\\]\./,
                persistent: true
            }
        );

        // Watcher events
        watcher
            .on('change', function(file) {

                log(' ');
                log(' [C] [FILESYSTEM] Detected change: ' + path.basename(file) + '');

                // Re-run mobo
                mobo.exec(settings, refreshWebGui, function() {

                });

            })
            .on('error', function(error) {
                log(' [E] Watching failed with error', error);
            }

        );
    }



    //////////////////////////////////////////
    // LISTEN FOR USER INPUT                //
    //////////////////////////////////////////

    if (settings.watchFilesystem || settings.serveWebapp) {

        log(' [i] Enter "q" to quit, "enter" to run again.');

        process.stdin.setEncoding('utf8');

        process.stdin.on('readable', function() {
            var line = process.stdin.read();

            if (line !== null) {

                var input = line.trim();

                if (input === 'q' || input === 'exit' || input === 'quit') {
                    process.exit();
                } else {
                    mobo.exec(settings, refreshWebGui);
                }
            }
        });
    }

    log('--------------------------------------------------------------------------------');


    //////////////////////////////////////////
    // WORST CASE HANDLING                  //
    //////////////////////////////////////////

    // If debug mode is deactivated quit mobo through a nicer error message if something fails completely
    // NOTE: The nodemw module has bad exeption handling, if mobo crashes it is very likely it happens there.

    if (!settings.debug) {
        process.on('uncaughtException', function(e) {
            log(' [E] Uncaught Exception! The program will exit. \n  This -can- be caused by invalid login/upload attempts to the wiki');
            log(e.message);
            log(e);
            moboUtil.writeLogHistory(settings.processedModelDir + '/logfiles/');
            process.exit(1);
        });
    }

}


