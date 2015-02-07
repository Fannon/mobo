/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var mobo = require('../lib/mobo.js');


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
        expect(mobo.getSettings({})).to.include.keys('debug');
        expect(mobo.getSettings({})).to.deep.equal(settings);

        // Test with customSettings
        expect(mobo.getSettings(customSettings).debug).to.equal(true);
    });

});
