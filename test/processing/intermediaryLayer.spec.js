/*global describe, it*/
'use strict';

//////////////////////////////////////////
// DEPENDENCIES                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var _ = require('lodash');

var settings = require('./../../lib/settings.json');
var mockModel = require('./../_mockObjects/mockModel.json');
var intermediaryLayer = require('../../lib/modelToModel/intermediaryLayer.js');


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
            'properties': {
                '3': {  },
                '1': {  },
                '2': {  },
                '4': {  },
                '5': {  }
            },
            'propertyOrder': [
                '1',
                '2',
                '3',
                '4'
            ]
        };

        var orderedModel = intermediaryLayer.orderObjectProperties(unorderedModel);

        for (property in orderedModel.properties) {
            orderedModelArray.push(property);
        }
        expect(orderedModelArray).to.deep.equal(['1', '2', '3', '4', '5']);
    });

    it('inherits $extend properties', function() {

        intermediaryLayer.inheritanceStack = [];
        intermediaryLayer.settings = settings;

        // Mock Circle model
        var Circle = _.clone(mockModel.model.Circle, true);

        // Mock expanded model registry
        mockModel.expandedModel = _.clone(mockModel.model, true);


        var extendedCircle = intermediaryLayer.extend(Circle, Circle.$extend, mockModel);

        // $extend is replaced through $reference
        expect(extendedCircle).to.not.include.keys(['$extend']);
        expect(extendedCircle).to.include.keys(['$reference']);

        // Circle should now have inherited properties from _Shape
        expect(extendedCircle.properties).to.include.keys(['x', 'y']);

    });

    it('expands the fields', function() {
        mockModel.expandedFields = intermediaryLayer.expandRegistry(mockModel, 'field');
        expect(mockModel.expandedFields).to.include.keys(['radius']);
    });

    it('applies one-step inhertitance to models', function() {
        var extendedCircle = intermediaryLayer.inherit(mockModel.model.Circle, mockModel);
        expect(extendedCircle.properties.radius.title).to.equal('radius');
        expect(extendedCircle.properties.radius.$reference.path).to.equal('/field/radius.json');
    });

    it('expands the models', function() {
        mockModel.expandedModel = intermediaryLayer.expandRegistry(mockModel, 'model');

        expect(mockModel.expandedModel).to.include.keys(['_Shape', 'Circle']);

        // Check that the model properties are correctly inherited
        expect(mockModel.expandedModel.Circle.properties.radius.title).to.equal('radius');
        expect(mockModel.expandedModel.Circle.properties.radius.$reference.path).to.equal('/field/radius.json');

    });

    it('expands the forms', function() {

        mockModel.expandedForms = intermediaryLayer.expandRegistry(mockModel, 'form');

        expect(mockModel.expandedForms).to.include.keys(['Rectangle', 'Circle']);

        // Check that the form properties are correctly inherited
        expect(mockModel.expandedForms.Circle.properties.circle.items.title).to.equal('Circle');
    });

});
