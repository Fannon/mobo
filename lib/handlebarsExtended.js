/**
 * This module loads the handlebars template engine and adds custom extensions
 * Those are mainly helper functions that make wikitext generation easier
 */

var handlebars = require('handlebars');


//////////////////////////////////////////
// Handlebars Custom Extensions         //
//////////////////////////////////////////

/**
 * Generate SMW Template Attribute
 * @deprecated
 */
handlebars.registerHelper('smw_templ_attr', function(name) {
    var result = '[[' + name + '::{{{' + name + '|}}}]]';
    return new handlebars.SafeString(result);
});

/**
 * Generate ArrayMap Template
 * @deprecated
 */
handlebars.registerHelper('smw_templ_array', function(name) {
    var result = '{{#arraymap:{{{' + name + '|}}}|;|x|[[' + name + '::x]]|,&nbsp;}}';
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

    for (var attrKey in attr) {
        var attrValue = attr[attrKey];
        attrKey = attrKey.trim();

        if (attrValue.smw_arraymap) {
            // Fields that contain multiple values
            result += ' |' + attrKey + '={{{' + attrKey + '|}}}|+sep=' + separator + '\n';
        } else {
            result += ' |' + attrKey + '={{{' + attrKey + '|}}}\n';
        }
    }

    result += '}}';

    return new handlebars.SafeString(result);
});

/**
 * Generates the #subobject parser call
 * This is where semantic attributes of subobjects are set
 *
 * @todo: Check if separator should be made dynamic, depending on settings or even the model
 * @todo: Support named identifier???
 *
 * @see https://semantic-mediawiki.org/wiki/Help:Adding_subobjects
 */
handlebars.registerHelper('smw_subobject', function(attr) {

    var separator = ';';
    var result = '{{#subobject:\n';

    for (var attrKey in attr) {
        var attrValue = attr[attrKey];
        attrKey = attrKey.trim();

        if (attrValue.smw_arraymap) {
            // Fields that contain multiple values
            result += ' |' + attrKey + '={{{' + attrKey + '|}}}|+sep=' + separator + '\n';
        } else {
            result += ' |' + attrKey + '={{{' + attrKey + '|}}}\n';
        }
    }

    result += '}}';

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

        result += '{| class="formtable"\n';

        for (var attrName in attrCollection) {

            // Variables
            var attr = attrCollection[attrName];
            var paramObj = {};

            // Reset default Size (Set more intelligently by CSS)
            paramObj['size'] = 'none';

            // Tag field via html class with attribute Name
            paramObj['class'] = 'attr_' + attrName;

            // Default Widget Type
            paramObj['input type'] = 'text';

            result += '! ' + attr.title + ':\n';
            result += '| {{{field|' + attrName;

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

            result += exports.addParameters(paramObj);

            result += '}}}';

            // Hack to insert Field Description
            // TODO: This is not very adjustable, but the options are difficult to reach from here.
            if (attr.description) {
                result += '{{#tip-info:' + attr.description + '}}';
            }

            result += '\n|-\n';
        }

        result += '|}\n';
    } else {
        result += '';
    }

    return new handlebars.SafeString(result);
});

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
