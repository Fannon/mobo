## mobo model development HOWTO
* Read this file online at GitHub: [MANUAL.md](https://github.com/Fannon/mobo/blob/master/examples/init/MANUAL.md)

### Premises
In order to learn mobo, it is mandatory to understand the basic concepts of JSON Schema  first. It is a very simple and concise standard and it should only take a few hours to learn it. There is a great tutorial  published by the Space Telescope Science Institute. This time is a good investment anyhow, since JSON Schema can be used in other contexts as well.

Basic understanding of MW / SMW and SF is also highly recommended, since this is the target system and its architecture has a huge impact on how models are developed.

If the default templates are changed, an understanding of the Handlebars.js  template engine is of advantage.

### Create a new project
To start with the model development, an empty project structure has to be created first. This is done through a mobo command within an empty direc-tory.

```sh
$ mkdir newProject  # Create new dir
$ cd newProject     # Enter new dir
$ mobo --init       # Create bootstrap project
```

Mobo comes with two example projects, which may be a good starting point to learn mobo. They can be copied to the current project directory with the `--example` flag:

```sh
$ mobo --example shapes
```

### The Development Model Structure
#### Overview
The default bootstrap project structure is now created. Please note that it contains many markdown files (.md) that provide more contextual documen-tation. README.md files will give more general information, while SCHEMA.md is an auto generated, more technical documentation of all available attributes.

Please note that subdirectories can be created freely, but they will be flat-tened on the reading step. This allows greater freedom in organizing the model. Moving files does not require to adjust paths in the model.

```sh
├── field
│   ├── README.md
│   └── SCHEMA.md
├── form
│   ├── README.md
│   └── SCHEMA.md
├── model
│   ├── README.md
│   └── SCHEMA.md
├── README.md
├── MANUAL.md
├── settings.json
├── settings.md
├── smw_page
│   └── README.md
├── smw_query
│   └── README.md
├── smw_template
│   └── README.md
└── mobo_template
    ├── category.wikitext
    ├── form.wikitext
    ├── property.wikitext
    ├── query-ask.wikitext
    ├── query-sparql.wikitext
    ├── README.md
    ├── report.wikitext
    └── template.wikitext
```

#### /settings.json
The settings.json file will hold all project specific options. It has already been explained in the Getting Started Section.

For more documentation of all available options and their defaults, please read the accompanying settings.md file.

```json
{
    "mw_server_url": "http://localhost",
    "mw_server_path": "/wiki",
    "mw_username": "username",
    "mw_password": "password",

    "watchFilesystem": true,
    "serveWebApp": true,
    "uploadWikiPages": true
}
```

#### /field/*
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

#### /model/*
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

#### /form/*
Forms will create Semantic Forms. They are much more lightweight than regular SF Forms, since most information have already been declared on the field or model level.

They usually declare:
* Which models to use
* If the model should be implemented as a single or multiple instance
* Which template to use / inject
* The order of the models and templates
* Visibility of templates in edit-view and reading-view

```json
{
    "title": "Circle",
    "description": "Circle Form",
    "type": "object",

    "properties": {
        "CircleHeader": {
            "$extend": "/smw_template/CircleHeader.wikitext",
            "showForm": true,
            "showSite": true
        },
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

#### /smw_page/*
In this directory .wikitext files can be stored. They will be uploaded to the wiki and overwrite any page that mobo have created before.

Please note that some characters can’t be used for filenames, so some string substitutions have to be made.

* `___` will be substituted with `:` (namespaces)
* `---` will be substituted with `/` (subpages)

#### /smw_template/*
This directory works similar like /smw_page/. MediaWiki Templates can be stored here without having to prepend `template___`. All templates in this directory will overwrite any template mobo has created before.

Please note that some characters can’t be used for filenames, so some string substitutions have to be made.

* `__` will be converted to a `:` (namespaces)
* `---` will be converted to a `/`(subpages)

#### /smw_query/*
ASK or SPARQL Queries can be stored in this directory. Mobo will automat-ically generate a template (including documentation) with which the query can be embedded. Queries are also tagged with categories.

#### /mobo_template/*
This directory contains Handlebars.js (http://handlebarsjs.com/) templates. They are used by mobo to generate the final wikitext pages. For more doc-umentation how they work, please refer to the Handlebars.js website.

The rendered output can be customized by editing those templates. They contain the rendered markup, some logic and strings that may want to be localized.

### Mobo Schema
#### Differences from JSON Schema
Mobo uses JSON Schema as a basis for the model development. To fit the model development better, some additions, changes and simplifications were made. The adjusted JSON Schema will be referred to as “mobo Schema”

#### Additions
##### $extend, abstract and ignore
The most important addition to JSON Schema is the “$extend” keyword. It takes a string (or an array of strings) which describe the path to another model file.

```json
"$extend": "/model/_Shape.json",
```

Mobo will inherit all properties of the referenced (parent) object to the ob-ject where this statement was made. Properties of the child object will over-write inherited properties. If an array of parent objects is given, the inher-itance order will be the order of the array.

`$extend` can be used with fields, models and forms. Circular dependencies are not allowed, however.

To define abstract objects that will only be used for inheritance, the property abstract can be used. To (temporarily) remove objects from the model the ignore attribute can be set to true. Both attributes won’t be inherited, so children of abstract or ignored objects don’t have to explicitly undo that setting.

JSON Schema has a somewhat similar attribute, called `$ref`. The official spec does not specify an inheritance behavior though. To avoid confusion, mobo supports only the custom $extend property.

##### propertyOrder
JSON Schema v4 does not natively support a declaration how properties are ordered. For model development this is an important feature, so mobo has added custom support.

The order is defined by an array of the IDs / keys of the properties:

```json
"propertyOrder": ["ip", "macAdress"],
```

#### SMW specific Additions
There are many SMW specific additions, to support the various settings and possibilities of SMW and Semantic Forms. Listing all those would be out of scope for this manual, so just one example will be given.

To see a complete, auto generated technical description of all available prop-erties, refer to `/field/SCHEMA.md`, `/model/SCHEMA.md` and `/form/SCHEMA.md` documentation on GitHub or the local project directory.

The smw_form attribute is an object which redirects all settings directly to Semantic Forms. To see which options are supported, refer to the Semantic Forms manual at http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27field.27_tag

```json
"smw_form": {
    "input type": "combobox",
    "values from namespace": "Manufacturer",
    "max values": 1,
    "existing values only": true
}
```

#### Changes
Mobo Schema is valid JSON Schema, with one optional exception.

Since every object in mobo is a file, the filename does already define the ID of the object. This makes defining the key names in the property attribute (which is an object) duplications. To keep the model DRY and avoid incon-sistencies here, it is possible to use the property attribute as an array.
This is the JSON Schema default property object notation:

```json
"properties": {
    "x": { "$extend": "/field/x.json" },
    "y": { "$extend": "/field/y.json" },
    "color": { "$extend": "/field/color.json" }
},
```

This is the mobo Schema alternative property array notation:

```json
"properties": [
    { "$extend": "/field/x.json" },
    { "$extend": "/field/y.json" },
    { "$extend": "/field/color.json" }
],
```

The array notation is a bit more concise and avoids to write the field names twice.

Internally mobo converts the array notation back to the object notation, to maintain JSON Schema compatibility. The processed development model (with inheritance applied) is therefore always JSON Schema compliant.
Removals

The following JSON Schema properties are not supported:

```javascript
[
    'properties.multipleOf',
    'properties.exclusiveMaximum',
    'properties.exclusiveMinimum',
    'properties.additionalItems',
    'properties.uniqueItems',
    'properties.additionalProperties',
    'properties.definitions',
    'properties.patternProperties',
    'properties.dependencies',
    'properties.not',
    'properties.allOf',
    'properties.anyOf',
    'dependencies',
    '$ref'
]
```

#### The mobo viewer application
Head to the mobo viewer application at your [localhost:8080](http://localhost:8080) to browse through the development model (with inheritance and further processing applied) on the left search box. 

![mobo-viewer-left](http://up.fannon.de/img/mobo-viewer-left.png?v=1)

The final resulting wikitext pages can be browsed through the right search box.

![mobo-viewer-right](http://up.fannon.de/img/mobo-viewer-right.png?v=1)

#### The mobo graph explorer
In order to use the mobo graph explorer a layouted version of the graph has to be generated. This can be done through [Gephi](https://gephi.github.io/):

Launch Gephi and open the file _graph.gexf in your projects `/_processed/` directory. Through the layout options, a force algorithm has to be applied (like Force Atlas). This usually involves some try and error with the parameters, since the correct values depend on the nature of the graph itself.Save the layouted graph as `/_processed/_graph_layouted.gexf`.

![mobo-gephi](http://up.fannon.de/img/mobo-gephi.png?v=1)

Now the graph explorer at [localhost:8080/graph.html](http://localhost:8080/graph.html) can be used:

![mobo-graph-explorer](http://up.fannon.de/img/mobo-graph-explorer.png?v=2)

The size of the nodes can be adjusted through `settings.json`.
