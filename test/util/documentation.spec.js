/*global describe,it*/
'use strict';

//////////////////////////////////////////
// REQUIREMENTS                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var documentation = require('../../lib/util/documentation.js');


//////////////////////////////////////////
// TESTS                                //
//////////////////////////////////////////

describe('Documentation Generator ', function() {

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

    it('writes/updates automatic schema documentation', function() {
        var schemaDescriptions = documentation.writeSchemas();
        expect(Object.keys(schemaDescriptions).length).to.be.least(3);
    });

    it('builds HTML tables from JSON Schema', function() {
        var result = documentation.convertSchemaToTable(testSchema);
        expect(result).to.contain('<table');
    });

});
