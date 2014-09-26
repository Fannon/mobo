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
var fileServer = require('node-static');

var mobo       = require('./lib/mobo');

var logger     = require('./lib/logger.js');
var log        = logger.log;


//////////////////////////////////////////
// VARIABLES                            //
//////////////////////////////////////////

var userArgs    = process.argv;
var searchParam = userArgs[2];
var cwd         = process.cwd();
var start       = (new Date).getTime();
var settings    = mobo.getSettings();



//////////////////////////////////////////
// CLI COMMANDS                         //
//////////////////////////////////////////

// TODO: Missing Features:
// * Create demo project
// * validate only


if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1 ) {
    var helpText = fs.readFileSync(__dirname + '/cli.md').toString();
    return console.log(helpText);
}

if (userArgs.indexOf('-v') !== -1 || userArgs.indexOf('--version') !== -1) {
    return console.log(require('./package').version);
}

if (userArgs.indexOf('-c') !== -1 || userArgs.indexOf('--config') !== -1) {
    console.log('Currently used settings:');
    return console.log(JSON.stringify(settings, false, 4));
}

if (userArgs.indexOf('-i') !== -1 || userArgs.indexOf('--init') !== -1 ) {
    mobo.init('init');
    return;
}

// Run-through mode
if (userArgs.indexOf('--dont-watch') !== -1) {
    settings.serveWebapp = false;
    settings.watchFilesystem = false;
}

// Force upload
if (userArgs.indexOf('-f') !== -1 || userArgs.indexOf('--force') !== -1) {
    console.log('Forcing upload of all sites!');
    settings.forceUpload = true;
}

// If settings are provided
if (settings) {

    //////////////////////////////////////////
    // RUN MOBO                             //
    //////////////////////////////////////////

    mobo.run(settings);


    //////////////////////////////////////////
    // SERVE WEBAPP                         //
    //////////////////////////////////////////

    var file = new fileServer.Server(__dirname + '/webapp');

    log('');
    log('> [INFO] Serving the webapp at http://localhost:' + settings.port + '/');

    require('http').createServer(function (request, response) {

        request.addListener('end', function () {

            if (request.url === '/_processed/_registry.js' ||
                request.url === '/_processed/_generated.js'||
                request.url === '/_processed/_graph_layouted.gexf' ) {

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
                file.serve(request, response);
            }

        }).resume();

    }).listen(settings.port);


    //////////////////////////////////////////
    // WATCH MODEL (FILESYSTEM)             //
    //////////////////////////////////////////

    var chokidar = require('chokidar');

    log('> [INFO] Watching for changes in the filesystem');
    log('> [INFO] Enter q to quit the interactive mode');

    // Create filesystem watcher
    var watcher = chokidar.watch(
        [
            cwd + '/settings.json',
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

            // Update Settings, generate new model
            settings = mobo.getSettings();
            mobo.run(settings);

        })
        .on('error', function(error) {
            log('> [ERROR] Watching failed with error', error);
        })
    ;

    //////////////////////////////////////////
    // LISTEN FOR USER INPUT                //
    //////////////////////////////////////////

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


