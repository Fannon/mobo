[![npm version](https://img.shields.io/npm/v/mobo.svg?style=flat)](https://www.npmjs.com/package/mobo)
[![Dependency Status](https://img.shields.io/david/Fannon/mobo.svg?style=flat)](https://david-dm.org/Fannon/mobo)
[![Build Status](https://img.shields.io/travis/Fannon/mobo.svg?style=flat)](http://travis-ci.org/Fannon/mobo)

<p align="center" style="background: #000; border-radius:3px;">
    <img src="http://fannon.de/p/mobo-intro/img/logo.png"/>
</p>

## Deprecation Warning
> This project is out of date and won't work with any recent version of [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) anymore. It won't be updated or supported anymore, sorry.

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
* Fore more technical and architectural backgrounds on mobo, read my master thesis [Schema-Driven Development of Semantic MediaWikis](http://fannon.de/p/Schema-Driven_Development_of_Semantic_MediaWikis.pdf)

## Screenshots
The mobo model is developed with your favorite text editor:

![text-editor](https://fannon.gitbooks.io/mobo-documentation/content/_img/editor.png)

----------------------------------------------------------------

Mobo is a console application. It validates, generates and uploads your model in realtime:

![cli](https://fannon.gitbooks.io/mobo-documentation/content/_img/mobo-cli.gif)

----------------------------------------------------------------

There is a webapp that allows you to browse your development model and the resulting wikitext:

![webapp](https://fannon.gitbooks.io/mobo-documentation/content/_img/mobo-inspector.gif)

----------------------------------------------------------------

The final result in the wiki:

![forms](https://fannon.gitbooks.io/mobo-documentation/content/_img/mobo-sf-result.png)

----------------------------------------------------------------

Mobo can generate a graph (which has to be layouted via Gephi) that can be explored in an interactive application:

![graph](https://fannon.gitbooks.io/mobo-documentation/content/_img/mobo-graphexplorer.gif)
