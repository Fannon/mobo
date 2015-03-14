## Tutorial: Hardware Management
* Read this file online at GitHub: [it/TUTORIAL.md](https://github.com/Fannon/mobo/blob/master/examples/it/TUTORIAL.md)

This tutorial explains how to build a mobo development model along the hardware management example. Please note that the example and the tutorial are greatly simplified!

### Set up new project
Create a new empty project and adjust your settings.json. Please refer to the mobo readme how do this.

### Run mobo the first time
Now run mobo the first time and check that the settings are correct and the upload to the external wiki is working. At http://localhost:8080/ should be a web application ready.

![mobo-first-start](http://up.fannon.de/img/mobo-first-start.png)

### Conceptualization of the model and its domain
Before heading into the actual model development, some thought should be put into how the domain should be modeled.

Hardware is deployed at `Locations`. There are several types of hardware, like `NetworkPrinter`, `MultiFunctionUnit`, `Workstations`, etc. Those must be respectivly splitted into -models (the general hardwaremodel) and -installations (the concrete installation and configuration on a location). Hardwaremodels can have a `Manufacturer` and hardwareinstallations are tied to a location.

The different hardwaremodels will likely share some attributes, so an abstract `_HardwareModel` will come in handy. The same is true for an abstract `_HardwareInstallation`.


### Creating a location
Let's start with the simplest part of the model, the location. Personally I do like to start with the model and create the fields and forms afterward. There is no right and wrong with the order, however.

Create /model/Location.json with the following content:

```json
{
    "title": "Location",
    "description": "Location where hardware is deployed",

    "properties": [
        { "$extend": "/field/streetAdress.json" },
        { "$extend": "/field/streetNumber.json" },
        { "$extend": "/field/town.json" },
        { "$extend": "/field/country.json" }
    ],

    "required": ["streetAdress", "streetNumber", "town" ]
}
```

Once the file is saved, mobo will automatically run and give some feedback:

```text
 [E] (Unknown): invalid $extend to missing "/field/streetAdress.json"!
 [E] (Unknown): invalid $extend to missing "/field/streetNumber.json"!
 [E] (Unknown): invalid $extend to missing "/field/town.json"!
 [E] (Unknown): invalid $extend to missing "/field/country.json"!
 [W] /model/Location.json is never used.
 ```

To keep the model better organized, the Location related fields will be stored at /field/Location/*. Please note that the `$extend` attribute does not include subfolders.

Create /field/Location/streetAdress.json with the following content:

```json
{
    "title": "Street Adress",

    "type": "string"
}
```

This is the simplest possible field. Only the title and the type is mandatory.

```json
{
    "title": "Street Number",

    "type": "number",
    "minimum": 1
}
```

Here we introdude some basic validation. The Street number should be a number of at least 1.

```json
{
    "title": "Town",

    "type": "string",

    "smw_form": {
        "input type": "text with autocomplete"
    }
}
```

Since towns may be referenced more than once, it makes sense to provide autocomplete capabilities. This is done, by setting the "smw_form" property, containing [Semantic Forms settings](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27field.27_tag). 

```json
{
    "title": "Country",

    "type": "string",
    "enum": [
        "USA",
        "UK",
        "Germany"
    ],

    "default": "USA"
}
```

We want to support only three countries, so an enum is a good solution. In this field three countries are given and one is set as default. It will be displayed as a dropdown menu by default.

The last warning message is giving the hint that `model/Location.json` is never used. This is because there is no form that is including it. 

Create /form/Location.json with the following content:

```json
{
    "title": "Location",

    "properties": [
        { "$extend": "/model/Location.json" }
    ]
}
```

This is the simplest possible form, referencing the previous model as its sole content. We can now head to the wiki and try the form in action:

![mobo-simple-location](http://up.fannon.de/img/mobo-simple-location.png)

Head to the mobo viewer application at your [localhost:8080](http://localhost:8080) to browse through the development model on the left search box. 

![mobo-viewer-left](http://up.fannon.de/img/mobo-viewer-left.png)

The final resulting wikitext pages can be browsed through the right search box.

![mobo-viewer-right](http://up.fannon.de/img/mobo-viewer-right.png)
