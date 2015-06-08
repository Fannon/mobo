# field - technical description
> Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/init/field/SCHEMA.md)

> Refer to the corresponding [README.md](https://github.com/Fannon/mobo/blob/master/examples/init/field/README.md) for a more verbose documentation.

This file documents all available attributes mobo will use and validate for your fields.

## field specific properties
These properties will only work in context of fields.
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
           <td><sub>smw_property</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>true</sub></td>
           <td><sub>If set to false, the property will not be saved as a SMW property, through #set or #subobject</sub></td>
       </tr>
       <tr>
           <td><sub>smw_form</sub></td>
           <td><sub>object</sub></td>
           <td><sub></sub></td>
           <td><sub>Object, containing SemanticForms option, that will be redirected to the form</sub></td>
       </tr>
       <tr>
           <td><sub>smw_hideInPage</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true the field will not be visibly renderd in the page view</sub></td>
       </tr>
       <tr>
           <td><sub>smw_hideInForm</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true, the field will not be visible in the form edit view</sub></td>
       </tr>
       <tr>
           <td><sub>smw_overwriteOutput</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Overwrites the final value of the field, used for both display and data set</sub></td>
       </tr>
       <tr>
           <td><sub>smw_overwriteOutputToLink</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub></sub></td>
           <td><sub>If true, this will create a link in display mode, but the data will not receive the appended [[]]</sub></td>
       </tr>
       <tr>
           <td><sub>smw_overwriteDisplay</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Overwrites only the display value of the current field</sub></td>
       </tr>
       <tr>
           <td><sub>smw_overwriteData</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Overwrites the final #set or #subobject value of the field. This will also overwrite smw_overwriteOutput.</sub></td>
       </tr>
       <tr>
           <td><sub>smw_forceSet</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Forces the semantic storage of the attribute through the #set parser function. This is useful for #subobject models that want to expose one or more fields as regular #set properties.</sub></td>
       </tr>
       <tr>
           <td><sub>smw_arraymaptemplate</sub></td>
           <td><sub>string</sub></td>
           <td><sub>false</sub></td>
           <td><sub>Name of the arraymap template (https://www.mediawiki.org/wiki/Extension:Semantic_Forms/Semantic_Forms_and_templates#arraymaptemplate) to use. Field needs to be of type "array".</sub></td>
       </tr>
       <tr>
           <td><sub>smw_drilldown</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If the global settings "smw_semanticDrilldown" is enabled, fields with smw_drilldown set to true will be filterable. </sub></td>
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
           <td><sub>format</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend</sub></td>
       </tr>
       <tr>
           <td><sub>$extend</sub></td>
           <td><sub>string,array</sub></td>
           <td><sub></sub></td>
           <td><sub>This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten.</sub></td>
       </tr>
       <tr>
           <td><sub>$remove</sub></td>
           <td><sub>array</sub></td>
           <td><sub></sub></td>
           <td><sub>Array, containing all properties to remove from the current object</sub></td>
       </tr>
       <tr>
           <td><sub>$reference</sub></td>
           <td><sub>object</sub></td>
           <td><sub></sub></td>
           <td><sub>For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)</sub></td>
       </tr>
       <tr>
           <td><sub>$path</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>For internal use only! This stores the path of the object, as used in "$extend" or "format". Used for improved debugging messages</sub></td>
       </tr>
       <tr>
           <td><sub>$filepath</sub></td>
           <td><sub>string</sub></td>
           <td><sub></sub></td>
           <td><sub>For internal use only! This stores the complete relative path of the .json file. Used for improved debugging messages</sub></td>
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
           <td><sub>deprecated</sub></td>
           <td><sub>boolean</sub></td>
           <td><sub>false</sub></td>
           <td><sub>If true, the field will be deprecated. This means it will not be displayed in forms, but the template will keep it in order to display old entries.</sub></td>
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
This is the final JSON Schema, including a simplified JSON Schema core and all mobo and field specific addons / changes. 

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
        "format": {
            "type": "string",
            "description": "Contains the JSON format. This can alternatively be a reference to a mobo file, like $extend"
        },
        "$extend": {
            "type": [
                "string",
                "array"
            ],
            "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten."
        },
        "$remove": {
            "type": "array",
            "description": "Array, containing all properties to remove from the current object"
        },
        "$reference": {
            "type": "object",
            "description": "For internal use only! After inheritance is applied, $extend will be replaced through reference. (For keeping info on the heritage)"
        },
        "$path": {
            "type": "string",
            "description": "For internal use only! This stores the path of the object, as used in \"$extend\" or \"format\". Used for improved debugging messages"
        },
        "$filepath": {
            "type": "string",
            "description": "For internal use only! This stores the complete relative path of the .json file. Used for improved debugging messages"
        },
        "ignore": {
            "type": "boolean",
            "description": "If true this file will be ignored.",
            "default": false
        },
        "abstract": {
            "type": "boolean",
            "default": false,
            "description": "If true this object is only used for inheritance and will not be created itself."
        },
        "deprecated": {
            "type": "boolean",
            "description": "If true, the field will be deprecated. This means it will not be displayed in forms, but the template will keep it in order to display old entries.",
            "default": false
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
            "description": "If set to false, the property will not be saved as a SMW property, through #set or #subobject"
        },
        "smw_form": {
            "type": "object",
            "description": "Object, containing SemanticForms option, that will be redirected to the form",
            "additionalProperties": true
        },
        "smw_hideInPage": {
            "type": "boolean",
            "description": "If true the field will not be visibly renderd in the page view",
            "default": false
        },
        "smw_hideInForm": {
            "type": "boolean",
            "description": "If true, the field will not be visible in the form edit view",
            "default": false
        },
        "smw_overwriteOutput": {
            "type": "string",
            "description": "Overwrites the final value of the field, used for both display and data set"
        },
        "smw_overwriteOutputToLink": {
            "type": "boolean",
            "description": "If true, this will create a link in display mode, but the data will not receive the appended [[]]"
        },
        "smw_overwriteDisplay": {
            "type": "string",
            "description": "Overwrites only the display value of the current field"
        },
        "smw_overwriteData": {
            "type": "string",
            "description": "Overwrites the final #set or #subobject value of the field. This will also overwrite smw_overwriteOutput."
        },
        "smw_forceSet": {
            "type": "boolean",
            "description": "Forces the semantic storage of the attribute through the #set parser function. This is useful for #subobject models that want to expose one or more fields as regular #set properties.",
            "default": false
        },
        "smw_arraymaptemplate": {
            "type": "string",
            "description": "Name of the arraymap template (https://www.mediawiki.org/wiki/Extension:Semantic_Forms/Semantic_Forms_and_templates#arraymaptemplate) to use. Field needs to be of type \"array\".",
            "default": false
        },
        "smw_drilldown": {
            "type": "boolean",
            "description": "If the global settings \"smw_semanticDrilldown\" is enabled, fields with smw_drilldown set to true will be filterable. ",
            "default": false
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
        "smw_subobjectExtend": {
            "type": "object",
            "description": "Contains a set (object) of additional #subobject properties"
        },
        "smw_display": {
            "type": "string",
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
        "smw_categoryPrefix": {
            "type": "string",
            "description": "wikitext to prefix on the category page"
        },
        "smw_categoryPostfix": {
            "type": "string",
            "description": "wikitext to postfix on the category page"
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