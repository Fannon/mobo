/**
 * This module loads the handlebars template engine and adds custom extensions
 * Those are mainly helper functions that make wikitext generation easier
 */
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

    var result = '';
    var attributeName = attr.id || 'UNDEFINED';

    var prefix = '';
    var suffix = '';
    var contentType = 'text';
    var targetForm = '';

    /** If "oneOf" property is used, the formredlink will offer alternative forms */
    var alternativeForms = '';

    // Check if the attribute contains text or links to a page
    // This is done by checking if the format is of type "Page" or links to a Form (starts with "/")
    var format = attr.format || false;
    if (attr.items && attr.items.format) {
        format = attr.items.format;
    }

    var oneOf = false;
    if (attr.oneOf && attr.oneOf[0]) {
        oneOf = attr.oneOf;
    } else if (attr.items && attr.items.oneOf && attr.items.oneOf[0]) {
        oneOf = attr.items.oneOf;
    }

    // Handle properties that link to multiple forms
    if(oneOf) {

        for (var i = 0; i < oneOf.length; i++) {
            if (oneOf[i].format) {

                format = oneOf[i].format;
                var niceFormatArray = format.split('/');
                var niceFormat = niceFormatArray[2].replace('.json', '');

                if (i === 0) {
                    format = oneOf[0].format;
                } else {
                    alternativeForms += '|alt_form[' + (i - 1) + ']=' + niceFormat;
                }
            }
        }

    }

    if (format && format.toLowerCase() === 'page') {
        contentType = 'page';
    } else if (format && format.charAt(0) === '/' ) {
        contentType = 'form';
        var formatArray = format.split('/');
        targetForm = formatArray[2].replace('.json', '');
    }

    /** Separator for fields with multiple items / entries */
    var sep = handlebars.moboSettings.arraymapSeparator || ';';

    // Calculate Pre- and Suffix for the Field text / Link URL
    // Special Case: Namecases require manually setting
    if (attr.smw_form && attr.smw_form['values from namespace']) {
        prefix += attr.smw_form['values from namespace'] + ':';
    }
    if (attr.mobo && attr.mobo.displayPrefix) {
        prefix += attr.mobo.displayPrefix;
    }
    if (attr.mobo && attr.mobo.displaySuffix) {
        suffix += attr.mobo.displaySuffix;
    }

    var finalPropertyName = prefix + '{{{' + attributeName + '|}}}' + suffix;
    var finalPropertyArrayMap =  prefix + '@@@@' + suffix;

    // Differentiente between ArrayMaps and single attributes
    if (attr.smw_arraymap) {

        // MULTIPLE VALUES PROPERTIES (#arraymap)

        if (contentType === 'page') {
            result = '{{#arraymap:{{{' + attributeName + '|}}}|' + sep + '|@@@@|[[' + finalPropertyArrayMap + '{{!}}@@@@]]|' + sep + '&nbsp;}}';
        } else if (contentType === 'form') {
            result = '{{#arraymap:{{{' + attributeName + '|}}}|' + sep + '|@@@@|{{#formredlink:target=' + finalPropertyArrayMap + '|form=' + targetForm + alternativeForms + '|link text=@@@@ }}|' + sep + '&nbsp;}}';
        } else {
            result = '{{#arraymap:{{{' + attributeName + '|}}}|' + sep + '|@@@@|' + finalPropertyArrayMap + '|' + sep + '&nbsp;}}';
        }

    } else {

        // SINGLE VALUE PROPERTIES

        if (contentType === 'page') {
            result = '[[' + finalPropertyName + '|{{{' + attributeName + '}}}]]';
        } else if (contentType === 'form') {
            result = '{{#formredlink:target=' + finalPropertyName + '|form=' + targetForm + alternativeForms + '|link text={{{' + attributeName + '}}} }}';
        } else {
            result = finalPropertyName;
        }

    }

    return new handlebars.SafeString(result);
});

/**
 * Generates the #set parser call
 * This is where semantic attributes are set
 *
 * @todo: Check if separator should be made dynamic, depending on settings or even the model
 *
 * @see https://semantic-mediawiki.org/wiki/Help:Setting_values
 */
handlebars.registerHelper('smw_set', function(attr) {

    var separator = ';';
    var result = '{{#set:\n';
    var attrCounter = 0;

    for (var attrKey in attr) {
        var attrValue = attr[attrKey];
        var id = attrValue.id;


        if (attrValue.smw_property === false) {
            continue; // Don't add this as a semantic property
        }

        if (attrValue.smw_arraymap) {
            // Fields that contain multiple values
            result += ' |' + id + '={{{' + id + '|}}}|+sep=' + separator + '\n';
        } else {
            result += ' |' + id + '={{{' + id + '|}}}\n';
        }

        attrCounter += 1;
    }

    result += '}}';

    // If no attributes have to be declared, omit the #set function completely
    if (attrCounter === 0) {
        result = '';
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
 * @todo: Check if separator should be made dynamic, depending on settings or even the model
 * @todo: Support named identifier???
 *
 * @see https://semantic-mediawiki.org/wiki/Help:Adding_subobjects
 */
handlebars.registerHelper('smw_subobject', function(attr, name) {

    var separator = ';';
    var result = '{{#subobject:|\n';
    var attrCounter = 0;

    // Automatically inserted dummy attributes, to make querying easier
    // @see https://semantic-mediawiki.org/wiki/Help:Adding_subobjects#Querying_for_subobjects
    result += '|subobject=' + name;
    result += '|superobject={{FULLPAGENAME}}';

    for (var attrKey in attr) {
        var attrValue = attr[attrKey];
        var id = attrValue.id;

        if (attrValue.smw_property === false) {
            continue; // Don't add this as a semantic property
        }

        if (attrValue.smw_arraymap) {
            // Fields that contain multiple values
            result += ' |' + id + '={{{' + id + '|}}}|+sep=' + separator + '\n';
        } else {
            result += ' |' + id + '={{{' + id + '|}}}\n';
        }

        attrCounter += 1;
    }

    result += '}}';

    // If no attributes have to be declared, omit the #subobject function completely
    if (attrCounter === 0) {
        result = '';
    }

    return new handlebars.SafeString(result);
});

/**
 * Convert JavaScript Object (Set) to parameters
 * If no param object is given, this returns ''
 */
handlebars.registerHelper('smw_params', function(params) {

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
 */
handlebars.registerHelper('smw_formtable', function(model) {

    var result = '';

    if (model && model.properties) {

        var attrCollection = model.properties;

        if (handlebars.moboSettings.sfDivLayout) {
            result += '<div class="sfFormContainer">\n';
        } else {
            result += '{| class="formtable"\n';
        }


        for (var attrName in attrCollection) {

            // Variables
            var attr = attrCollection[attrName];
            var title = attr.title;
            var id = attr.id;
            var paramObj = {};

            // Reset default Size (Set more intelligently by CSS)
            paramObj['size'] = 'none';

            // Tag field via html class with attribute Name
            paramObj['class'] = 'attr_' + id;

            // Default Widget Type
            paramObj['input type'] = 'text';

            var sfFieldFunction = '{{{field|' + id;

            // Mandatory Fields
            if (model.required && model.required.indexOf(attrName) > -1) {
                paramObj.mandatory = true;
            }

            // Recommended Fields
            if (model.recommended && model.recommended.indexOf(attrName) > -1) {
                paramObj['class'] += ' recommendedField';
            }

            // Enum Fields
            if (attr.enum) {
                paramObj['input type'] = 'dropdown';
                paramObj['values'] = attr.enum.join(', ');
            }

            // Multiple Values -> List
            if (attr.type === 'array') {
                paramObj['list'] = true;
                paramObj['delimiter'] = ';';
                paramObj['input type'] = 'tokens';
            }

            // Booleans
            if (attr.type === 'boolean') {
                paramObj['input type'] = 'checkbox';
            }

            if (attr.format && attr.format === 'date') {
                paramObj['input type'] = 'datepicker';
            }

            // Default Values
            if (attr.default) {
                paramObj['default'] = attr.default;
            }

            // Default Values
            if (attr.size) {
                paramObj['size'] = attr.size;
            }

            // JSON Schema Validation
            if (attr.maxLength) {
                paramObj['maxlength'] = attr.maxLength;
            }

            // If attributes are given in smw_form use them directly. Overwrites all calculated parameters
            if (attr.smw_form) {
                for (var paramName in attr.smw_form) {
                    paramObj[paramName] = attr.smw_form[paramName];
                }
            }

            // Insert the description as a SimpleTooltip info icon, if this is enabled as a setting
            if (handlebars.moboSettings.useSimpleTooltipDescriptions && attr.description) {
                title = '{{#tip-text:' + title + '|' + attr.description + '}}';
            }

            sfFieldFunction += exports.addParameters(paramObj) + '}}}';

            if (handlebars.moboSettings.sfDivLayout) {
                result += '<div class="sfFieldRow">\n';
                result += '<div class="sfFieldLabel">' + title + '</div>\n';
                result += '<div class="sfFieldContent">' + sfFieldFunction + '</div>\n';
            } else {
                result += '! ' + title + ':\n';
                result += '| ' + sfFieldFunction;
            }

            if (handlebars.moboSettings.sfDivLayout) {
                result += '</div>\n';
            } else {
                result += '\n|-\n';
            }

        }

        if (handlebars.moboSettings.sfDivLayout) {
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
    handlebars.moboSettings = options;
};

/**
 * Helper Function wich takes a Parameter Object and turns it into wikitext parameters
 *
 * @param paramObj
 * @returns {string}
 */
exports.addParameters = function(paramObj, lineBreak) {
    var html = '';
    for (var paramName in paramObj) {
        var paramValue = paramObj[paramName];

        if (paramValue === true) {
            html += '|' + paramName;
        } else if (paramValue === false) {
            // Skip Attribute
        } else {
            html += '|' + paramName + '=' + paramValue;
        }
        if (lineBreak) {
            html += '\n';
        }

    }

    return html;

};

module.exports = handlebars;
