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
var _          = require('lodash');
var fileServer = require('node-static');

var settings   = require('./lib/settings.json');
var mobo       = require('./lib/mobo');


//////////////////////////////////////////
// VARIABLES                            //
//////////////////////////////////////////

var userArgs    = process.argv;
var searchParam = userArgs[2];
var cwd         = process.cwd();
var start       = (new Date).getTime();



//////////////////////////////////////////
// GET AND EXTEND SETTINGS              //
//////////////////////////////////////////

// Get and parse Settings
try {
    var projectSettings = JSON.parse(fs.readFileSync(cwd + '/settings.json').toString());
} catch(e) {
    console.log('No valid settings.json file found!');
    console.log(e);
    return;
}

// Calculate paths
settings.cwd = cwd;
settings.importModelDir = cwd;
settings.templateDir =  cwd + '\\templates\\';
settings.logDir =  cwd + '\\_logfiles\\';
settings.processedModelDir = cwd + '\\_processed\\';

// Project settings overwrites default settings!
_.merge(settings, projectSettings);


//////////////////////////////////////////
// CLI COMMANDS                         //
//////////////////////////////////////////

// TODO: Missing Features:
// * Init blank model
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
    // TODO!
    return console.log('CLI INIT');
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


//////////////////////////////////////////
// PROCESS MODEL                        //
//////////////////////////////////////////

mobo.generate(settings);

if (settings.autoUpload) {
    mobo.upload(settings);
}

//////////////////////////////////////////
// SERVE WEBAPP                         //
//////////////////////////////////////////


var file = new fileServer.Server(__dirname + '/webapp');

require('http').createServer(function (request, response) {

    request.addListener('end', function () {

        if (request.url === '/_processed/_registry.js' || request.url === '/_processed/_generated.js') {

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

// TODO!
