[![Build Status](https://secure.travis-ci.org/Fannon/mobo.png?branch=master)](http://travis-ci.org/Fannon/mobo)

<p align="center">
    <img src ="http://fannon.de/p/mobo-intro/img/logo.png" />
</p>

## Why mobo?
The structure of a Semantic MediaWiki (SMW) can become hard to develop and maintain as it increases in size and complexity.
With this project an object oriented modeling approach based on the JSON Schema format is used.
Instead of creating SMW Attributes, Templates and Forms by hand in wikitext, Fields, Models and Forms are defined through JSON Files. Properties can be inherited and overwritten which keeps the model DRY.

mobo is a Node.js based toolset that validates, visualizes, converts and uploads your development model in real-time to your wiki.

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
Install mobo and create a new project:
```sh
$ npm install -g mobo               # Installs mobo globally. If this fails: "sudo npm install -g mobo"
$ mkdir new_model && cd new_model   # Creates and enters new directory
$ mobo --init                       # Initializes the empty directory with the default structure
$ nano settings.json                # Adjust / enter options (login data for the bot...)
$ mobo                              # Runs mobo in interactive mode
```

If mobo can't be added to your global path, it can be run manually:
```sh
$ node /path/to/mobo/cli.js 
```

### Update
```sh
$ npm update -g mobo
```

Note that new versions of mobo can introduce changed default templates. 
You might have to update your project templates with the current version. 
To do so use the update command. It will make a backup of your current templates.
```sh
$ mobo --update
```

## Configuration
To overwrite the default settings, just add them to your settings.json.

Enter `mobo -c` to print out the currently used configuration, including all inherited default values.
If you want to change a setting, simply copy it into your settings.json and adjust it.

## Documentation
* Watch the [mobo presentation](http://fannon.de/p/mobo-intro/) oder read the [paper](http://fannon.de/p/mobo-paper.pdf).
* Visit the [project wiki](https://github.com/Fannon/mobo/wiki) for more detailed documentation and tutorials.
* For more documentation on the underlying JSON Schema format, visit [json-schema.org](http://json-schema.org/)
* For more documentation on the (meta)templating language, used in the /templates/ folder, visit [handlebars.js](http://handlebarsjs.com/)

There are a few context specific README.md files within the project:
If you create a new project via `mobo --init` they will be placed in your project directory.
* [Command Line Options](cli.md) (`mobo -h`)
* [Available Project Settings](examples/init/settings.md)
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

> mobo is a console application. It validates, generates and uploads your model - in realtime by default:

![cli](http://fannon.de/p/mobo-intro/img/cli2.png)

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
