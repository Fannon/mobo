 // This module loads the handlebars template engine and adds custom extensions
 // Those are mainly helper functions that make wikitext generation easier

var handlebars = require('handlebars');

/**
 * mobo options, injected through setMoboOptions(options)
 * @type {{}}
 */
handlebars.moboSettings = {};


//////////////////////////////////////////
// Handlebars Custom Extensions         //
//////////////////////////////////////////

/**
 * Generate SMW Template Attribute
 */
handlebars.registerHelper('smw_templ_attr', function(attr) {
    'use strict';

    var result = exports.printProperty(attr);

    return new handlebars.SafeString(result);
});

/**
 * Generates the #set parser call
 * This is where semantic attributes are set on the main-level
 *
 * Uses the hidden annotation instead of #set, since #set caused problems in certain conditions
 *
 * @see https://semantic-mediawiki.org/wiki/Help:Setting_values
 */
handlebars.registerHelper('smw_set', function(obj) {
    'use strict';

    var result = '';
    var separator = handlebars.moboSettings.arraymapSeparator || ';';

    if (obj) {
        var model = obj.properties || obj;

        for (var key in model) {
            var attr = model[key];

            if (attr.smw_property === false) {
                continue; // Don't add this as a semantic property
            }

            if (attr.smw_overwriteData) {
                result += ' [[' + attr.id + '::' + attr.smw_overwriteData + '| ]]';
            } else if (attr.smw_overwriteOutput) {
                result += ' [[' + attr.id + '::' + attr.smw_overwriteOutput + '| ]]';
            } else if (attr.smw_arraymap) {
                // Use #set notation for arraymap values (https://semantic-mediawiki.org/wiki/Help:Setting_values#Separator_parameter)
                result += ' {{#set: ' + attr.id + '={{{' + attr.id + '|}}}|+sep=' + separator + '}}';

            } else {
                result += ' [[' + attr.id + '::{{{' + attr.id + '|}}}| ]]';
            }

        }
    }

    return new handlebars.SafeString(result);
});

/**
 * Generates the #subobject parser call
 *
 * This is where semantic attributes of subobjects are set
 *
 * mobo automatically adds two "dummy" properties, to make querying easier
 * subobject=type of subobject
 * superobject=parent page
 *
 * Example Query: [[subobject=Adress]][[Superobject::Max Mustermann]]
 * This looks for a subobject of type Adress, and limits the search to the person Max Mustermann
 *
 * @todo: Support named identifier???
 *
 * @see https://semantic-mediawiki.org/wiki/Help:Adding_subobjects
 */
handlebars.registerHelper('smw_subobject', function(obj, name) {
    'use strict';

    var separator = handlebars.moboSettings.arraymapSeparator || ';';
    var result = '{{#subobject:|\n';
    var attrCounter = 0;

    // Automatically inserted dummy attributes, to make querying easier
    // @see https://semantic-mediawiki.org/wiki/Help:Adding_subobjects#Querying_for_subobjects
    result += ' |subobjectType=' + name + '\n';
    result += ' |subobjectParent={{FULLPAGENAME}}\n';

    var model = obj.properties || obj;

    for (var key in model) {
        var attr = model[key];
        var id = attr.id;

        if (attr.smw_property === false) {
            continue; // Don't add this as a semantic property
        }

        if (attr.smw_overwriteData) {
            result += ' |' + id + '=' + attr.smw_overwriteData + '\n';
        } else if (attr.smw_overwriteOutput) {
            result += ' |' + id + '=' + attr.smw_overwriteOutput + '\n';
        } else if (attr.smw_arraymap) {
            // Fields that contain multiple values
            result += ' |' + id + '={{{' + id + '|}}}|+sep=' + separator + '\n';
        } else {
            result += ' |' + id + '={{{' + id + '|}}}\n';
        }

        attrCounter += 1;
    }

    // Append additional subobject properties from "smw_subobjectExtend"
    if (obj.smw_subobjectExtend) {
        for (var propertyName in obj.smw_subobjectExtend) {
            result += ' |' + propertyName + '=' + obj.smw_subobjectExtend[propertyName] + '\n';
        }
    }

    result += '}}';

    // If no attributes have to be declared, omit the #subobject function completely
    if (attrCounter === 0) {
        result = '';
    }

    return new handlebars.SafeString(result);
});


/**
* Create a custom wikitext function
* Takes the function name (don't forget the # if needed!) and a simple Object/Map
* TODO: This can be refactored to its own wikitext helper function (utils, separate NPM module!)
*/
handlebars.registerHelper('smw_customFunction', function(name, obj) {
    'use strict';

    var result = '{{' + name + ':\n';

    for (var id in obj) {
        var value = obj[id];
        result += ' |' + id + '=' + value + '\n';
    }

    result += '}}';

    return new handlebars.SafeString(result);
});

/**
 * Convert JavaScript Object (Set) to parameters
 * If no param object is given, this returns ''
 */
handlebars.registerHelper('smw_params', function(params) {
    'use strict';

    var wikitext = '';

    if (params) {
        for (var paramKey in params) {
            var paramValue = params[paramKey];
            if (!paramValue || paramValue === true) {
                wikitext += '|' + paramKey;
            } else {
                wikitext += '|' + paramKey + '=' + paramValue;
            }
        }
    }

    return new handlebars.SafeString(wikitext);
});

/**
 * Adds further parameters to the Form Header
 */
handlebars.registerHelper('smw_formparams', function(multiple) {
    'use strict';

    var result = '';

    if (multiple) {
        result += '|multiple';

        if (multiple.minItems || multiple.minItems === 0) {
            result += '|minimum instances=' + multiple.minItems;
        }

        if (multiple.maxItems) {
            result += '|maximum instances=' + multiple.maxItems;
        }
    }
    return new handlebars.SafeString(result);
});

/**
 * Generate SMW Form Entry
 *
 * TODO: Refactor this out to the smwLayer!
 * TODO: Most of this should be moved to mobo_template/form.wikitext !
 */
handlebars.registerHelper('smw_formtable', function(model) {
    'use strict';

    var result = '';

    if (model && model.properties) {

        var fieldCollection = model.properties;

        if (handlebars.moboSettings.sf_responsiveForms) {
            result += '<div class="sfFormContainer">\n';
        } else {
            result += '{| class="formtable"\n';
        }


        for (var fieldName in fieldCollection) {

            // Variables
            var field = fieldCollection[fieldName];
            var title = field.title;
            var id = field.id;
            var paramObj = {};
            var additionalClasses = '';
            var additionalAttributes = '';

            // If the field requests a full overwrite, use this instead of
            if (field.sf_overwrite) {
                // TODO: Make this an official feature, think of a good name
                result += field.sf_overwrite;
            } else if (field.noEdit) {
                // TODO: Make this an official feature, think of a good name
                result += '';
            } else {
                // Skip deprecated fields -> No field will be rendered
                if (field.deprecated === true) {
                    continue;
                }

                if (field.showForm === false) {
                    additionalAttributes += ' style="display: none;"';
                }

                // Tag field via html class with attribute Name
                paramObj.class = 'attr_' + id;
                additionalClasses = ' ' + id;

                // Default Widget Type
                paramObj['input type'] = 'text';

                var sfFieldFunction = '{{{field|' + id;

                // Mandatory Fields
                if (model.required && model.required.indexOf(fieldName) > -1) {
                    paramObj.mandatory = true;
                    additionalClasses += ' mandatoryInput';
                }

                // If an * (astericks) is given, require all fields of the model
                if (model.required && model.required.indexOf('*') > -1) {
                    paramObj.mandatory = true;
                    additionalClasses += ' mandatoryInput';
                }

                // Recommended Fields
                if (model.recommended && model.recommended.indexOf(fieldName) > -1) {
                    additionalClasses += ' recommendedInput';
                }

                // Enum Fields
                if (field.enum) {
                    paramObj['input type'] = 'dropdown';
                    paramObj.values = field.enum.join(', ');
                }

                // Multiple Values -> List
                if (field.type === 'array') {
                    paramObj.list = true;
                    paramObj.delimiter = ';';
                    paramObj['input type'] = 'tokens';
                }

                // Booleans
                if (field.type === 'boolean') {
                    paramObj['input type'] = 'checkbox';
                }

                if (field.format && field.format === 'date') {
                    paramObj['input type'] = 'datepicker';
                }

                // Default Values
                if (field.default) {
                    paramObj.default = field.default;
                }

                // Default Values
                if (field.size) {
                    paramObj.size = field.size;
                }

                // JSON Schema Validation
                if (field.maxLength) {
                    paramObj.maxlength = field.maxLength;
                }

                // If attributes are given in sf_form use them directly. Overwrites all calculated parameters
                if (field.sf_form) {
                    for (var paramName in field.sf_form) {
                        paramObj[paramName] = field.sf_form[paramName];
                    }
                }

                // Insert the description as a SimpleTooltip info icon, if this is enabled as a setting
                if (handlebars.moboSettings.useSimpleTooltipDescriptions && field.description) {
                    title = '{{#tip-text:' + title + '|' + field.description + '}}';
                }


                sfFieldFunction += exports.addParameters(paramObj) + '}}}';

                if (field.smw_appendFormField) {
                    sfFieldFunction += field.smw_appendFormField;
                }

                if (handlebars.moboSettings.sf_responsiveForms) {
                    // TODO: The CSS Classes could be set as options:
                    result += '<div class="sfFieldRow row' + additionalClasses + '"' + additionalAttributes + '>\n';
                    result += '<div class="sfFieldLabel col-sm-4 col-md-3">' + title + '</div>\n';
                    result += '<div class="sfFieldContent col-sm-8 col-md-9">' + sfFieldFunction + '</div>\n';
                } else {
                    result += '! ' + title + ':\n';
                    result += '| ' + sfFieldFunction;
                }

                if (handlebars.moboSettings.sf_responsiveForms) {
                    result += '</div>\n';
                } else {
                    result += '\n|-\n';
                }
            }

        }

        if (handlebars.moboSettings.sf_responsiveForms) {
            result += '</div>\n';
        } else {
            result += '|}\n';
        }


    } else {
        result += '';
    }

    return new handlebars.SafeString(result);
});


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Sets / injects the mobo options into the handlebars template engine
 * This is necessary for the custom functions that depend on mobos configuration
 *
 * @param {{}} options
 */
handlebars.setMoboSettings = function(options) {
    'use strict';
    handlebars.moboSettings = options;
};

/**
 * Helper Function wich takes a Parameter Object and turns it into wikitext parameters
 *
 * @param paramObj
 * @returns {string}
 */
exports.addParameters = function(paramObj, lineBreak) {
    'use strict';
    var html = '';
    for (var paramName in paramObj) {
        var paramValue = paramObj[paramName];

        if (paramValue === true || paramValue === null) {
            html += '|' + paramName;
        } else if (paramValue === undefined) {
            html += ''; // Skip
        } else {
            html += '|' + paramName + '=' + paramValue;
        }

        if (lineBreak) {
            html += '\n';
        }

    }

    return html;
};

/**
* This Helper function inspects a mobo field and outputs it accordingly as either:
* * Plain text
* * Link to WikiPage
* * FormRedLink, using (multiple if "form" contains more than one item) Semantic Forms
*
* @param attr
*/
exports.printProperty = function(attr) {
    'use strict';

    var result = '';
    var inspect = attr.items || attr;

    var contentType = 'text';

    var targetForm = '';
    /** If more than one "form" is given, the formredlink will offer alternative forms */
    var alternativeForms = '';

    // If the format is "page", create a wiki link
    if (inspect.format && inspect.format.toLowerCase() === 'page') {
        contentType = 'page';
    }

    // If the field links to one or more forms:
    if (inspect.form && inspect.form.length > 0) {

        contentType = 'form';

        if (inspect.form.length === 1) {

            // Link to single Form
            targetForm = '|form=' + inspect.form[0];
        } else {

            // Link to multiple forms
            for (var i = 0; i < inspect.form.length; i += 1) {

                var form = inspect.form[i];

                // If the first defined form should be used as default
                // The other forms will then be offered as alternatives
                if (i === 0 && handlebars.moboSettings.firstAlternativeFormAsDefault) {
                    targetForm = '|form=' + form;
                    continue;
                }

                alternativeForms += '|alt_form[' + i + ']=' + form;
            }
        }
    }

    /** Separator for fields with multiple items / entries */
    var sep = handlebars.moboSettings.arraymapSeparator || ';';

    // Differentiate between ArrayMaps and single attributes
    if (attr.smw_arraymap) {

        // MULTIPLE VALUES PROPERTIES (#arraymap)

        if (contentType === 'page') {
            result = '{{#arraymap:{{{' + attr.id + '|}}}|' + sep + '|@@@@|[[@@@@{{!}}@@@@]]|' + sep + '&nbsp;}}';
        } else if (contentType === 'form') {
            result = '{{#arraymap:{{{' + attr.id + '|}}}|' + sep + '|@@@@|{{#formredlink:target=' + '@@@@' + targetForm + alternativeForms + '|link text=@@@@ }}|' + sep + '&nbsp;}}';
        } else {
            result = '{{#arraymap:{{{' + attr.id + '|}}}|' + sep + '|@@@@|@@@@|' + sep + '&nbsp;}}';
        }

        if (attr.smw_arraymaptemplate) {
            result = '{{#arraymaptemplate:{{{' + attr.id + '|}}}|' + attr.smw_arraymaptemplate + '|' + sep + '|}}';
        }

    } else {

        // SINGLE VALUE PROPERTIES

        if (contentType === 'page') {
            result = '[[{{{' + attr.id + '|}}}|{{{' + attr.id + '}}}]]';
        } else if (contentType === 'form') {
            result = '{{#formredlink:target={{{' + attr.id + '|}}}' + targetForm + alternativeForms + '|link text={{{' + attr.id + '}}} }}';
        } else {
            result = '{{{' + attr.id + '|}}}';
        }
    }

    //Overwrite the wikitext result of the property
    if (attr.smw_overwriteOutput) {
        result = attr.smw_overwriteOutput;
        if (attr.smw_overwriteOutputToLink) {
            if (contentType === 'form') {
                result = '{{#formredlink:target=' + result + targetForm + alternativeForms + '}}';
            } else {
                result = '[[' + result + ']]';
            }
        }
    }

    // Overwrite the attribute display:
    if (attr.smw_overwriteDisplay) {
        result = attr.smw_overwriteDisplay;
    }

    return result;
};

module.exports = handlebars;
