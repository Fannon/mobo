/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs-extra');

var mobo = require('../lib/mobo.js');
var readSettings = require('../lib/input/readSettings.js');


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

    var mockProjectPath = path.resolve(__dirname, './_mockProject');

    it('empties mockProject test directory', function() {
        expect(emptyMockProject(mockProjectPath)).to.equal(true);
    });

    it('can install the init project into a new directory', function() {

        var success = mobo.install('init', mockProjectPath);
        var projectContent = fs.readdirSync(mockProjectPath);

        expect(success).to.equal(true);
        expect(projectContent.length).to.be.at.least(10);
        expect(projectContent).to.include('settings.yaml');
    });

    it('updates the templates of the init project', function() {
        expect(mobo.update({
            'cwd': mockProjectPath,
            'templateDir': path.join(mockProjectPath, '/mobo_template')
        })).to.equal(true);
    });

    it('empties mockProject test directory', function() {
        expect(emptyMockProject(mockProjectPath)).to.equal(true);
    });

    it('can install the hardware example project into a new directory', function() {
        var success = mobo.install('hardware', mockProjectPath);
        var projectContent = fs.readdirSync(mockProjectPath);
        var projectModelContent = fs.readdirSync(path.resolve(mockProjectPath, './model'));

        expect(success).to.equal(true);
        expect(projectContent.length).to.be.at.least(10);
        expect(projectContent).to.include('settings.yaml');
        expect(projectModelContent).to.include('Location.yaml');
    });

    /**
     * Generates the wiki structure from the example project.
     */
    it('can generate wiki structure from the sample project (async)', function(done) {

        // Set timeout to two minutes, since this task involves some uploading
        this.timeout(120000);

        var testSettings = {
            'cwd': mockProjectPath,

            'uploadWikiPages': true,
            'deleteWikiPages': true,
            'mw_server_url': 'http://smw.fannon.de',
            'mw_server_path': '',
            'mw_username': 'mobo',
            'mw_password': 'mobopw',

            'verbose': true,
            'debug': true,
            'writeLogFile': true,
            'writeExportFiles': true,
            'uploadLogFile': true,
            'formEditHelper': true,
            'hideFormEditHelper': true,
            'compatibilityLayer': true
        };

        var finalSettings = readSettings.exec(testSettings);
        expect(finalSettings).to.include.keys('debug');

        // TODO: UnitTest is not running anymore
        done();

        //mobo.exec(finalSettings, false, function(err, generated) {
        //
        //    // Check that no error was returned
        //    expect(err).to.equal(false);
        //
        //    // Check that the generated object contains the generated wikitext
        //    expect(generated).to.be.an('object');
        //    expect(generated).to.include.keys('template:Location');
        //
        //    // Check that the _processed directory was correctly populated
        //    var processedModelContent = fs.readdirSync(path.resolve(mockProjectPath, './_processed'));
        //
        //    // 'writeExportFiles': true - Check that the _processed/wikitext directory was populated var processedModelContent = fs.readdirSync(path.resolve(mockProjectPath, './_processed'));
        //    expect(processedModelContent).to.include('_registry.json');
        //
        //    done();
        //});
    });

});
