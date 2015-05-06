# Forms
> Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/init/form/README.md).

> Refer to the corresponding [SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/form/SCHEMA.md) for a technical description of all possible properties.

## Description
Forms will create Semantic Forms. They are much more lightweight than regular SF Forms, since most information have already been declared on the field or model level.

They usually declare:

* Which models to use
* If the model should be implemented as a single or multiple instance
* Which template to use / inject
* The order of the models and templates
* Visibility of templates in edit-view and reading-view

## Form specific features
### smw_forminfo
The `smw_forminput` attribute is an object that contains Semantic Forms [info tag settings](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27info.27_tag).

```json
{
    "smw_forminfo": {
        "create title": "Create a new location",
        "edit title": "Edit a location"
    }
}
```

### smw_forminput
The `smw_forminput` attribute is an object that contains Semantic Forms [#forminput settings](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#The_.23forminput_function).


### smw_freetext
Boolean that enables / disables the freetext field below the form

### smw_summary
Boolean that enables / disables the summary textfield below the form

### smw_naming
Optional text that gives some hints on how to name a page. The text will be displayed on the page where the page name has to be entered in order to create it though the form.

## Including Templates
If you want to include templates into the form, you can do so by $extending an smw_template.

There are two options, both true by default:

* `showForm` decides if the template is rendered while displaying the form in edit mode
* `showSite` decides if the template should be rendered when displaying the site. (Notice: The Site has to be (re)saved through the form to make this work)

This is useful for introducion headers into a form / resulting site. If you use the HeaderTabs Extension you are required to use this.


## Examples
### /form/

```json
{
    "title": "Location",
    "description": "This creates a new location where hardware is deployed.",

    "properties": [
        { "$extend": "/model/Location" },


        {
            "$extend": "/smw_template/NetworkPrinterHeader.wikitext",
            "showForm": true,
            "showPage": true
        },
        {
            "type": "array",
            "items": {
                "$extend": "/model/NetworkPrinterInstallation"
            }
        }
    ],

    "smw_forminfo": {
        "create title": "Create a new location",
        "edit title": "Edit a location"
    }
}
```