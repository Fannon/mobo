#  [![Build Status](https://secure.travis-ci.org/Fannon/mobo.png?branch=master)](http://travis-ci.org/Fannon/mobo)

> Work in progress! Not ready for release yet.

## Why mobo?
The structure of a Semantic MediaWiki (SMW) can become hard to develop and maintain as it increases in size and complexity.
With this project an object oriented modeling approach based on the JSON Schema format is used.
Instead of creating SMW Attributes, Templates and Forms by hand in wikitext, Fields, Models and Forms are defined through JSON Files.
Properties can be inherited and overwritten which keeps the model DRY.
mobo is a Node.js based toolset that validates, visualizes, converts and uploads your development model in real-time.

## Getting Started
* Requirements: [Node.js](http://nodejs.org/)
* Install the module (globally) with: `npm install mobo -g`

```sh
$ npm install -g mobo               # Installs mobo globally
$ mkdir new_model && cd new_model   # Creates and enters new directory
$ mobo --init                       # Initializes the empty directory with the default structure
$ nano settings.json                # Adjust / enter options (login data for the bot...)
$ mobo                              # Runs mobo in interactive mode
```

## Documentation
* Watch the [mobo presentation](http://fannon.de/p/mobo-intro/)!
* Visit the [project wiki](https://github.com/Fannon/mobo/wiki) for more detailed documentation.

There are a few README.md files within the project that explain specific parts of it:
* [Command Line Options](cli.md)
* [Field](examples/init/field/README.md)
* [Form](examples/init/form/README.md)
* [Model](examples/init/model/README.md)
* [SMW Query](examples/init/smw_query/README.md)
* [SMW Site](examples/init/smw_site/README.md)
* [SMW Template](examples/init/smw_template/README.md)
* [Templates](examples/init/templates/README.md)

## Screenshots
> Your model is developed with your favorite text editor:

![text-editor](http://fannon.de/p/mobo-intro/img/st.png)

> There is a webapp that allows you to browse your current model and the resulting wikitext:

![webapp](http://fannon.de/p/mobo-intro/img/webgui.png)

> mobo can generate a graph model (has to be layouted via Gephi) that can be explored interactively:

![graph](http://fannon.de/p/mobo-intro/img/graphselect.png)

> The final SMW structure makes use of Semantic Forms:

![graph](http://fannon.de/p/mobo-intro/img/edit.png)

> Templates are auto-documented:

![graph](http://fannon.de/p/mobo-intro/img/docs.png)

## Demo

_(Coming soon)_


## License

Copyright (c) 2014 Simon Heimler
Licensed under the MIT license.
