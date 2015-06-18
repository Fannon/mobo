[![Gitter](https://img.shields.io/badge/gitter-join%20chat-blue.svg)](https://gitter.im/Fannon/mobo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)
[![npm version](https://img.shields.io/npm/v/mobo.svg?style=flat)](https://www.npmjs.com/package/mobo)
[![Dependency Status](https://img.shields.io/david/Fannon/mobo.svg?style=flat)](https://david-dm.org/Fannon/mobo)
[![Build Status](https://img.shields.io/travis/Fannon/mobo.svg?style=flat)](http://travis-ci.org/Fannon/mobo)
[![Code Climate](https://codeclimate.com/github/Fannon/mobo/badges/gpa.svg)](https://codeclimate.com/github/Fannon/mobo)
[![Test Coverage](https://codeclimate.com/github/Fannon/mobo/badges/coverage.svg)](https://codeclimate.com/github/Fannon/mobo)

<p align="center" style="background: #000; border-radius:3px;">
    <img src="http://fannon.de/p/mobo-intro/img/logo.png"/>
</p>
## About mobo
[Mobo](https://www.npmjs.com/package/mobo) is a command line toolset that helps to build [Semantic MediaWiki](http://semantic-mediawiki.org/) structure in an agile,
Schema-Driven Development (simplified MDE) way.
The model is written in [YAML](http://yaml.org/) or [JSON](http://json.org/), using object oriented [JSON Schema](http://json-schema.org/).

Since the model is organized in folders and plain text files, an editor of choice and Version Control Systems like Git can be used.
There is no need of additional tooling.

The main feature of mobo is the model development workflow.
Semantic MediaWikis can be developed rapidly and modular, leading to a more agile development process.
Mobo can run in an interactive mode, automatically validating and uploading the development model in realtime.

It features a web application for inspecting the development model in its various stages
and can also be used to batch-import wiki pages or data (programmatically).

Mobo is [Open Source](https://github.com/Fannon/mobo) and Cross-Platform.

## Documentation
* Read the [documentation online](http://fannon.gitbooks.io/mobo-documentation/content/)
* Download the documentation at [GitBook](https://www.gitbook.com/book/fannon/mobo-documentation)

## Screenshots
The mobo model is developed with your favorite text editor:

![text-editor](http://up.fannon.de/img/editor.png)

----------------------------------------------------------------

Mobo is a console application. It validates, generates and uploads your model in realtime:

![cli](http://up.fannon.de/img/mobo-cli.gif)

----------------------------------------------------------------

There is a webapp that allows you to browse your development model and the resulting wikitext:

![webapp](http://up.fannon.de/img/mobo-inspector.gif)

----------------------------------------------------------------

The final result in the wiki:

![forms](http://up.fannon.de/img/mobo-intro-sf.png)

----------------------------------------------------------------

Mobo can generate a graph (which has to be layouted via Gephi) that can be explored in an interactive application:

![graph](http://up.fannon.de/img/mobo-intro-graphexplorer.gif)
