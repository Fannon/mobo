//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs                  = require('fs-extra');
var Promise             = require('bluebird');

var logger              = require('../logger.js');
var log                 = logger.log;

var getDirectoryContent = require('../getDirectoryContent.js');
var validateSchema = require('./validateSchema.js');



//////////////////////////////////////////
// READ MODEL TO REGISTRY               //
//////////////////////////////////////////

exports.exec = function(settings) {

    var registry = {};


// Directories to fetch
    var directories = ['field', 'model', 'form', 'smw_template', 'smw_query', 'smw_page'];

// Fill Registry
    var promises = directories.map(function(name){

        var promise = getDirectoryContent.read(settings.importModelDir + '/' + name + '/');
        promise.then(function(content) {
            registry[name] = content;
        }, function(err) {
            log(' [E] Could not read project directory /' + name);
            log(err);
        });
        return promise;
    });

// After all directories are read
    Promise.all(promises).then(function() {

        /** Fallback for @deprecated project structure! */
        if (!registry.smw_page) {
            registry.smw_page = getDirectoryContent.read(settings.importModelDir + '/smw_site/');
            log(' [W] Wiki pages are now stored into /smw_site/ folder instead of /smw_page/ !');
            log(' [W] Please rename your directory accordingly!');
        }

        //////////////////////////////////////////
        // VALIDATE JSON STRUCTURE              //
        //////////////////////////////////////////

        validateSchema.validateBatch('field', registry.field);
        validateSchema.validateBatch('model', registry.model);
        validateSchema.validateBatch('form', registry.form);




        callback(false, registry);


    }).catch(function(error){
        callback(error, false);
    });

};
