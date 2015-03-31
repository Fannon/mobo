/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var validate = require('../../lib/util/validate.js');
var mockRegistry = require('../_mockObjects/hardwareExampleRegistry.json');


//////////////////////////////////////////
// TESTS                                //
//////////////////////////////////////////

describe('Schema Validator ', function() {

    var testObject = {
        'string': 'test-string',
        'number': 3
    };
    var testSchema = {
        type: 'object',
        'properties': {
            'string': {
                'type': 'string'
            },
            'number': {
                'type': 'number'
            }
        },
        'additionalProperties': false
    };

    it('validates valid objects against JSON Schema', function() {
        var result = validate.validate(testObject, testSchema);
        expect(result.valid).to.equal(true);
    });

    it('validates invalid objects against JSON Schema', function() {
        testObject.number = 'wrong input type';
        var result = validate.validate(testObject, testSchema);
        expect(result.valid).to.equal(false);
    });

    it('validates the registry', function() {
        return validate.validateRegistry(mockRegistry);
    });

    it('validates the deep registry', function() {
        return validate.validateExpandedRegistry(mockRegistry);
    });

});
