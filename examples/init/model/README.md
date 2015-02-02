Models
======
Models represent MediaWiki Categories and Templates.
They define which fields they consist of to form a specific "Thing".
Models can extend from other models and inherit their properties.

Additional properties
---------------------
See the corresponding [model/SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/model/SCHEMA.md) for a description of all possible properties.

$extend
-------
$extend will inherit all attributes from the referenced file. The current object overwrites the inherited one. See Example below:


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