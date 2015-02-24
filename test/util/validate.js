/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var validate = require('../../lib/util/validate.js');


//////////////////////////////////////////
// TESTS                                //
//////////////////////////////////////////

describe('Schema Validator ', function() {

    var testObject = {
        "string": "test-string",
        "number": 3
    };
    var testSchema = {
        type: "object",
        "properties": {
            "string": {
                "type": "string"
            },
            "number": {
                "type": "number"
            }
        },
        "additionalProperties": false
    };

    it('validates valid objects against JSON Schema', function() {
        var result = validate.validate(testObject, testSchema);
        expect(result.valid).to.be.true();
    });

    it('validates invalid objects against JSON Schema', function() {
        testObject.number = "wrong input type";
        var result = validate.validate(testObject, testSchema);
        expect(result.valid).to.be.false();
    });

    it('writes/updates automatic schema documentation', function() {
        var schemaDescriptions = validate.writeSchemas();
        expect(Object.keys(schemaDescriptions).length).to.be.least(3);
    });

});