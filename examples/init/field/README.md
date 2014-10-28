Fields
======
A field is the lowest, most fundamental part of your model.
Fields are the mobo equivalent to SMW attributes, but contain additional information like how they are rendered in Forms.
If a field refers to multiple items, it has to use an array structure first (see Examples).

Additional properties
---------------------
* `"ignore"`: [Boolean]  If true this file will be ignored by mobo.
* `"abstract"`: [Boolean]  If true this file will be used for inheritance but not uploaded to the actual model.
* `"todo"`: [String] Adds a todo note
* `"smw_form"`: [Object] Contains [Semantic Forms field options](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27field.27_tag).

Supported Datatypes
-------------------
### Primitive Datatypes
* number / integer
* boolean
* string / text

To define a primitive datatype, just declare the "type" attribute:
 ```json
 "type": "number",
 ```



### "Semantic" Datatypes
Semantic Datatypes are defined through the "format" attribute. Usually the primitive "type" datatype is "string"

 ```json
 "type": "string",
 "format": "date"
 ```

#### Pages
If the "format" attribute defines an "URL" to a form, it has the data type "Page" and will link to sites created by this form.
If that site does not exist yet, it will be created through that form if clicked on.

#### JSON-Schema Datatypes
* date / date-time
* url
* email
* tel

#### SMW only Datatypes
* Code
* Geographic coordinate
* Quantity
* Record
* Temperature

Examples
--------
### Simple (number) field
```json
{
    "title": "radius",
    "description": "The radius of a shape",

    "type": "number",

    "smw_form": {
        "input type": "text"
    }
}
```

### Multiple Links to a Model (Defaults to Token Widget)
```json
{
    "title": "Anwendungen",
    "description": "",

    "type": "array",
    "items": {
        "type": "string",
        "format": "/form/Anwendung.json"
    }
}
```

### Enum (Defaults to Dropdown Widget)
```json
{
    "title": "color",
    "type": "string",
    "enum": [
        "red",
        "green",
        "blue"
    ]
}
```