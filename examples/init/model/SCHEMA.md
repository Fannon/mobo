# MODEL JSON Schema
> Read this file online at GitHub: [model/README.md](https://github.com/Fannon/mobo/blob/master/examples/init/model/SCHEMA.md)

This file documents all available attributes mobo will use and validate for your models.

## model specific properties
These properties will only work in context of models.
<table class="schema-description">
   <thead>
       <tr>
           <th><sub>ID</sub></th>
           <th><sub>Type</sub></th>
           <th><sub>Default</sub></th>
           <th><sub>Description</sub></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><sub>recommended</sub></td>
           <td><sub></sub></td>
           <td><sub></sub></td>
           <td><sub>Array of fields that should be highlighted as recommended (complementary to mandatory)</sub></td>
       </tr>
       <tr>
           <td><sub>smw_subobject</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances.</sub></td>
       </tr>
       <tr>
           <td><sub>smw_display</sub></td>
           <td><sub>string</sub></td>
           <td><sub>table</sub></td>
           <td><sub>Defines the template output rendering mode, whether the template should use tables, ul, etc.</sub></td>
       </tr>
       <tr>
           <td><sub>smw_prefix</sub></td>
           <td><sub>object</sub></td>
           <td><sub></sub></td>
           <td><sub><table class="schema-description">
   <thead>
       <tr>
           <th><sub>ID</sub></th>
           <th><sub>Type</sub></th>
           <th><sub>Default</sub></th>
           <th><sub>Description</sub></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><sub>wikitext</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>wikitext to prefix</sub></td>
       </tr>
       <tr>
           <td><sub>header</sub></td>
           <td><sub>number</sub></td>
           <td><sub></sub></td>
           <td><sub>Inserts auto generated header of given hierachy (1-6)</sub></td>
       </tr>
       <tr>
           <td><sub>template</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>name of a template to inject. Must exist</sub></td>
       </tr>
       <tr>
           <td><sub>showForm</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Display prefix in form-view</sub></td>
       </tr>
       <tr>
           <td><sub>showPage</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Display prefix in page-view</sub></td>
       </tr>
   </tbody>
</table>
</sub></td>
       </tr>
       <tr>
           <td><sub>smw_postfix</sub></td>
           <td><sub>object</sub></td>
           <td><sub></sub></td>
           <td><sub><table class="schema-description">
   <thead>
       <tr>
           <th><sub>ID</sub></th>
           <th><sub>Type</sub></th>
           <th><sub>Default</sub></th>
           <th><sub>Description</sub></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><sub>wikitext</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>wikitext to postfix</sub></td>
       </tr>
       <tr>
           <td><sub>template</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>name of a template to inject. Must exist</sub></td>
       </tr>
       <tr>
           <td><sub>showForm</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Display postfix in form-view</sub></td>
       </tr>
       <tr>
           <td><sub>showPage</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>Display postfix in page-view</sub></td>
       </tr>
   </tbody>
</table>
</sub></td>
       </tr>
       <tr>
           <td><sub>smw_category</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>This property decides whether the template should tag the page as a category of the model-name.</sub></td>
       </tr>
       <tr>
           <td><sub>smw_categories</sub></td>
           <td><sub></sub></td>
           <td><sub></sub></td>
           <td><sub>Array of additional categories the template should set.</sub></td>
       </tr>
       <tr>
           <td><sub>showForm</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view.</sub></td>
       </tr>
       <tr>
           <td><sub>showPage</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view.</sub></td>
       </tr>
   </tbody>
</table>

## mobo specific properties
These mobo custom properties are global and can be used for fields, models and forms. 
<table class="schema-description">
   <thead>
       <tr>
           <th><sub>ID</sub></th>
           <th><sub>Type</sub></th>
           <th><sub>Default</sub></th>
           <th><sub>Description</sub></th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td><sub>properties</sub></td>
           <td><sub>object,array</sub></td>
           <td><sub></sub></td>
           <td><sub>Mobo supports to (optionally) use the array notation instead of the object notation for the property attribute.</sub></td>
       </tr>
       <tr>
           <td><sub>id</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Usually auto generated id, consisting of the filename</sub></td>
       </tr>
       <tr>
           <td><sub>title</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Human readable title of the field</sub></td>
       </tr>
       <tr>
           <td><sub>description</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Description of the field. Can be displayed as tooltip info</sub></td>
       </tr>
       <tr>
           <td><sub>$extend</sub></td>
           <td><sub>string,array</sub></td>
           <td><sub></sub></td>
           <td><sub>This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten.</sub></td>
       </tr>
       <tr>
           <td><sub>$reference</sub></td>
           <td><sub>object</sub></td>
           <td><sub></sub></td>
           <td><sub>For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)</sub></td>
       </tr>
       <tr>
           <td><sub>$filepath</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>For internal use only! This stores the relative path of the .json file. Used for improved debugging messages</sub></td>
       </tr>
       <tr>
           <td><sub>ignore</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true this file will be ignored.</sub></td>
       </tr>
       <tr>
           <td><sub>abstract</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true this object is only used for inheritance and will not be created itself.</sub></td>
       </tr>
       <tr>
           <td><sub>format</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend</sub></td>
       </tr>
       <tr>
           <td><sub>propertyOrder</sub></td>
           <td><sub>array</sub></td>
           <td><sub></sub></td>
           <td><sub>Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order.</sub></td>
       </tr>
       <tr>
           <td><sub>todo</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>If todo notes are placed here, mobo can output them (this is a setting)</sub></td>
       </tr>
       <tr>
           <td><sub>note</sub></td>
           <td><sub>string,object</sub></td>
           <td><sub></sub></td>
           <td><sub>Notes can be strings or objects and their content will be ignored</sub></td>
       </tr>
   </tbody>
</table>

## Unsupported JSON Schema Core features
These features / properties of JSON Schema Core are not supported by mobo: 

## Complete JSON Schema
This is the final JSON Schema, including a simplified JSON Schema core and all mobo and model specific addons / changes. 
```json
{
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "mobo form JSON Schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": {
                "$ref": "#"
            }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [
                {
                    "$ref": "#/definitions/positiveInteger"
                },
                {
                    "default": 0
                }
            ]
        },
        "simpleTypes": {
            "enum": [
                "array",
                "boolean",
                "integer",
                "null",
                "number",
                "object",
                "string"
            ]
        },
        "stringArray": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri",
            "description": "Usually auto generated id, consisting of the filename"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string",
            "description": "Human readable title of the field"
        },
        "description": {
            "type": "string",
            "description": "Description of the field. Can be displayed as tooltip info"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": {
            "$ref": "#/definitions/positiveInteger"
        },
        "minLength": {
            "$ref": "#/definitions/positiveIntegerDefault0"
        },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                {
                    "type": "boolean"
                },
                {
                    "$ref": "#"
                }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                {
                    "$ref": "#"
                },
                {
                    "$ref": "#/definitions/schemaArray"
                }
            ],
            "default": {}
        },
        "maxItems": {
            "$ref": "#/definitions/positiveInteger"
        },
        "minItems": {
            "$ref": "#/definitions/positiveIntegerDefault0"
        },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": {
            "$ref": "#/definitions/positiveInteger"
        },
        "minProperties": {
            "$ref": "#/definitions/positiveIntegerDefault0"
        },
        "required": {
            "$ref": "#/definitions/stringArray"
        },
        "additionalProperties": false,
        "definitions": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#"
            },
            "default": {}
        },
        "properties": {
            "type": [
                "object",
                "array",
                "j",
                "e",
                "c",
                "t"
            ],
            "additionalProperties": {
                "$ref": "#"
            },
            "default": {},
            "description": "Mobo supports to (optionally) use the array notation instead of the object notation for the property attribute."
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": {
                "$ref": "#"
            },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    {
                        "$ref": "#"
                    },
                    {
                        "$ref": "#/definitions/stringArray"
                    }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                {
                    "$ref": "#/definitions/simpleTypes"
                },
                {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/simpleTypes"
                    },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": {
            "$ref": "#/definitions/schemaArray"
        },
        "anyOf": {
            "$ref": "#/definitions/schemaArray"
        },
        "oneOf": {
            "$ref": "#/definitions/schemaArray"
        },
        "not": {
            "$ref": "#"
        },
        "$extend": {
            "type": [
                "string",
                "array"
            ],
            "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten."
        },
        "$reference": {
            "type": "object",
            "description": "For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)"
        },
        "$filepath": {
            "type": "string",
            "description": "For internal use only! This stores the relative path of the .json file. Used for improved debugging messages"
        },
        "ignore": {
            "type": "boolean",
            "default": false,
            "description": "If true this file will be ignored."
        },
        "abstract": {
            "type": "boolean",
            "default": false,
            "description": "If true this object is only used for inheritance and will not be created itself."
        },
        "format": {
            "type": "string",
            "description": "Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend"
        },
        "propertyOrder": {
            "$ref": "#/definitions/schemaArray",
            "type": "array",
            "description": "Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order."
        },
        "todo": {
            "type": "string",
            "description": "If todo notes are placed here, mobo can output them (this is a setting)"
        },
        "note": {
            "description": "Notes can be strings or objects and their content will be ignored",
            "type": [
                "string",
                "object"
            ]
        },
        "smw_property": {
            "type": "boolean",
            "default": true,
            "description": "Declares if this field should be saved as a SMW property, through #set or #subobject"
        },
        "smw_form": {
            "type": "object",
            "description": "Object, containing SemanticForms option, that will be redirected to the form",
            "additionalProperties": true
        },
        "recommended": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array of fields that should be highlighted as recommended (complementary to mandatory)"
        },
        "smw_subobject": {
            "type": "boolean",
            "default": false,
            "description": "If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances."
        },
        "smw_display": {
            "type": "string",
            "enum": [
                "table",
                "ul"
            ],
            "default": "table",
            "description": "Defines the template output rendering mode, whether the template should use tables, ul, etc."
        },
        "smw_prefix": {
            "type": "object",
            "description": "Adds a prefix wikitext to forms and models. Can auto-generate headers.",
            "properties": {
                "wikitext": {
                    "type": "string",
                    "description": "wikitext to prefix"
                },
                "header": {
                    "type": "number",
                    "description": "Inserts auto generated header of given hierachy (1-6)",
                    "minimum": 1,
                    "maximum": 6
                },
                "template": {
                    "type": "string",
                    "description": "name of a template to inject. Must exist"
                },
                "showForm": {
                    "type": "boolean",
                    "description": "Display prefix in form-view",
                    "default": true
                },
                "showPage": {
                    "type": "boolean",
                    "description": "Display prefix in page-view",
                    "default": true
                }
            },
            "additionalProperties": false
        },
        "smw_postfix": {
            "type": "object",
            "description": "Adds a postfix wikitext to forms and models",
            "properties": {
                "wikitext": {
                    "type": "string",
                    "description": "wikitext to postfix"
                },
                "template": {
                    "type": "string",
                    "description": "name of a template to inject. Must exist"
                },
                "showForm": {
                    "type": "boolean",
                    "description": "Display postfix in form-view",
                    "default": true
                },
                "showPage": {
                    "type": "boolean",
                    "description": "Display postfix in page-view",
                    "default": true
                }
            },
            "additionalProperties": false
        },
        "smw_category": {
            "type": "boolean",
            "default": true,
            "description": "This property decides whether the template should tag the page as a category of the model-name."
        },
        "smw_categories": {
            "$ref": "#/definitions/schemaArray",
            "description": "Array of additional categories the template should set."
        },
        "showForm": {
            "type": "boolean",
            "default": true,
            "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view."
        },
        "showPage": {
            "type": "boolean",
            "default": true,
            "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view."
        },
        "smw_forminput": {
            "type": "object",
            "description": "Object, containing SemanticForms #forminput options",
            "additionalProperties": true
        },
        "smw_forminfo": {
            "type": "object",
            "description": "Object (Set), containing all SemanticForms {{{info}}} parameters."
        },
        "smw_naming": {
            "type": "string",
            "description": "Provides naming conventions / guideline. Will appear on the form page itself."
        },
        "smw_freetext": {
            "type": "boolean",
            "default": true,
            "description": "Decides whether the freetext textarea will be displayed below the form."
        },
        "smw_summary": {
            "type": "boolean",
            "default": false,
            "description": "Decides whether a summary field will be displayed at the bottom of the form."
        }
    },
    "default": {},
    "additionalProperties": false,
    "title": "mobo fields"
}
```
