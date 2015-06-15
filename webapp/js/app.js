/* global $, document, window, JSONEditor, WebSocket */

/** global namespace */
var mobo = {};

/** Set default settings */
mobo.settings = {
    autoRefreshPort: 8081,
    autoRefreshWebGui: true
};

//////////////////////////////////////////
// Options / Config                     //
//////////////////////////////////////////

mobo.displayForm = true;


require.config({
    baseUrl: '..'
});


//////////////////////////////////////////
// ON DOCUMENT READY                    //
//////////////////////////////////////////

$(document).ready(function() {

    //////////////////////////////////////////
    // EVENTS                               //
    //////////////////////////////////////////

    // Detect hash changes in URL
    $(window).on('hashchange', function() {
        mobo.route();
    });

    // Refresh Data on click
    $('#logo').on('click', function() {
        mobo.loadData();
    });

    // Select 2 Init & Event handling
    var $selectSchema = $('#select-schema').select2();
    var $selectWikitext = $('#select-wikitext').select2();

    // Select Schema events
    $selectSchema.on('select2:select', function(e) {
        if (e && e.params && e.params.data && e.params.data.id) {
            var selection = e.params.data.id.split('/');
            window.location.hash = '#/' + selection[0] + '/' + selection[1];
        } else {
            console.log('Error with selection!');
            console.dir(e);
        }
    });

    // Select Wikitext events
    $selectWikitext.on('select2:select', function(e) {
        if (e && e.params && e.params.data && e.params.data.id) {
            window.location.hash = '#' + e.params.data.id;
        } else {
            console.log('Error with selection!');
            console.dir(e);
        }
    });

    // Connect to WebSocket Server, if available
    // This allows automatically triggering of GUI Refreshes from the server
    var webSockets = mobo.settings.autoRefreshWebGui || true;

    if (webSockets) {
        var host = window.document.location.host.replace(/:.*/, '');
        var port = mobo.settings.autoRefreshPort || 8081;

        var ws = new WebSocket('ws://' + host + ':' + port);
        ws.onmessage = function() {
            mobo.loadData();
        };
    }

    require(['lib/diff'], function(diffLib) {
        mobo.diffLib = diffLib;
    });

    mobo.loadData();

});




//////////////////////////////////////////
// Main Functions                       //
//////////////////////////////////////////

mobo.loadData = function(err, callback) {

    $('#refresh').show();

    $.getJSON('_processed/_lastUploadState.json', function(lastUploadState) {
        mobo.lastUploadState = lastUploadState;
        // Get project settings (for URL to external wiki)
        $.getJSON('_processed/_registry.json', function(registry) {

            mobo.registry = registry;
            mobo.settings = registry.settings;

            mobo.wikitext = registry.generated || {};
            mobo.remoteWiki = mobo.settings.mw_server_url + '/' + mobo.settings.mw_server_path + '/index.php';

            if (Object.keys(mobo.wikitext).length > 0) {
                mobo.populateSelect('selection');
            }

            mobo.route();

            $('#refresh').delay(200).fadeOut(500);

            if (callback) {
                callback();
            }

        });
    });

};

/**
 * Displays a specific part of the model depending on the current URL Hash
 */
mobo.route = function() {

    var hash = window.location.hash;

    // If no hash, use the first model as default entry point
    if (!hash) {
        for (var title in mobo.registry.model) {
            if (title) {
                hash = '#/model/' + title;
                window.location.hash = hash;
                mobo.route();
                break;
            }
        }
    }

    hash = hash.replace('#', '');
    var hashArray = hash.split('/');

    if (hash.charAt(0) === '/') {

        $('#default-view').show();
        $('#detail-view').hide();

        require(['lib/docson/docson'], function(docson) {

            mobo.docson = docson;

            if (hashArray.length === 3) {
                mobo.loadSchema(hashArray[1], hashArray[2]);
            } else {
                console.log('Invalid url-hash');
            }
        });
    } else {
        hashArray = hash.split(':');
        mobo.showDetail(hash);
    }

};

/**
 * Displays a specific part of the model
 *
 * Uses Docson for documentation
 * Uses JSONEditor for forms
 * Uses jQuery for raw text
 *
 * @param type
 * @param name
 */
mobo.loadSchema = function(type, name) {

    var schema;

    $('#form').html('');
    $('#doc').html('');
    $('#refs').html('');
    $('#refs-ul').html('');

    if (type === 'model') {
        schema = mobo.registry.expandedModel[name];
    } else if (type === 'form') {
        schema = mobo.registry.expandedForm[name];
    } else if (type === 'field') {
        schema = mobo.registry.expandedField[name];
    }

    $('#sub-nav-title').html('/' + type + '/' + name);
    $('#sub-nav-link').html(mobo.settings.cwd + schema.$filepath);

    mobo.schemaOrig = schema;

    $('#schema-orig').text(JSON.stringify(schema, false, 4));

    mobo.docson.templateBaseUrl = '../lib/docson/templates';

    mobo.docson.doc('doc', schema);
    mobo.schemaFull = schema;
    $('#schema').text(JSON.stringify(schema, false, 4));

    if (mobo.displayForm) {

        var element = document.getElementById('form');
        mobo.editor = new JSONEditor(element, {
            schema: schema,
            theme: 'bootstrap3',
            iconlib: 'fontawesome4',
            disable_edit_json: true,
            disable_collapse: true,
            no_additional_properties: true,
            ajax: true
        });

        mobo.editor.on('ready', function() {

        });

        mobo.editor.on('change', function() {
            mobo.getResult();
        });
    }

};

/**
 * Populates the (Select2) Selection box with available options
 */
mobo.populateSelect = function() {

    var html = '<option></option>';
    var name;

    // Forms
    html += ('<optgroup label="Form">');
    for (name in mobo.registry.form) {
        html += '<option value="form/' + name + '">' + name + '</option>';
    }
    html += '</optgroup>';

    // Models
    html += ('<optgroup label="Model">');
    for (name in mobo.registry.expandedModel) {
        html += '<option value="model/' + name + '">' + name + '</option>';
    }
    html += '</optgroup>';

    // Fields
    html += ('<optgroup label="Field">');
    for (name in mobo.registry.field) {
        html += '<option value="field/' + name + '">' + name + '</option>';
    }
    html += '</optgroup>';

    $('#select-schema').html(html);


    html = '<option></option>';
    for (var siteName in mobo.wikitext) {
        html += '<option value="' + siteName + '">' + siteName + '</option>';
    }
    $('#select-wikitext').html(html);

};

/**
 * Validates the example forms. Displays the success / error messages
 */
mobo.getResult = function() {

    var errors = mobo.editor.validate();

    if (errors.length) {
        $('#result').text(JSON.stringify(errors, false, 4));
        $('#result').parent().removeClass('valid');
        $('#result').parent().addClass('invalid');
    } else {
        var value = mobo.editor.getValue();
        $('#result').text(JSON.stringify(value, false, 4));
        $('#result').parent().removeClass('invalid');
        $('#result').parent().addClass('valid');
    }
};

/**
 * Handles the JSON Schema text rendering
 *
 * @param siteName
 */
mobo.showDetail = function(siteName) {

    var generated = mobo.registry.generated[siteName];
    var lastUploadState = mobo.lastUploadState[siteName];
    var display = $('#detail-markup');

    $('#default-view').hide();

    $('#sub-nav-title').html(siteName.trim());
    $('#sub-nav-link').html('<a href="' + mobo.remoteWiki + '/' +  siteName + '" target="_blank">' + mobo.remoteWiki + '/' +  siteName + '</a>');


    if (generated !== lastUploadState) {

        console.log('DIFF!');
        var diff = mobo.diffLib.diffWordsWithSpace(generated, lastUploadState);

        diff.forEach(function(part) {
            // green for additions, red for deletions
            // grey for common parts
            var cssClass = part.added ? 'diff-added' : part.removed ? 'diff-removed' : '';
            var span = document.createElement('span');
            span.className  = cssClass;
            span.appendChild(document
                .createTextNode(part.value));
            $('#detail-markup').append(span);
        });

    } else {
        console.log('No DIFF!');
        display.text(mobo.registry.generated[siteName]);
    }

    $('#detail-view').show();
};


//////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////

/**
 * Sorts objects alphabetically by key
 *
 * @param obj
 * @returns {{}}
 */
mobo.sortObjectByKey = function(obj) {
    var keys = [];
    var sorted_obj = {};

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    // sort keys
    keys.sort();

    // create new array based on Sorted Keys
    $.each(keys, function(i, key) {
        sorted_obj[key] = obj[key];
    });

    return sorted_obj;
};

/**
 * Escapes special HTML characters
 *
 * @returns {string}
 */
mobo.escapeWikitext = function(wikitext) {

    if (wikitext) {

        if (!wikitext.replace) {
            console.dir(wikitext);
        }

        var tagsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return wikitext.replace(/[&<>]/g, function(tag) {
            return tagsToReplace[tag] || tag;
        });
    } else {
        return '';
    }

};
