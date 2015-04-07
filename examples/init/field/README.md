# Fields
> Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/init/field/README.md).

> Refer to the corresponding [SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/field/SCHEMA.md) for a technical description of all possible properties.

## Description
Fields are the mobo equivalent to SMW attributes. 

The biggest difference to SMW attributes is that mobo fields already declare how they will be rendered and validated. Those information will be inherited through the models up to the final form. 

Fields usually declare:

* The id (machine name) through the filename.
* A human readable title
* An optional description.
* The datatype, consisting of type and format (see JSON Schema Spec).
* Additional validation (some datatypes already come with validation).
* The format can link to other forms, in this case the datatype is page.
* Semantic Forms options that define how SF will render the final field.


## Supported Datatypes

### Primitive Datatypes (type)
* number / integer
* boolean
* string / text

To define a primitive datatype, just declare the "type" attribute:

```json
{
    "type": "number"
}
```

### "Semantic" Datatypes (format)
Semantic Datatypes are defined through the "format" attribute. Usually the primitive "type" datatype is "string". 

* JSON Schema Datatypes
    * date / date-time
    * url
    * email
    * tel
* SMW only Datatypes
    * Code
    * Geographic coordinate
    * Quantity
    * Record
    * Temperature
* Pages
    * page
    * /form/*

To define a semantic datatype, declare the "format" in addition to the "type":

```json
{
    "type": "string",
    "format": "date"
}
```

The format attribute can be used to reference to a form. This can be done by using the same url notation as for the `$extend` attribute. 
If the url links to a page that does not exist yet, it will be created through the defined form.

```json
{
    "type": "string",
    "format": "/form/Location"
}
```

## Enums
If an additional "enum" array is specified, it can pre-prvide default values. This makes mostly sense for dropdown menus. Note that enums are not dynamic and the model has to be adjusted if entries have to be changed.

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

## Field specific features
### smw_form
The `smw_form` attribute is an object that redirects all settings directly to Semantic Forms. To see which options are supported, refer to the [Semantic Forms manual](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27field.27_tag)

```json
{
    "smw_form": {
        "input type": "combobox",
        "values from namespace": "Manufacturer",
        "max values": 1,
        "existing values only": true
    }
}
```

### smw_property
If `smw_property` is set to false the templates won't use #set or #subobject to declare it as a semantic attribute. Please note that the field can't be queried then.

```json
{
    "smw_property": false
}
```

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
    "title": "Locations",
    "description": "",

    "type": "array",
    "items": {
        "type": "string",
        "format": "/form/Location"
    }
}
```
