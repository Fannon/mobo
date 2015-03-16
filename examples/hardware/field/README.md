# Fields
* Read this file online at GitHub: [field/README.md](https://github.com/Fannon/mobo/blob/master/examples/init/field/README.md)
* See the corresponding [field/SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/field/SCHEMA.md) for a technical description of all possible properties.

## Description
Fields are the mobo equivalent to SMW attributes. 

The biggest difference to SMW attributes is that mobo fields already declare how they will be rendered and validated. Those information will be inherited through the models up to the final form. 

Fields usually declare:
* The machine name will be the filename.
* A tittle that is human readable.
* An optional description.
* The datatype, consisting of type and format (see JSON Schema Spec).
* Additional validation (some datatypes already come with validation).
* The format can link to other forms, in this case the datatype is ‘page’.
* Semantic Forms options that define how SF will render the final field.


## Supported Datatypes

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

## Examples
### Simple (number) field
```json
{
    "title": "radius",
    "description": "The radius of a shape",

    "type": "number",
    "minimum": 0,

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