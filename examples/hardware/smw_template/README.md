# MediaWiki Templates
* Read this file online at GitHub: [form/README.md](https://github.com/Fannon/mobo/blob/master/examples/init/smw_template/README.md)

## Description
This directory works similar like /smw_page/. MediaWiki Templates can be stored here without having to prepend `template___`. All templates in this directory will overwrite any template mobo has created before.

Please note that some characters can’t be used for filenames, so some string substitutions have to be made. 

* `___` will be substituted with `:` (namespaces)
* `---` will be substituted with `/` (subpages)