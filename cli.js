#! /usr/bin/env node
/* global console, __dirname */
"use strict";

/**
 * mobo is a JSON Schema based Modeling Bot for Semantic MediaWiki
 *
 * @author  Simon Heimler <heimlersimon@gmail.com>
 * https://github.com/Fannon/mobo
 */

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var path       = require('path');
var fs         = require('fs-extra');

var argv       = require('minimist')(process.argv.slice(2));

var mobo       = require('./lib/mobo');

var logger     = require('./lib/logger.js');
var log        = logger.log;


//////////////////////////////////////////
// VARIABLES                            //
//////////////////////////////////////////

var cwd         = process.cwd();
var start       = (new Date).getTime();
var settings    = mobo.getSettings();


//////////////////////////////////////////
// CLI COMMANDS (1/2)                   //
//////////////////////////////////////////

// Returns the contents of the /cli.md help file
if (argv.h ||argv.help) {
    log(mobo.getHelp());
    return;
}

// Returns the version number of mobo
if (argv.v || argv.version) {
    log(mobo.getVersion());
    return;
}

// Initializes a new project
if (argv.i || argv.init) {
    mobo.create('init');
    return;
}

// Installs an example project.
if (argv.example) {
    if (argv.example === true) {
        log('> [WARNING] You must provide the name of an existing example:');
        log('> E.g. mobo --example shapes');
    } else {
        mobo.create(argv.example);
    }

    return;
}

// If settings are provided
if (settings) {


    //////////////////////////////////////////
    // CLI COMMANDS (2/2)                   //
    //////////////////////////////////////////

    // Returns the currently used settings including all calculated and inherited attributes
    if (argv.s || argv.c || argv.settings) {
        if (settings) {
            log('> Currently used settings:');
            log(settings);
        }
        return;
    }

    // Run-through mode (will exit after run, no filewatcher or webapp is available)
    if (argv.r || argv['run-through']) {
        settings.serveWebapp = false;
        settings.watchFilesystem = false;
    }

    // Force upload: Will upload everything and ignore the DIFF
    if (argv.f || argv.force) {
        log('> [INFO] Forcing upload of all sites!');
        settings.forceUpload = true;
    }

    //////////////////////////////////////////
    // RUN MOBO                             //
    //////////////////////////////////////////

    mobo.run(settings);


    //////////////////////////////////////////
    // SERVE WEBAPP                         //
    //////////////////////////////////////////

    if (settings.serveWebapp) {

        var fileServer = require('node-static');

        var file = new fileServer.Server(__dirname + '/webapp');

        log('');
        log('> [INFO] Serving the webapp at http://localhost:' + settings.port + '/');

        var webserver = require('http').createServer(function (request, response) {

            request.addListener('end', function () {

                // If the webapp requests a file from the /_processed/ directory
                // Serve it from the current project dir, not the mobo /webapp/ dir
                if (request.url.indexOf("_processed/") > -1 || request.url === '/settings.json') {

                    var filename = path.join(process.cwd(), request.url);
                    fs.exists(filename, function(exists) {
                        if(!exists) {
                            console.log("> 404 Not Found: " + filename);
                            response.writeHead(200, {'Content-Type': 'text/plain'});
                            response.write('404 Not Found\n');
                            response.end();
                        } else {
                            response.writeHead(200, 'text/javascript');
                            var fileStream = fs.createReadStream(filename);
                            fileStream.pipe(response);
                        }
                    });

                } else  {
                    // Serve static files from /webapp/
                    file.serve(request, response);
                }

            }).resume();

        });

        webserver.listen(settings.port);

        webserver.on('error', function(err) {
            if (err.errno === 'EADDRINUSE') {
                log('> [ERROR] Webserver failed, port ' + settings.port + ' is already in use!');
            } else {
                log('> [ERROR] Webserver failed to run!');
                console.log(err);
            }
        });
    }


    //////////////////////////////////////////
    // WATCH MODEL (FILESYSTEM)             //
    //////////////////////////////////////////

    if (settings.watchFilesystem) {

        var chokidar = require('chokidar');

        log('> [INFO] Watching for changes in the filesystem');

        // Create filesystem watcher
        var watcher = chokidar.watch(
            [
                    cwd + '/field',
                    cwd + '/form',
                    cwd + '/model',
                    cwd + '/smw_query',
                    cwd + '/smw_site',
                    cwd + '/smw_template',
                    cwd + '/templates'
            ],
            {
                ignored: /[\/\\]\./,
                persistent: true
            }
        );

        // Watcher events
        watcher
            .on('change', function(file) {

                log('');
                log(' C File changed: ' + path.basename(file) + '');

                // Re-run mobo
                mobo.run(settings);

            })
            .on('error', function(error) {
                log('> [ERROR] Watching failed with error', error);
            })
        ;
    }



    //////////////////////////////////////////
    // LISTEN FOR USER INPUT                //
    //////////////////////////////////////////

    if (settings.watchFilesystem || settings.serveWebapp) {

        log('> [INFO] Enter q to quit the interactive mode');

        process.stdin.setEncoding('utf8');

        process.stdin.on('readable', function() {
            var line = process.stdin.read();

            if (line !== null) {

                var input = line.trim();

                if (input === 'q' || input === 'exit' || input === 'quit') {
                    process.exit();
                } else {
                    mobo.run(settings);
                }
            }
        });
    }

    //////////////////////////////////////////
    // WORST CASE HANDLING                  //
    //////////////////////////////////////////

    process.on('uncaughtException', function (e) {
        log('> [ERROR] Uncaught Exception! The program will exit.');
        log('> This -can- be caused by invalid login/upload attempts to the wiki');
        log(e);
        logger.report();
        process.exit(1);
    });

}


