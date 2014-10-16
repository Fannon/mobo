Models
======
Put your model JSON files here.

Additional properties
---------------------
* `"ignore"`: [Boolean]  If true this file will be ignored by mobo.
* `"abstract"`: [Boolean]  If true this file will be used for inheritance but not uploaded to the actual model.
* `"smw_subobject"`: [Boolean] If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances. 
* `"smw_category"`: [Boolean] If true, the template will include a category tag. This is necessary for mapping forms to already created sites. 
* `"smw_categories"`: [Array] Array of Strings. Add any additional categories here. 
* `"propertyOrder"`: [Array]  Array that sets the display order of all (including inherited) properties
* `"$extend"`: [String] Models can extend from another model (inherit from it). Model properties (fields) have to be inherited through $extend too. 

$extend
-------
$extend will inherit all attributes from the referenced file. The current object overwrites the inherited one. See Example


Examples
--------
Model inheritance:

### /model/_Shape.json
```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",

    "title": "Shape",
    "description": "Generic Shape",
    "type": "object",

    "properties": {
        "x": { "$extend": "/field/x.json" },
        "y": { "$extend": "/field/y.json" }
    },
    "required": ["x", "y"],

    "abstract": true
}
```

### /model/Circle.json
```json
{
    "$extend": "/model/_Shape.json",

    "title": "Circle",
    "type": "object",

    "properties": {
        "radius": { "$extend": "/field/radius.json" },
    },
    "required": ["x", "y", "radius"],

    "abstract": false
}
```

In this example the Circle inherits all attributes of _Shape, especially the fields x and y. 
The Circle overwrites attributes like "title" and "abstract" and introduces a new field "radius"