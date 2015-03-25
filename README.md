[![npm version](https://img.shields.io/npm/v/mobo.svg?style=flat)](https://www.npmjs.com/package/mobo)
[![Dependency Status](https://img.shields.io/david/Fannon/mobo.svg?style=flat)](https://david-dm.org/Fannon/mobo)
[![Build Status](https://img.shields.io/travis/Fannon/mobo.svg?style=flat)](http://travis-ci.org/Fannon/mobo)
[![Codacy](https://img.shields.io/codacy/a7daff185e694c3d853bb35cbc6405c8.svg)](https://www.codacy.com/public/heimlersimon/mobo/dashboard)
[![Code Climate](https://codeclimate.com/github/Fannon/mobo/badges/gpa.svg)](https://codeclimate.com/github/Fannon/mobo)
[![Test Coverage](https://codeclimate.com/github/Fannon/mobo/badges/coverage.svg)](https://codeclimate.com/github/Fannon/mobo)

<p align="center">
    <img src ="http://fannon.de/p/mobo-intro/img/logo.png" style="border-radius: 3px;"/>
</p>

## About mobo

[![Join the chat at https://gitter.im/Fannon/mobo](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Fannon/mobo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[Mobo](https://www.npmjs.com/package/mobo) is a command line toolset that helps to build Semantic MediaWiki structure in an agile, model driven engineering (MDE) way. The model is developed on the local file system, using an object oriented, customized JSON Schema notation. Since the model is written in plain JSON files, any editor of choice and Version Control Systems like Git can be used.

The main function of the mobo toolset is the JSON Schema based model de-velopment workflow. To support this, it also features a web application that documents the development model in its various stages. There is also an interactive graph explorer that gives a more visual representation.

Mobo can also be used to batch-upload wiki pages in general and it is planned to support some basic external data transformation and importing capabilities.

Mobo is open source and cross platform.

## Model Development Workflow
Mobo can be run in either an interactive or a run-through mode. By default the interactive mode is used, which serves the web application, watches the file system and (re)triggers the model generation process if changes are detected.

Following tasks are executed when using mobo for generating SMW structure:

First, mobo will read the development model and project settings from the local file system.
The model will be pre-validated for errors.
Now mobo will apply inheritance and further processing to generate the “processed development model and do some post-validation on it.

The processed development model will be uses as the basis to generate the SMW wikitext structure.
A good part of this model to final result processing will be internal, but mobo uses customizable templates which will be used to generate the final wikitext.

Finally, mobo calculates the differences between the last upload state and the current state and uploads the wikitext pages on an external wiki

Those steps can run in a few seconds total. This makes mobo a great tool for real-time, iterative model development.

## Getting Started
### Requirements
Mobo requires a Node.js runtime of version 0.10.x or higher to run.

The target wiki must have the [Semantic MediaWiki](http://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki) and [Semantic Forms](http://www.mediawiki.org/wiki/Extension:Semantic_Forms) extension installed.

Mobo has optional support for the [HeaderTabs](http://www.mediawiki.org/wiki/Extension:Header_Tabs) and [TemplateData](http://www.mediawiki.org/wiki/Extension:TemplateData) extension.

### Installation
In most cases mobo should be installed locally on the machine the model is developed on. It is possible to install and use mobo on a server for more advanced use cases, like automatic deployment.

```sh
$ npm install -g mobo               # Installs mobo globally.
$ sudo npm install -g mobo          # Linux: Admin privileges are required
```

If many different projects are managed by mobo it is usually better to install mobo locally into your project directory. Those per-project installations allow to use a specific version of mobo (this information is stored in the `package.json` file). Different projects can use different mobo versions.
```sh
$ mkdir newProject && cd newProject # Creates and enters new directory
$ npm install mobo --save-dev       # Installs mobo locally
```

### Configuration
First your wiki needs a bot account for mobo. The user should have the "bot" and possibly the "administrator" (if you want to upload special pages) privileges.

The MediaWiki API needs to be enabled with write access. This is the default setting since MW 1.14. If the wiki doesn't work right out of the box, adjust your LocalSettings.php accordingly:

```php
// WARNING: Check your permissions and if needed make further constraints.
$wgEnableAPI = true;
$wgEnableWriteAPI = true;
$wgCrossSiteAJAXdomains = array( '*' );
```

Now the login credentials of the bot have to be set. Please adjust the `settings.json` in your project directory accordingly.

```json
{
    "mw_server_url": "http://semwiki-exp01.multimedia.hs-augsburg.de",
    "mw_server_path": "/mobo-demo",
    "mw_username": "mobo",
    "mw_password": "verysafepassword"
}
```

For more options, enter `mobo -c` to print out the currently used configuration, including all inherited default values and refer to the [settings](examples/init/settings.md) manual.
If you want to change a setting, simply copy it into your settings.json and adjust it. Enter `mobo -c` again to check if it was applied.

```sh
$ mobo -c   # prints out all settings and their current state
```

### Run mobo
Mobo runs in interactive mode by default. It supports several command line options.

```sh
$ mobo      # Runs mobo in interactive mode
$ mobo -r   # Runs mobo in non-interactive mode (will exit after run)
$ mobo -f   # Forces the upload of all files (will exit after run)
```

To see all available options, run mobo with the -h flag or refer to the [Command Line Options](cli.md) manual.

```sh
$ mobo -h   # View command line help
```

If mobo can't be added to your global path for some reason, it can be run manually:
```sh
$ node /path/to/mobo/cli.js
```

### Update
Update mobo to the latest version through npm.

**WARNING:** Bigger updates may change the output mobo creates or even change /break existing features. It won't make changes to your development model however and you can always downgrade to a previous mobo version.

```sh
$ npm update -g mobo        # global mobo update to latest
$ npm update -g mobo@0.6.2  # global mobo update to 0.6.2
```

To update a local (project specific) mobo installation, specify / update your version number in your `package.json` first. `"mobo": "0.6.x",` will install / update all minor patches of mobo v0.6, while `"mobo": "*",` will always update to the latest version.

```sh
$ npm update                # local mobo update (package.json)
```

Note that new versions of mobo can introduce changed default templates.
You might have to update your project templates with the current version.
To do so use the `mobo --update` command. This command will make a backup of your current templates.

```sh
$ mobo --update
```

## Documentation
### General Documentation
* Read the mobo [MANUAL.md](https://github.com/Fannon/mobo/blob/master/examples/init/MANUAL.md).
* Read the /hardware/[TUTORIAL.md](https://github.com/Fannon/mobo/blob/master/examples/hardware/TUTORIAL.md) and check out mobos example projects.
* Learn JSON Schema at [json-schema.org](http://json-schema.org/). There's a [great tutorial](http://spacetelescope.github.io/understanding-json-schema/) from the Space Telescope Science Institute.
* For more documentation on the templating language, used in the /templates/ folder, visit [Handlebars.js](http://handlebarsjs.com/)

### Specific Documentation
There are a few context specific README.md and SCHEMA.md files coming with the initial project structure (`mobo --init`).

The README.md files contain basic documentation about the section of the development model, while the SCHEMA.md files contain an auto-generated technical documentation of all possible JSON Schema attributes.

* [/cli.md](lib/cli.md) documenting the command line options (`mobo -h`)
* [/settings.md](examples/init/settings.md)
    * /field/[README.md](examples/init/field/README.md) and [SCHEMA.md](examples/init/field/SCHEMA.md) for a technical documentation
    * /model/[README.md](examples/init/model/README.md) and [SCHEMA.md](examples/init/model/SCHEMA.md) for a technical documentation
    * /form/[README.md](examples/init/form/README.md) and [SCHEMA.md](examples/init/form/SCHEMA.md) for a technical documentation
    * /smw_query/[README.md](examples/init/smw_query/README.md)
    * /smw_page/[README.md](examples/init/smw_page/README.md)
    * /smw_template/[README.md](examples/init/smw_template/README.md)
    * /mobo_template/[README.md](examples/init/mobo_template/README.md)

## Screenshots
The mobo model is developed with your favorite text editor:

![text-editor](http://up.fannon.de/img/mobo-intro-editor.png)

----------------------------------------------------------------

Mobo is a console application. It validates, generates and uploads your model in realtime:

![cli](http://up.fannon.de/img/mobo-intro-run.gif)

----------------------------------------------------------------

There is a webapp that allows you to browse your development model and the resulting wikitext:

![webapp](http://up.fannon.de/img/mobo-intro-viewer.gif)

----------------------------------------------------------------

Mobo can generate a graph (which has to be layouted via Gephi) that can be explored in an interactive application:

![graph](http://up.fannon.de/img/mobo-intro-graphexplorer.gif)

----------------------------------------------------------------

The final result in the wiki:

![forms](http://up.fannon.de/img/mobo-intro-sf.png)

----------------------------------------------------------------

## License
Copyright (c) 2015 Simon Heimler
Licensed under the MIT license.
