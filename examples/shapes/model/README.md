Models
======
Put your model JSON files here.

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
        "x": {
            "type": "integer"
        },
        "y": {
            "type": "integer"
        }
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