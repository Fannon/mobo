[![npm version](https://badge.fury.io/js/mobo.svg)](http://badge.fury.io/js/mobo)
[![npm](https://img.shields.io/npm/l/express.svg)]()
[![Dependency Status](https://david-dm.org/Fannon/mobo.svg)]()
[![Build Status](https://secure.travis-ci.org/Fannon/mobo.png?branch=master)](http://travis-ci.org/Fannon/mobo)
[![codecov.io](https://codecov.io/github/Fannon/mobo/coverage.svg?branch=master)](https://codecov.io/github/Fannon/mobo?branch=master)


<p align="center">
    <img src ="http://fannon.de/p/mobo-intro/img/logo.png" />
</p>

## About mobo
mobo is a command line tool that generates Semantic MediaWiki structure from object oriented [JSON Schema](http://json-schema.org/) files.
It is built to provide a fast, automated and DRY (don't repeat yourself) model development workflow.

mobo converts, validates, visualizes and uploads your development model in realtime to your wiki.

## Getting Started
### Requirements
* [Node.js](http://nodejs.org/) is required for mobo to install/run.
* A Semantic MediaWiki Installation is required as upload target. Semantic Forms is required, the HeaderTabs and TemplateData extension are supported.
* Your wiki needs a bot account that provides the login data you need to specify in your settings.json. The Bot should have the "bot" and possibly the "administrator" (if you want to upload special pages) privileges.
* Your wiki needs to have the API enabled with write access. This is enabled by default since MW 1.14, but if not adjust your LocalSettings.php:

```php
// WARNING: This opens public write access.
// If you don't want this, you'll need to setup additional restrictions.
$wgEnableAPI = true;
$wgEnableWriteAPI = true;
$wgCrossSiteAJAXdomains = array( '*' );
```

### Installation
mobo should be installed on the machine you're developing your model on. It doesn't have to be installed on the server itself.

First install mobo and create a default project structure:
```sh
$ npm install -g mobo               # Installs mobo globally. If this fails: "sudo npm install -g mobo"
$ mkdir new_model && cd new_model   # Creates and enters new directory
$ mobo --init                       # Initializes the empty directory with the default structure
```

Sometimes it makes sense to install mobo locally into your project directory.
That way you can make sure the project uses a specific version of mobo (this is stored in the `package.json` file. Other projects could use different versions.
```sh
$ npm install mobo --save           # Installs mobo locally into the project directory
```

### Configuration
First you have to configure the upload settings, otherwise mobo will not work.
To do so adjust the `settings.json` in your project directory.

Example:
```json
{
    "mw_server_url": "http://semwiki-exp01.multimedia.hs-augsburg.de",
    "mw_server_path": "/mobo-demo",
    "mw_username": "mobo",
    "mw_password": "verysafepassword"
}
```

For more customization, enter `mobo -c` to print out the currently used configuration, including all inherited default values.
If you want to change a setting, simply copy it into your settings.json and adjust it. Enter `mobo -c` again to check if it was applied.

```sh
$ mobo -c               # prints out all settings and their current state
```

### Run mobo
mobo can be run in different modes. Usually the interactive mode is most useful.
```sh
$ mobo            # Runs mobo in interactive mode
$ mobo -r         # Runs mobo in non-interactive mode (will exit after run)
$ mobo -f         # Forces the upload of all files (will exit after run)
```

If mobo can't be added to your global path, it can be run manually:
```sh
$ node /path/to/mobo/cli.js
```

### Update
Update mobo to the latest version through npm:
```sh
$ npm update -g mobo
```

Note that new versions of mobo can introduce changed default templates.
You might have to update your project templates with the current version.
To do so use the `mobo --update` command. It will make a backup of your current templates.
```sh
$ mobo --update
```

## Documentation
### General Documentation
* Visit the [project wiki](https://github.com/Fannon/mobo/wiki) for more detailed documentation and tutorials.
* Watch the [mobo presentation](http://fannon.de/p/mobo-intro/) oder read the [paper](http://fannon.de/p/mobo-paper.pdf).
* For more documentation on the underlying JSON Schema format, visit [json-schema.org](http://json-schema.org/)
* For more documentation on the (meta)templating language, used in the /templates/ folder, visit [handlebars.js](http://handlebarsjs.com/)

### Specific Documentation
There are a few context specific README.md and SCHEMA.md files within the project, that contain documentation.
If you create a new project via `mobo --init` they will be placed in your project directory.

* [Command Line Options](cli.md) (`mobo -h`)
* [/settings.md (global project settings)](examples/init/settings.md)
    * [/field (Your Fields)](examples/init/field/README.md)
    * [/model (Your Models)](examples/init/model/README.md)
    * [/form (Your Forms)](examples/init/form/README.md)
    * [/smw_query (Queries)](examples/init/smw_query/README.md)
    * [/smw_page (Wikipages)](examples/init/smw_page/README.md)
    * [/smw_template (MediaWiki Templates)](examples/init/smw_template/README.md)
    * [/templates (mobo templates)](examples/init/templates/README.md)

## Screenshots
> Your model is developed with your favorite text editor:

![text-editor](http://fannon.de/p/mobo-intro/img/st.png)

> mobo is a console application. It validates, generates and uploads your model - in realtime by default:

![cli](http://fannon.de/p/mobo-intro/img/cli4.png)

> There is a webapp that allows you to browse your current model and the resulting wikitext:

![webapp](http://fannon.de/p/mobo-intro/img/webgui.png)

> mobo can generate a graph model (has to be layouted via Gephi) that can be explored interactively:

![graph](http://fannon.de/p/mobo-intro/img/graphselect.png)

> The final SMW structure makes use of Semantic Forms:

![forms](http://fannon.de/p/mobo-intro/img/edit.png)

> Templates are auto-documented:

![docs](http://fannon.de/p/mobo-intro/img/docs.png)

## Demo

_(Coming soon)_


## License

Copyright (c) 2014 Simon Heimler
Licensed under the MIT license.
