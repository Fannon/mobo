Fields
======
A field is the lowest, most fundamental part of your model. 
Fields are the mobo equivalent to SMW attributes, but contain additional information like how they are rendered in Forms.

Additional properties
---------------------
* `"ignore"`: [Boolean]  If true this file will be ignored by mobo.
* `"abstract"`: [Boolean]  If true this file will be used for inheritance but not uploaded to the actual model.
* `"smw_form"`: [Object] Contains [Semantic Forms field options](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27field.27_tag). 

Examples
--------
### /field/radius.json
```json
{
    "title": "radius",
    "description": "The radius of a shape",

    "type": "number",
    "minimum": 0,

    "smw_form": {
        "input type": "text with autocomplete"
    }
}
```