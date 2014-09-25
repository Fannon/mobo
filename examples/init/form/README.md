Forms
=====
Put your form JSON files here.

Examples
--------

### /form/
```json
{
    "title": "Circle",
    "type": "object",

    "properties": {
        "CircleHeader": { "wikitext": "=Circle=" },
        "Circle": { "$extend": "/model/Circle.json" },

        "qualityHeader": { "wikitext": "=Quality=" },
        "quality": { "$extend": "/model/quality.json" }
    }
}
```