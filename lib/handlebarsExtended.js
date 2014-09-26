/**
 * This module loads the handlebars template engine and adds custom extensions
 * Those are mainly helper functions that make wikitext generation easier
 */

var handlebars = require('handlebars');


//////////////////////////////////////////
// Handlebars Custom Extensions         //
//////////////////////////////////////////

handlebars.registerHelper('smw_templ_attr', function(name) {
    var result = '[[' + name + '::{{{' + name + '|}}}]]';
    return new handlebars.SafeString(result);
});

/**
 * Generate ArrayMap Template
 */
handlebars.registerHelper('smw_templ_array', function(name) {
    var result = '{{#arraymap:{{{' + name + '|}}}|;|x|[[' + name + '::x]]|,&nbsp;}}';
    return new handlebars.SafeString(result);
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

            // Default Widget Type
            paramObj['input type'] = 'text with autocomplete';

            result += '! ' + attr.title + ':\n';
            result += '| {{{field|' + attrName;

            // Mandatory Fields
            if (model.required && model.required.indexOf(attrName) > -1) {
                paramObj.mandatory = true;
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

            if (paramObj['class']) {
                paramObj['class'] += ' attr_' + attrName;
            } else {
                paramObj['class'] = 'attr_' + attrName;
            }

            result += exports.addParameters(paramObj);

            result += '}}}';

            // Hack to insert Field Description
            if (attr.description) {
                result += '{{#info:' + attr.description + '}}';
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
