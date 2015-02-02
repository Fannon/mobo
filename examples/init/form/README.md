Forms
=====
Forms define which models and templates to aggregate into a Semantic Form.
Models can be either implemented as a single instance or multiple instance. If a multiple instance template is needed, it has to be wrapped in an array. (See example)

Additional properties
---------------------
See the corresponding [form/SCHEMA.md](https://github.com/Fannon/mobo/blob/master/examples/init/form/SCHEMA.md) file for a description of all possible properties.


Including Templates
-------------------
If you want to include (existing!) templates into the form, you can do so by $extending an smw_template.
There are two options, both true by default:
 * "showForm" decides if the template is rendered while displaying the form in edit mode
 * "showSite" decides if the template should be rendered when displaying the site. (Notice: The Site has to be (re)saved through the form to make this work.

This is useful for introducion headers into a form / resulting site. If you use the HeaderTabs Extension you are required to use this.

Examples
--------

### /form/
```json
{
    "title": "Circle",
    "description": "Circle Form",
    "type": "object",

    "properties": {

        "CircleHeader": {
            "$extend": "/smw_template/CircleHeader.wikitext",
            "showForm": true,
            "showSite": true
        },
        "circle": {
            "type": "array",
            "items": {
                "$extend": "/model/Circle.json"
            }
        },

        "qualityHeader": { "wikitext": "=Quality=" },
        "quality": { "$extend": "/model/Quality.json" }
    }
}
```