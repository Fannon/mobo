/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var mobo = require('../lib/mobo.js');
var readSettings = require('../lib/input/readSettings.js');


//////////////////////////////////////////
// TESTS                                //
//////////////////////////////////////////

describe('mobo ', function() {

    it('has a version number', function() {
        expect(mobo.getVersion()).to.contain('.');
    });

    it('displays help', function() {
        expect(mobo.getHelp()).to.contain('ABOUT MOBO');
    });

    it('loads and inherits settings', function() {
        var settings  = require('../lib/settings.json');
        var customSettings = {
            "debug": true
        };

        // Test with empty option object (no overwrites)
        expect(readSettings.getSettings({})).to.include.keys('debug');
        expect(readSettings.getSettings({})).to.deep.equal(settings);

        // Test with customSettings
        expect(readSettings.getSettings(customSettings).debug).to.equal(true);
    });

});
