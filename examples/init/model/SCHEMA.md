# MODEL JSON SCHEMA

This file documents all properties mobo will use and validate for your models.

They are described in the JSON Schema format. 
For descriptions and default, look for the corresponding properties. 

## model specific properties
These properties will only work in context of models.
<h3></h3>
<div class="description">mobo model JSON Schema</div>
<table class="schema-description">
   <thead>
       <tr>
           <th>ID</th>
           <th>Type</th>
           <th>Default</th>
           <th>Description</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td>recommended</td>
           <td></td>
           <td></td>
           <td>Array of fields that should be highlighted as recommended (complementary to mandatory)</td>
       </tr>
       <tr>
           <td>smw_subobject</td>
           <td>boolean</td>
           <td>false</td>
           <td>If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances.</td>
       </tr>
       <tr>
           <td>smw_display</td>
           <td>string</td>
           <td>table</td>
           <td>Defines the template output rendering mode, whether the template should use tables, ul, etc.</td>
       </tr>
       <tr>
           <td>smw_prefix</td>
           <td>object</td>
           <td></td>
           <td><h3></h3>
<div class="description">Adds a prefix wikitext to forms and models. Can auto-generate headers.</div>
<table class="schema-description">
   <thead>
       <tr>
           <th>ID</th>
           <th>Type</th>
           <th>Default</th>
           <th>Description</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td>wikitext</td>
           <td>string</td>
           <td></td>
           <td>wikitext to prefix</td>
       </tr>
       <tr>
           <td>header</td>
           <td>number</td>
           <td></td>
           <td>Inserts auto generated header of given hierachy (1-6)</td>
       </tr>
       <tr>
           <td>template</td>
           <td>string</td>
           <td></td>
           <td>name of a template to inject. Must exist</td>
       </tr>
       <tr>
           <td>showForm</td>
           <td>boolean</td>
           <td>true</td>
           <td>Display prefix in form-view</td>
       </tr>
       <tr>
           <td>showPage</td>
           <td>boolean</td>
           <td>true</td>
           <td>Display prefix in page-view</td>
       </tr>
   </tbody>
   </table>
</td>
       </tr>
       <tr>
           <td>smw_postfix</td>
           <td>object</td>
           <td></td>
           <td><h3></h3>
<div class="description">Adds a postfix wikitext to forms and models</div>
<table class="schema-description">
   <thead>
       <tr>
           <th>ID</th>
           <th>Type</th>
           <th>Default</th>
           <th>Description</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td>wikitext</td>
           <td>string</td>
           <td></td>
           <td>wikitext to postfix</td>
       </tr>
       <tr>
           <td>template</td>
           <td>string</td>
           <td></td>
           <td>name of a template to inject. Must exist</td>
       </tr>
       <tr>
           <td>showForm</td>
           <td>boolean</td>
           <td>true</td>
           <td>Display postfix in form-view</td>
       </tr>
       <tr>
           <td>showPage</td>
           <td>boolean</td>
           <td>true</td>
           <td>Display postfix in page-view</td>
       </tr>
   </tbody>
   </table>
</td>
       </tr>
       <tr>
           <td>smw_category</td>
           <td>boolean</td>
           <td>true</td>
           <td>This property decides whether the template should tag the page as a category of the model-name.</td>
       </tr>
       <tr>
           <td>smw_categories</td>
           <td></td>
           <td></td>
           <td>Array of additional categories the template should set.</td>
       </tr>
       <tr>
           <td>showForm</td>
           <td>boolean</td>
           <td>true</td>
           <td>This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view.</td>
       </tr>
       <tr>
           <td>showPage</td>
           <td>boolean</td>
           <td>true</td>
           <td>This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view.</td>
       </tr>
       <tr>
           <td>additionalProperties</td>
           <td></td>
           <td></td>
           <td></td>
       </tr>
   </tbody>
   </table>

## mobo specific properties
These mobo custom properties are global and can be used for fields, models and forms. 
<h3></h3>
<table class="schema-description">
   <thead>
       <tr>
           <th>ID</th>
           <th>Type</th>
           <th>Default</th>
           <th>Description</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td>properties</td>
           <td>object,array</td>
           <td></td>
           <td></td>
       </tr>
       <tr>
           <td>$schema</td>
           <td></td>
           <td></td>
           <td>Optional JSON Schema $schema URL. Does not need not be included.</td>
       </tr>
       <tr>
           <td>id</td>
           <td>string</td>
           <td></td>
           <td>Usually auto generated id, consisting of the filename</td>
       </tr>
       <tr>
           <td>title</td>
           <td>string</td>
           <td></td>
           <td>Human readable title of the field</td>
       </tr>
       <tr>
           <td>description</td>
           <td>string</td>
           <td></td>
           <td>Description of the field. Can be displayed as tooltip info</td>
       </tr>
       <tr>
           <td>$extend</td>
           <td>string</td>
           <td></td>
           <td>This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten.</td>
       </tr>
       <tr>
           <td>$reference</td>
           <td>object</td>
           <td></td>
           <td>For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)</td>
       </tr>
       <tr>
           <td>$filepath</td>
           <td>string</td>
           <td></td>
           <td>For Internal use only! This stores the relative path of the .json file. Used for improved debugging messages</td>
       </tr>
       <tr>
           <td>ignore</td>
           <td>boolean</td>
           <td>false</td>
           <td>If true this file will be ignored.</td>
       </tr>
       <tr>
           <td>abstract</td>
           <td>boolean</td>
           <td>false</td>
           <td>If true this object is only used for inheritance and will not be created itself.</td>
       </tr>
       <tr>
           <td>format</td>
           <td>string</td>
           <td></td>
           <td>Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend</td>
       </tr>
       <tr>
           <td>propertyOrder</td>
           <td>array</td>
           <td></td>
           <td>Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order.</td>
       </tr>
       <tr>
           <td>todo</td>
           <td>string</td>
           <td></td>
           <td>If todo notes are placed here, mobo can output them (this is a setting)</td>
       </tr>
       <tr>
           <td>note</td>
           <td>string,object</td>
           <td></td>
           <td>Notes can be strings or objects and their content will be ignored</td>
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
            "format": "uri",
            "description": "Optional JSON Schema $schema URL. Does not need not be included."
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
            "default": {}
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
            "type": "string",
            "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten."
        },
        "$reference": {
            "type": "object",
            "description": "For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)"
        },
        "$filepath": {
            "type": "string",
            "description": "For Internal use only! This stores the relative path of the .json file. Used for improved debugging messages"
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
    "required": [
        "type"
    ],
    "additionalProperties": false,
    "title": "mobo fields"
}
```
