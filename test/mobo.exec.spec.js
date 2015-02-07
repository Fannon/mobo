/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs-extra');

var mobo = require('../lib/mobo.js');


//////////////////////////////////////////
// REUSABLE FUNCTIONS                   //
//////////////////////////////////////////

var emptyMockProject = function(mockProjectPath) {
    fs.removeSync(mockProjectPath);
    fs.mkdirSync(mockProjectPath);
    return fs.existsSync(mockProjectPath);
};


//////////////////////////////////////////
// TESTS                                //
//////////////////////////////////////////

describe('mobo cli ', function() {

    var mockProjectPath = path.resolve(__dirname, './mockProject');

    it('empties mockProject test directory', function() {
        expect(emptyMockProject(mockProjectPath)).to.equal(true);
    });

    it('can install the init project into a new directory', function() {

        var success = mobo.install('init', mockProjectPath);
        var projectContent = fs.readdirSync(mockProjectPath);

        expect(success).to.equal(true);
        expect(projectContent.length).to.be.at.least(10);
        expect(projectContent).to.include('settings.json');
    });

    it('empties mockProject test directory', function() {
        expect(emptyMockProject(mockProjectPath)).to.equal(true);
    });

    it('can install the shape example project into a new directory', function() {
        var success = mobo.install('shapes', mockProjectPath);
        var projectContent = fs.readdirSync(mockProjectPath);
        var projectModelContent = fs.readdirSync(path.resolve(mockProjectPath, './model'));

        expect(success).to.equal(true);
        expect(projectContent.length).to.be.at.least(10);
        expect(projectContent).to.include('settings.json');
        expect(projectModelContent).to.include('Circle.json');
    });

    /**
     * Generates the wiki structure from the example project.
     *
     * TODO: Can't test the upload without an demo / testing wiki
     */
    it('can generate wiki structure from the sample project (async)', function(done){
        var settings = mobo.getSettings({
            "cwd": mockProjectPath,
            "uploadWikiPages": true,
            "writeExportFiles": true,
            "formEditHelper": true,
            "hideFormEditHelper": true
        });
        expect(settings).to.include.keys('debug');

        mobo.run(settings, false, function(err, generated) {

            // Check that no error was returned
            expect(err).to.equal(false);

            // Check that the generated object contains the generated wikitext
            expect(generated).to.be.an('object');
            expect(generated).to.include.keys('template:Circle');

            // Check that the _processed directory was correctly populated
            var processedModelContent = fs.readdirSync(path.resolve(mockProjectPath, './_processed'));
            expect(processedModelContent).to.include('_generated.json');

            // "writeExportFiles": true - Check that the _processed/wikitext directory was populated var processedModelContent = fs.readdirSync(path.resolve(mockProjectPath, './_processed'));
            expect(processedModelContent).to.include('_generated.json');

            done();
        });
    });

    // TODO: Check "writeExportFiles": true


});
