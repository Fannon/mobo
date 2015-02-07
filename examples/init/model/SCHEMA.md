# MODEL JSON SCHEMA

This file documents all properties mobo will use and validate for your models.

They are described in the JSON Schema format. 
For descriptions and default, look for the corresponding properties. 

## model specific properties
These properties will only work in context of models.
```json
{
    "recommended": {
        "$ref": "#/definitions/schemaArray",
        "description": "Array of fields that should be highlighted as recommended (complementary to mandatory)"
    },
    "smw_subobject": {
        "type": "boolean",
        "default": false,
        "description": "If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances."
    },
    "smw_category": {
        "type": "boolean",
        "default": true,
        "description": "This property decides whether the template should tag the page as a category of the model-name."
    },
    "smw_categories": {
        "$ref": "#/definitions/schemaArray",
        "description": "Array of additional categories the template should set."
    }
}
```

## mobo specific properties
These mobo custom properties are global and can be used for fields, models and forms. 
```json
{
    "$schema": {
        "description": "Optional JSON Schema $schema URL. Does not need not be included."
    },
    "id": {
        "description": "Usually auto generated id, consisting of the filename"
    },
    "title": {
        "description": "Human readable title of the field"
    },
    "description": {
        "description": "Description of the field. Can be displayed as tooltip info"
    },
    "$extend": {
        "type": "string",
        "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten.",
        "properties": {
            "showForm": {
                "type": "boolean",
                "default": true,
                "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view."
            },
            "showSite": {
                "type": "boolean",
                "default": true,
                "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view."
            }
        }
    },
    "$reference": {
        "type": "string",
        "description": "For internal use only! After inheritance is applied, $extend will be replaced through $extend. (For keeping info on the heritage)"
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
        "description": "Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order."
    },
    "todo": {
        "type": "string",
        "description": "If todo notes are placed here, mobo can output them (this is a setting)"
    },
    "note": {
        "description": "Notes can be strings or objects and their content will be ignored",
        "anyOf": [
            {
                "type": "string"
            },
            {
                "type": "object"
            }
        ]
    }
}
```

## Unsupported JSON Schema Core features
These features / properties of JSON Schema Core are not supported by mobo: 
```json
[
    "properties.multipleOf",
    "properties.exclusiveMaximum",
    "properties.exclusiveMinimum",
    "properties.additionalItems",
    "properties.uniqueItems",
    "properties.additionalProperties",
    "properties.definitions",
    "properties.patternProperties",
    "properties.dependencies",
    "properties.not",
    "dependencies"
]
```

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
                "$ref": "http://json-schema.org/draft-04/schema#"
            }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [
                {
                    "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
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
        "maximum": {
            "type": "number"
        },
        "minimum": {
            "type": "number"
        },
        "maxLength": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
        },
        "minLength": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
        },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "items": {
            "anyOf": [
                {
                    "$ref": "http://json-schema.org/draft-04/schema#"
                },
                {
                    "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray"
                }
            ],
            "default": {}
        },
        "maxItems": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
        },
        "minItems": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
        },
        "maxProperties": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
        },
        "minProperties": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
        },
        "required": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/stringArray"
        },
        "properties": {
            "type": "object",
            "additionalProperties": {
                "$ref": "http://json-schema.org/draft-04/schema#"
            },
            "default": {}
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                {
                    "$ref": "http://json-schema.org/draft-04/schema#/definitions/simpleTypes"
                },
                {
                    "type": "array",
                    "items": {
                        "$ref": "http://json-schema.org/draft-04/schema#/definitions/simpleTypes"
                    },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray"
        },
        "anyOf": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray"
        },
        "oneOf": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray"
        },
        "$extend": {
            "type": "string",
            "description": "This references another mobo json file. It will be included through inheritance, all existing attributes in the parent object will be overwritten.",
            "properties": {
                "showForm": {
                    "type": "boolean",
                    "default": true,
                    "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the edit form view."
                },
                "showSite": {
                    "type": "boolean",
                    "default": true,
                    "description": "This applies to forms referencing templates only: If an template (.wikitext) is extended into the form, this property will decide if it is shown in the vie page view."
                }
            }
        },
        "$reference": {
            "type": "string",
            "description": "For internal use only! After inheritance is applied, $extend will be replaced through $extend. (For keeping info on the heritage)"
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
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray",
            "description": "Array that sets the display order of all (including inherited) properties. Unmentioned fields will be appended at the bottom in their original order."
        },
        "todo": {
            "type": "string",
            "description": "If todo notes are placed here, mobo can output them (this is a setting)"
        },
        "note": {
            "description": "Notes can be strings or objects and their content will be ignored",
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "object"
                }
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
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray",
            "description": "Array of fields that should be highlighted as recommended (complementary to mandatory)"
        },
        "smw_subobject": {
            "type": "boolean",
            "default": false,
            "description": "If true, this models attributes will be created as subobjects. Useful if this model is used through multiple instances."
        },
        "smw_category": {
            "type": "boolean",
            "default": true,
            "description": "This property decides whether the template should tag the page as a category of the model-name."
        },
        "smw_categories": {
            "$ref": "http://json-schema.org/draft-04/schema#/definitions/schemaArray",
            "description": "Array of additional categories the template should set."
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
        "id",
        "type"
    ],
    "additionalProperties": false
}
```
