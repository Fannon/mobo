# {{schemaName}} - technical description
> Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/init/{{schemaName}}/SCHEMA.md)

> Refer to the corresponding [README.md](https://github.com/Fannon/mobo/blob/master/examples/init/{{schemaName}}/README.md) for a more verbose documentation.

This file documents all available attributes mobo will use and validate for your {{schemaName}}s.

## {{schemaName}} specific properties
These properties will only work in context of {{schemaName}}s.
{{{specificSchema}}}

## mobo specific properties
These mobo custom properties are global and can be used for fields, models and forms. 
{{{moboJsonSchemaAdditions}}}

## Unsupported JSON Schema Core features
These features / properties of JSON Schema Core are not supported by mobo: 
{{{jsonSchemaCoreRemovals}}}

## Complete JSON Schema
This is the final JSON Schema, including a simplified JSON Schema core and all mobo and {{schemaName}} specific addons / changes. 

```json
{{{fullSchema}}}
```