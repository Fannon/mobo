/*global describe, it*/
'use strict';

var expect = require('chai').expect;
var path = require('path');
var fs = require('fs-extra');

var readProject = require('../../lib/input/readProject.js');
var mobo = require('../../lib/mobo.js');


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

describe('reads project files', function() {

    var mockProjectPath = path.resolve(__dirname, './../_mockProject');

    //it('empties mockProject test directory', function() {
    //    expect(emptyMockProject(mockProjectPath)).to.equal(true);
    //});
    //
    //it('installs the shape example project into a new directory', function() {
    //    expect(mobo.install('shapes', mockProjectPath)).to.equal(true);
    //});
    //
    //it('reads the project files (async)', function() {
    //    var promise = readProject.exec(mockProjectPath).then(function(registry) {
    //        expect(registry.field).to.exist();
    //        expect(registry.field).to.include.keys(['x', 'y']);
    //        done();
    //    });
    //
    //});

});
