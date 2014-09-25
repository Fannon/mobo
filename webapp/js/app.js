/* global sigma */

var cbm = {};


//////////////////////////////////////////
// Options / Config                     //
//////////////////////////////////////////

cbm.remoteWiki = 'http://semwiki-exp01.multimedia.hs-augsburg.de/exp-wiki/index.php';
cbm.displayForm = false;

require.config({
    baseUrl: ".."
});

//////////////////////////////////////////
// Bootstrap                            //
//////////////////////////////////////////


$(document).ready(function() {

    cbm.route();

    $(window).on('hashchange', function() {
        cbm.route();
    });

    $('#select-schema').select2().on("change", function(e) {
        var selection = e.val.split('/');
        window.location.hash = '#' + selection[0] + '/' + selection[1];
    });

    $('#select-wikitext').select2().on("change", function(e) {
        window.location.hash = '#' + e.val;
    });

    cbm.populateSelect('selection');

});


//////////////////////////////////////////
// Main Functions                       //
//////////////////////////////////////////

cbm.route = function() {

    var hash = window.location.hash;

    if (!hash) {
        hash = '#form/Bereich';
    }

    hash = hash.replace('#', '');
    var hashArray = hash.split('/');

    if (hash.indexOf(":") > -1) {

        hashArray = hash.split(':');
        cbm.showDetail(hashArray[0], hashArray[1]);

    } else {

        $('#default-view').show();
        $('#detail-view').hide();

        require(["lib/docson/docson"], function(docson) {

            cbm.docson = docson;

            if (hashArray.length === 2) {
                cbm.loadSchema(hashArray[0], hashArray[1]);
            } else {
                cbm.loadSchema('model', 'Abteilung');
            }
        });
    }
};

cbm.loadSchema = function(type, name) {

    var schema;

    $('#form').html('');
    $('#doc').html('');
    $('#refs').html('');
    $('#refs-ul').html('');
    $('#smw_markup').html('');

    if (type === 'model') {
        schema = cbm.registry.deep[name];
    } else if (type === 'form') {
        schema = cbm.registry.deepForm[name];
    } else if (type === 'field') {
        schema = cbm.registry.field[name];
    }

    cbm.schemaOrig = schema;

    $('#schema-orig').text(JSON.stringify(schema, false, 4));

    cbm.docson.templateBaseUrl = "../lib/docson/templates";

    cbm.docson.doc("doc", schema);
    cbm.schemaFull = schema;
    $('#schema').text(JSON.stringify(schema, false, 4));
    cbm.printMediaWikiMarkup(type, name);


    if (cbm.displayForm) {
        var element = document.getElementById('form');
        cbm.editor = new JSONEditor(element, {
            schema: schema,
            theme: 'bootstrap3',
            iconlib: "bootstrap3",
            disable_edit_json: true,
            disable_collapse: true,
            no_additional_properties: true,
            ajax: true
        });

        cbm.editor.on('ready', function() {

        });

        cbm.editor.on('change', function() {
            cbm.getResult();
        });
    }

};


cbm.populateSelect = function() {

    var html = '';

    // Forms
    html += ('<optgroup label="Form">');
    for (name in cbm.registry.form) {
        html += '<option value="form/' + name + '">' + name + '</option>';
    }
    html += '</optgroup>';

    // Models
    html += ('<optgroup label="Model">');
    for (name in cbm.registry.deep) {
        html += '<option value="model/' + name + '">' + name + '</option>';
    }
    html += '</optgroup>';

    // Fields
    html += ('<optgroup label="Field">');
    for (name in cbm.registry.field) {
        html += '<option value="field/' + name + '">' + name + '</option>';
    }
    html += '</optgroup>';

    $('#select-schema').append(html);


    html = '';
    for (var siteName in cbm.wikitext) {
        html += '<option value="' + siteName + '">' + siteName + '</option>';
    }
    $('#select-wikitext').append(html);

};


cbm.getResult = function() {

    var errors = cbm.editor.validate();

    if (errors.length) {
        $('#result').text(JSON.stringify(errors, false, 4));
        $('#result').parent().removeClass('valid');
        $('#result').parent().addClass('invalid');
    } else {
        var value = cbm.editor.getValue();
        $('#result').text(JSON.stringify(value, false, 4));
        $('#result').parent().removeClass('invalid');
        $('#result').parent().addClass('valid');
    }
};


cbm.printMediaWikiMarkup = function(type, name) {

    for (var siteName in cbm.wikitext) {

        var fileName = siteName.replace(':', '-');
        var wikitext = cbm.wikitext[siteName];

        if (siteName.indexOf(name) !=-1) {

            var html = '<h4><a href="#' + type + ':' + name + '">' + siteName + '</a>';
            html    += ' <small><a href="' + cbm.remoteWiki + '/' +  siteName + '" target="_blank">[remote]</a></small></h4>';
            html    += '<pre>' + wikitext.escape() + '</pre>';

            $('#smw_markup').append(html);
        }
    }

};

cbm.showDetail = function(type, name) {

    if (type === 'model') {
        schema = cbm.registry.deep[name];
    } else if (type === 'form') {
        schema = cbm.registry.deepForm[name];
    } else if (type === 'field') {
        schema = cbm.registry.field[name];
    }

    $('#default-view').hide();
    $('#detail-markup').text(cbm.wikitext[type + ':' + name]);
    $('#detail-view').show();
};


//////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////


cbm.sortObjectByKey = function(obj){
    var keys = [];
    var sorted_obj = {};

    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            keys.push(key);
        }
    }

    // sort keys
    keys.sort();

    // create new array based on Sorted Keys
    jQuery.each(keys, function(i, key){
        sorted_obj[key] = obj[key];
    });

    return sorted_obj;
};


String.prototype.escape = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};
