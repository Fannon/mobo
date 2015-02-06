/*global describe, it*/
'use strict';

//////////////////////////////////////////
// DEPENDENCIES                         //
//////////////////////////////////////////

var expect = require('chai').expect;

var mockModel = require('./mockups/mockModel.json');
var buildRegistry = require('../lib/model/buildRegistry.js');


//////////////////////////////////////////
// MOCK OBJECTS / DATA                  //
//////////////////////////////////////////


describe('Registry Builder ', function() {

    /**
     * Expects a model to be ordered properly.
     * Properties not explicitly stated in the propertyOrder array will be appended at bottom.
     */
    it('orders model properties', function() {

        var property;
        var orderedModelArray = [];

        /** Unordered model mock-object */
        var unorderedModel = {
            "properties": {
                "3": {  },
                "1": {  },
                "2": {  },
                "4": {  },
                "5": {  }
            },
            "propertyOrder": [
                "1",
                "2",
                "3",
                "4"
            ]
        };

        var orderedModel = buildRegistry.orderObjectProperties(unorderedModel);

        for (property in orderedModel.properties) {
            orderedModelArray.push(property);
        }
        expect(orderedModelArray).to.deep.equal(["1", "2", "3", "4", "5"]);
    });


    it('applies one-step inhertitance to models', function() {
        var extendedCircle = buildRegistry.inherit(mockModel.model.Circle, mockModel);
        expect(extendedCircle.properties.radius.title).to.equal('radius');
        expect(extendedCircle.properties.radius.$reference).to.equal('/field/radius.json');
    });

    it('expands the models', function() {
        var expandedRegistry = buildRegistry.expandModels(mockModel);

        expect(expandedRegistry).to.include.keys(['_Shape', 'Circle']);
        expect(expandedRegistry.Circle).to.include.keys('$schema');

        // Check that the model properties are correctly inherited
        expect(expandedRegistry.Circle.properties.radius.title).to.equal('radius');
        expect(expandedRegistry.Circle.properties.radius.$reference).to.equal('/field/radius.json');
    });

});
