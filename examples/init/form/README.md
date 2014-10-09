Forms
=====
Forms define which models and templates to aggregate into a Semantic Form. 
Models can be either implemented as a single instance or multiple instance. If a multiple instance template is needed, it has to be wrapped in an array. (See example)

Additional properties
---------------------
* `"ignore"`: [Boolean]  If true this file will be ignored by mobo.
* `"$extend"`: [String] Models can extend from another model (inherit from it). Model properties (fields) have to be inherited through $extend too. 


Examples
--------

### /form/
```json
{
    "title": "Circle",
    "description": "Circle Form",
    "type": "object",

    "properties": {

        "circleHeader": { "wikitext": "=Circles=" },
        "circle": {
            "type": "array",
            "items": {
                "$extend": "/model/Circle.json"
            }
        },

        "qualityHeader": { "wikitext": "=Quality=" },
        "quality": { "$extend": "/model/Quality.json" }
    }
}
```