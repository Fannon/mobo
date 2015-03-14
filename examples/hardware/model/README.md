# Models
* Read this file online at GitHub: [model/README.md](https://github.com/Fannon/mobo/blob/master/examples/init/model/README.md)
* See the corresponding [model/SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/model/SCHEMA.md) for a technical description of all possible properties.

## Description
Models will create Templates and Categories. They define the actual struc-ture of the development model. 

They usually declare:
* Which models they inherit from
* Which fields are used
* The order of the fields
* Mandatory and recommended fields
* The template “rendering” mode (table, unordered lists, …)
* If they are stored as regular semantic properties or a subobject
* MediaWiki Categories
* Prefix and Postfix wikitext

## Additional properties

$extend
-------
$extend will inherit all attributes from the referenced file. The current object overwrites the inherited one. See Example below:


Examples
--------
Model inheritance:

### /model/_Shape.json
```json
{
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
    "required": ["x", "y", "radius"]
}
```

In this example the Circle inherits all attributes of _Shape, especially the fields x and y.
The Circle overwrites attributes like "title" and "abstract" and introduces a new field "radius"