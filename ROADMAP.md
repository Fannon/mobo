## SHORT-TERM
 * TODO: More display formats for templates

## MID-TERM
 * TODO: Read all template with readProject(), make custom subtemplates (especially smw_display modues) available
 * TODO: Mobo Quality bot
 * TODO: Support smw_showPage = false
 * TODO: Split moboSchema.js to several JSON files?

## LONG-TERM (v2.0?)
 * TODO: Create own model generation JSON Schema standard ($ prefixes)
 * TODO: Add on top of that the target system addtions (smw prefixes)
 * TODO: Split the readProject and extendRegistry into own, target-platform independend module
 * TODO: Write an own MediaWiki upload bot that supports promises, queues with concurrency and proper error handling???
 * TODO: Move Uploader to an own NPM module, receiving changed / added / removed pages
 * TODO: Support for modular models that can be managed through git / package.json.
         A master model that overwrites (and may even delete) parts of the combined models
 * TODO: Internationalization and Localization capabilities (model & templates)
 * TODO: "$inject": "/module/modulename to inject arbitrary model parts on the current hierachy at it's current place.. ?
         Problem: $inject keyword may not be uses more than once, since keynames have to be unique!
 * TODO: Replace template engine (http://paularmstrong.github.io/swig/ ?)
 * TODO: Custom smw_display templates, each having its own file (so they won't get overwritten by an update)
 * TODO: importHelper could support "intelligent" data cleaning, always applying Trim, but also making arrays to sets if the Schema declares so

## DISCUSSION
 * TODO: Current values from namespace behaviour: smw property doesn't include the namespace in the property declaration
