/*global describe, it*/
'use strict';

//////////////////////////////////////////
// DEPENDENCIES                         //
//////////////////////////////////////////

var expect = require('chai').expect;
var buildRegistry = require('../lib/model/buildRegistry.js');


//////////////////////////////////////////
// MOCK OBJECTS / DATA                  //
//////////////////////////////////////////

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

var mockModel = {
    field: {},
    model: {},
    form: {}
};

mockModel.field.x = {
    "title": "x",
    "type": "number"
};
mockModel.field.y = {
    "title": "y",
    "type": "number"
};
mockModel.field.color = {
    "title": "color",
    "type": "string",
    "enum": [
        "red",
        "green",
        "blue"
    ]
};
mockModel.field.radius = {
    "title": "radius",
    "type": "number",
    "minimum": 0
};


mockModel.model._Shape = {
    "title": "Shape",
    "description": "Generic Shape",
    "type": "object",
    "properties": {
        "x": { "$extend": "/field/x.json" },
        "y": { "$extend": "/field/y.json" },
        "color": { "$extend": "/field/color.json" }
    },
    "required": ["x", "y"],
    "abstract": true
};

mockModel.model.Circle = {
    "$extend": "/model/_Shape.json",
    "title": "Circle",
    "type": "object",
    "properties": {
        "radius": {
            "$extend": "/field/radius.json"
        }
    },
    "required": ["x", "y", "radius"],
    "smw_subobject": true,
    "smw_category": true,
    "abstract": false
};

describe('Registry Builder ', function() {

    /**
     * Expects a model to be ordered properly.
     * Properties not explicitly stated in the propertyOrder array will be appended at bottom.
     */
    it('orders model properties', function() {
        var property;
        var orderedModel = buildRegistry.orderObjectProperties(unorderedModel);
        var orderedModelArray = [];

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



});
