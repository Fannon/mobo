## Tutorial: Hardware Management
> Read the latest version [online at GitHub](https://github.com/Fannon/mobo/blob/master/examples/hardware/TUTORIAL.md).

This tutorial explains how to build a mobo development model along the [hardware management example](https://github.com/Fannon/mobo/tree/master/examples/hardware). Please note that the example and the tutorial are greatly simplified!

### Set up new project
Create a new empty project and adjust your settings.json. Please refer to the mobo [MANUAL.md](https://github.com/Fannon/mobo/blob/master/examples/init/MANUAL.md#create-a-new-project) how do this.

### Run mobo the first time
Now run mobo the first time and check that the settings are correct and the upload to the external wiki is working. At your [localhost:8080](http://localhost:8080) should be a web application ready.

![mobo-first-start](http://up.fannon.de/img/mobo-first-start.png?v=3)

### Conceptualization of the model and its domain
Before heading into the actual model development, some thought should be put into how the domain should be modeled.

Hardware is deployed at `Locations`. There are several types of hardware, like `NetworkPrinter`, `MultiFunctionUnit`, `Workstations`, etc. Those must be respectivly splitted into -models (the general hardwaremodel) and -installations (the concrete installation and configuration on a location). Hardwaremodels can have a `Manufacturer` and hardwareinstallations are tied to a location.

The different hardwaremodels will likely share some attributes, so an abstract `_HardwareModel` will come in handy. The same is true for an abstract `_HardwareInstallation`.


### Creating a location
#### Create model
Let's start with the simplest part of the model, the location. Personally I do like to start with the model and create the fields and forms afterward. There is no right and wrong with the order, however.

Create `/model/Location.json` with the following content:

```json
{
    "title": "Location",
    "description": "Location where hardware is deployed",

    "properties": [
        { "$extend": "/field/streetAdress" },
        { "$extend": "/field/streetNumber" },
        { "$extend": "/field/town" },
        { "$extend": "/field/country" }
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

#### Create fields
To keep the model better organized, the Location related fields will be stored at /field/Location/*. Please note that the `$extend` attribute does not include subfolders.

Create `/field/Location/streetAdress.json` with the following content:

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

Since towns may be referenced more than once, it makes sense to provide autocomplete capabilities. This is done by setting the "smw_form" property, declaring [Semantic Forms settings](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#.27field.27_tag). 

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

#### Create form
The last warning message is giving the hint that `model/Location.json` is never used. This is because there is no form that is including it. 

Create `/form/Location.json` with the following content:

```json
{
    "title": "Location",

    "properties": [
        { "$extend": "/model/Location" }
    ]
}
```

This is the simplest possible form, referencing the previous model as its sole content. We can now head to the wiki and try the form in action:

![mobo-simple-location](http://up.fannon.de/img/mobo-simple-location.png?v=1)

### Create a HardwareModel
#### Create models
In the next step, the `NetworkPrinterModel` will be created. It is of the type `HardwareModel` and will use object-oriented inheritance.

Create `/model/HardwareModel/_HardwareModel.json` with the following content:

```json
{
    "title": "Hardware Model",

    "properties": [
        { "$extend": "/field/brand" },
        { "$extend": "/field/modelName" }
    ],

    "required": ["brand", "modelName"],

    "abstract": true
}
```

The abstract model contains two required fields that will be shared by all other Hardware Models. Since it's defined as abstract, it will not be created in the wiki. 

Create `/model/HardwareModel/NetworkPrinterModel.json` with the following content:

```json
{
    "$extend": "/model/_HardwareModel",

    "title": "Network Printer Model",

    "properties": [
        { "$extend": "/field/colorPrinting" }
    ],

    "propertyOrder": ["brand", "modelName"]
}
```

The `NetworkPrinterModel` used `$extend` to inherit all attributes from the `_HardwareModel`. It overwrites the title attribute and adds a description and the `color` field.

The color field will by default appear as the first field on the form since it's most recently added. To keep the brand and modelName on top, the order of the properties has to be set manually. Please note that not all existing properties have to be included. Those missing will be added below in their original order.

#### Create fields
The creation of the fields will be skipped, since they contain no new concepts. Please refer to the example files instead.

#### Create form
Please refer to the example files.

### Create a HardwareInstallation
#### Create models
Now the actual `NetworkPrinterInstallation` can be created. 

Create `/model/HardwareInstallation/_HardwareInstallation.json` with the following content:

```json
{
    "title": "Hardware Installation",

    "properties": [
        { "$extend": "/field/serialNumber" }
    ],

    "smw_subobject": true,
    "smw_category": false,

    "abstract": true
}
```

Since there are Hardwaredevices that are network capable and share therefore some more common properties, another abstract model will be created that inherits from the `HardwareInstallation`.

Hardware Installations will store their semantic properties as a subobjects, instead of directoy to the page. This is necessary becasuse we want to define multiple instances of them on a location and the attribute names would duplicate otherwise.

Create `/model/HardwareInstallation/_NetworkDeviceInstallation.json` with the following content:

```json
{
    "$extend": "/model/_HardwareInstallation",

    "title": "NetworkDevice Installation",

    "properties": [
        { "$extend": "/field/ip" }
    ],

    "abstract": true
}
```

Create `/model/HardwareInstallation/_NetworkDeviceInstallation.json` with the following content:

```json
{
    "$extend": "/model/_NetworkDeviceInstallation",

    "title": "Network Printer Installation",

    "properties": [
        { "$extend": "/field/networkPrinterModel" }
    ]
}
```

The final `NetworkPrinterInstallation` extends from the `_NetworkDeviceInstallation` and will define it's network printer model.

#### Create fields
The field `networkPrinterModel` will reference to a `NetworkPrinterModel`.

Create `/field/HardwareInstallation/_hardwareModelReference.json` with the following content:

```json
{
    "title": "Model",
    "description": "You may only select already existing mardware models!",

    "type": "string",

    "smw_form": {
        "max values": 1,
        "input type": "combobox",
        "existing values only": true
    },

    "abstract": true
}
```

All hardware model reference fields will now use the input type combobox and allow only one (already existing) value.

Create `/field/HardwareInstallation/networkPrinterModel.json` with the following content:

```json
{
    "$extend": "/field/_hardwareModelReference",

    "type": "string",
    "format": "/form/NetworkPrinterModel",

    "smw_form": {
        "values from category": "NetworkPrinterModel"
    }
}
```

This field defines the `NetworkPrinterModel` form as its format. This means that a red link will always link to a wiki page which uses the form to create it by default.

The `"values from category"` setting will ensure that the combox widget will autocomplete on all previous entered `NetworkPrinterModel`s. 

### Extend the location form to include Network Printers
Network Printers should be added at locations through Semantic Forms [multiple instance templates](http://www.mediawiki.org/wiki/Extension:Semantic_Forms/Defining_forms#Multiple-instance_templates). 

Adjust `/field/HardwareInstallation/networkPrinterModel.json` to the following content:

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
    ]
}
```

Two new $extends are now made. First, a template is included that will provide a header and is shown in both form and page view. Since both booleans are true by default, they could be omitted in this example.

Create the template at `/swm_template/Headers/NetworkPrinterHeader.wikitext`:

```text
=Network Printer=

```

**NOTE**: Don't forget to add a new line after the headline! Since wikitext is not whitespace insensitive and you might break the layout otherwise.

The second extend is an array which contains multiple `NetworkPrinterInstallation`s and will be implemented as the already mentioned Semantic Forms multiple template instance.

The final form will now look like this: 

![mobo-final-hardware-example](http://up.fannon.de/img/mobo-final-hardware-example.png)

### Create an ASK Query with mobo

Create `/smw_query/NetworkPrinterModels.json` with the following content:

```text
{{#ask: [[category:NetworkPrinterModel]]
| ?brand
| ?modelName
| limit=999
}}
```

This will cause mobo to generate the query as a new template with the pagename `Template:NetworkPrinterModels-ask`. If you head there, you will find a small usage snippet for embedding, the query text documented and a live query. The live query may not work if it's dependend on a specific context, though.

It might make sense to include this query in the already generated `Category:NetworkPrinterModel`. To do this, we need to overwrite the generated wikipage. This can easily be done by creating a .wikitext file in the `smw_page` directory:

Create `/smw_page/Overwrite/Category___NetworkPrinterModel.wikitext` with the following content:

```text
{{#ask: [[category:NetworkPrinterModel]]
| ?brand
| ?modelName
| limit=999
}}
```

Note that we can't use `:`` in filenames, so we have to replace it with `___`.

Now we've overwritten the generated category and embedded our new query in it. 

### Excourse: Using HeaderTabs Extension
In case the forms are getting more complex, it might be a good idea to seperate them into tabs. The [HeaderTabs Extension](http://www.mediawiki.org/wiki/Extension:Header_Tabs) is supported by mobo. 

The support can be enabled in the projects `settings.json` by adding:

```json
    "headerTabs": true
```

The `NetworkPrinterHeader` already defines a heading, but the Location model is missing one.

It would be possible to add the header the same way but for single instance templates its more convenient to use mobos "swm_prefix" feature:

Adjust `/model/Location.json` to the following content:

```json
{
    "title": "Location",
    "description": "Location where hardware is deployed",

    "properties": [
        { "$extend": "/field/streetAdress" },
        { "$extend": "/field/streetNumber" },
        { "$extend": "/field/town" },
        { "$extend": "/field/country" }
    ],

    "required": ["streetAdress", "streetNumber", "town" ],

    "smw_prefix": {
        "header": 1,
        "wikitext": "Some description for the location"
    }
}
```

The `"swm_prefix"` attribute allows to add automatically generated headers (using the title attribute as name and defining the hierachy through the number), templates or free wikitext before the template. (There's a `"swm_postfix"` attribute, too)

Now the Location form has got two headings of hierachy one. The HeaderTabs Extension will become active:

![mobo-header-tabs](http://up.fannon.de/img/mobo-header-tabs.png?v=1)
