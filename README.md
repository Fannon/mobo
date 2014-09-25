#  [![Build Status](https://secure.travis-ci.org/Fannon/mobo.png?branch=master)](http://travis-ci.org/Fannon/mobo)

> mobo is JSON Schema based modeling bot for Semantic MediaWiki!

Work in progress! Not ready for release yet.

## Abstract
The structure of a Semantic MediaWiki (SMW) can become hard to develop and maintain as it increases in size and complexity. 
With this project an object oriented modeling approach based on the JSON Schema format is introduced. 
Instead of creating SMW Attributes, Templates and Forms by hand in wikitext, Fields, Models and Forms are defined through JSON Files. 
Properties can be inherited and overwritten which keeps the model DRY.
A Node.js based toolset has been created that validates, visualizes, converts and uploads the model in real-time. 
While in early stages, this approach worked well for the specific needs of the company that sponsored this project.

## Getting Started
Requirements: [Node.js](http://nodejs.org/)
Install the module (globally) with: `npm install mobo -g`

Create a new directory for your model. mobo --init will initialize it with the default structure. 
Entering ´mobo´ without parameters enters the interactive mode.

```sh
$ npm install -g mobo
$ mkdir new_model && cd new_model
$ mobo --init
$ mobo
```

## Documentation
Visit the [project wiki](https://github.com/Fannon/mobo/wiki) for more detailed documentation.

There are a few README.md files around that explain specific parts of the development model:
* [Command Line Options](cli.md)
* [Field](examples/init/field/README.md)
* [Form](examples/init/form/README.md)
* [Model](examples/init/model/README.md)
* [SMW Query](examples/init/smw_query/README.md)
* [SMW Site](examples/init/smw_site/README.md)
* [SMW Template](examples/init/smw_template/README.md)
* [Templates](examples/init/templates/README.md)

## Examples

_(Coming soon)_


## License

Copyright (c) 2014 Simon Heimler
Licensed under the MIT license.
