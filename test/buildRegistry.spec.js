/*global describe, it*/
'use strict';

//////////////////////////////////////////
// DEPENDENCIES                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var _ = require('lodash');

var mockModel = require('./mockObjects/mockModel.json');
var buildRegistry = require('../lib/processing/buildRegistry.js');


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

    it('inherits $extend properties', function() {

        // Mock Circle model
        var Circle = _.clone(mockModel.model.Circle, true);

        // Mock expanded model registry
        mockModel.expandedModel = _.clone(mockModel.model, true);


        var extendedCircle = buildRegistry.extend(Circle, Circle.$extend, mockModel);

        // $extend is replaced through $reference
        expect(extendedCircle).to.not.include.keys(['$extend']);
        expect(extendedCircle).to.include.keys(['$reference']);

        // Circle should now have inherited properties from _Shape
        expect(extendedCircle.properties).to.include.keys(['x', 'y']);

    });

    it('applies one-step inhertitance to models', function() {
        var extendedCircle = buildRegistry.inherit(mockModel.model.Circle, mockModel);
        expect(extendedCircle.properties.radius.title).to.equal('radius');
        expect(extendedCircle.properties.radius.$reference).to.equal('/field/radius.json');
    });

    it('expands the models', function() {
        mockModel.expandedModel = buildRegistry.expandModels(mockModel);

        expect(mockModel.expandedModel).to.include.keys(['_Shape', 'Circle']);
        expect(mockModel.expandedModel.Circle).to.include.keys('$schema');

        // Check that the model properties are correctly inherited
        expect(mockModel.expandedModel.Circle.properties.radius.title).to.equal('radius');
        expect(mockModel.expandedModel.Circle.properties.radius.$reference).to.equal('/field/radius.json');

    });

    it('expands the forms', function() {
        mockModel.expandedForms = buildRegistry.expandForms(mockModel);

        expect(mockModel.expandedForms).to.include.keys(['Rectangle', 'Circle']);

        // Check that the form properties are correctly inherited
        expect(mockModel.expandedForms.Circle.properties.circle.items.title).to.equal('Circle');
    });

});
