# Models
> Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/init/model/README.md).

> Refer to the corresponding [SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/model/SCHEMA.md) for a technical description of all possible properties.

## Description
Models will create Templates and Categories. They define the actual structure of the development model. 

They usually declare:

* Which models they inherit from
* Which fields are used
* The order of the fields
* Mandatory and recommended fields
* The template “rendering” mode (table, unordered lists, …)
* If they are stored as regular semantic properties or a subobject
* MediaWiki Categories
* Prefix and Postfix wikitext

## Model specific features
### smw_category
The `smw_category` is a boolean that decides whether a model should be automatically assigned a category with the same id as name. Defaults to true.

```json
{
    "smw_category": false
}
```

### smw_categories
With the `swm_categories` attribute an array of additional categories can be set.

```json
{
    "smw_categories": ["Person", "Employee"]
}
```

### smw_prefix / smw_postfix
The `smw_prefix` and `smw_postfix` attributes allow to inject wikitext before and after the actual rendered wikitext. It will be displayed by default in both template and form.

The `"header"` attribute takes a number and will automatically generate a header of the given hierachy with the title of the model as text.

```json 
{
    "smw_prefix": {
        "header": 1,
        "wikitext": "Some prefix-description for the location"
    },

    "smw_postfix": {
        "template": "SomeFooter",
        "showForm": false,
        "showPage": true
    }
}
```

### required / recommended
The `required` and `recommended` attributes are arrays that consist of the field IDs that should be required or recommended.

Please not that recommended fields are not officially supported by Semantic Forms and require the `sfDivLayout` setting to be enabled and some custom CSS styling, like the [VectorUp skin extension](http://www.mediawiki.org/wiki/Extension:VectorUp).


```json 
{
    "properties": [
        { "$extend": "/field/streetAdress.json" },
        { "$extend": "/field/streetNumber.json" },
        { "$extend": "/field/town.json" },
        { "$extend": "/field/country.json" }
    ],

    "required": ["streetAdress", "streetNumber", "town" ],
    "recommended": ["country"]
}
```

### smw_subobject
If `smw_subobject` is set to true, mobo will use the #subobject function instead of the #set function. 

Mobo will automantically introduce two additional helper attributes `subobject` and `superobject` that help with querying subobjects.

```json 
{
    "smw_subobject": true
}
```

### smw_display
This allows to define the style the template is rendered with. It must be supported by the `/mobo_template/template.wikitext` template.

```json 
{
    "smw_display": "ul"
}
```


## Examples
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

In this example the Circle inherits all attributes of _Shape, especially the fields x and y. The Circle overwrites attributes like "title" and "abstract" and introduces a new field "radius"