/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var validateSchema = require('../lib/util/validateSchema.js');


//////////////////////////////////////////
// TESTS                                //
//////////////////////////////////////////

describe('Schema Validator ', function() {

    it('writes/updates automatic schema documentation', function() {
        var schemaDescriptions = validateSchema.writeSchemas();
        expect(Object.keys(schemaDescriptions).length).to.equal(3);
    });

});