//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs         = require('fs-extra');
var Promise    = require('bluebird');
var _          = require('lodash');

var moboUtil   = require('./../util/moboUtil');
var log        = moboUtil.log;

/**
 * 1)   Builds a graph model from the current development data model
 *      This takes the relationships between the fields, models and forms into account.
 *      The resulting graph will be exported as a .json and a .gexf (Gephi) file.
 *      The .gefx file needs further layouting to be ready for viewing in the interactive graph browser!
 *
 * 2)   Validates the model for consistency
 *      This takes the relationships into account and will throw warnings if inconsistencies are detected
 *
 * @param settings
 * @param registry
 */
exports.exec = function(settings, registry) {

    /** Settings */
    exports.settings = settings;

    /** Map, containing all nodes */
    exports.nodes = {};

    /** Map, containing all edges */
    exports.edges = {};

    exports.connections = 0;


    return new Promise(function (resolve) {

        //////////////////////////////////////////
        // Analyze Expanded Registry            //
        //////////////////////////////////////////

        exports.analyzeFields(registry.expandedField);
        exports.analyzeModels(registry.expandedModel, registry.expandedField);
        exports.analyzeForms(registry.expandedForm);


        //////////////////////////////////////////
        // Analyze Templates                    //
        //////////////////////////////////////////

        exports.analyzeTemplates(registry.smw_template);


        //////////////////////////////////////////
        // Export to .gefx (Gephi)              //
        //////////////////////////////////////////

        var gefxExport = exports.gefxExport(exports.nodes, exports.edges);
        fs.outputFile(settings.processedModelDir + '_graph.gexf', gefxExport);

        //////////////////////////////////////////
        // Statistics                           //
        //////////////////////////////////////////


        log('------------------------------------------------------------------------------');
        log(' ' +
        _.size(exports.nodes) + ' Nodes | ' +
        _.size(exports.edges) + ' Edges | ' +
        exports.connections + ' Connections');
        log('------------------------------------------------------------------------------');

        resolve(registry);

    });

};

/**
 * Analyzes the fields of the model
 * Fields are always nodes
 *
 * @param fields
 */
exports.analyzeFields = function(fields) {

    for (var fieldName in fields) {

        // Create DataType Nodes
        var field = fields[fieldName];
        var fieldPageName = 'property:' + fieldName;

        var node = {
            id: fieldPageName,
            label: fieldPageName,
            niceLabel: field.title || fieldPageName,
            filepath: field.$filepath || '',
            description: field.description || '',
            size: exports.settings.buildGraphSettings.dataTypeNodeSize,
            connections: 0
        };

        node.type = field.type || false;
        if (field.items && field.items.type) {
            node.type = field.items.type;
        }
        node.color = exports.getColor(node.type);

        var format = field.format || false;
        if (field.items && field.items.format) {
            format = field.items.format;
        }

        // Ignore abstract and ignored fields
        if (field.abstract || field.ignore) {
            continue;
        }

        if (field.items) {
            field.multiple = true;
        }

        if (format && format.charAt(0) === '/') {

            // Calculate and write field target
            field.target = moboUtil.resolveReference(format, fieldPageName).id;

        } else if (field.items && (field.items.anyOf || field.items.allOf)) {

            // Do not create a node for this field, since it is only referencing to other nodes

        } else {

            if (format) {
                node.type += '-' + format;
            }

            field.target = fieldName;
            exports.nodes[fieldPageName] = node;
        }
    }
};

/**
 * Adds models to the graph and their relationships to fields
 *
 * @param models
 * @param fields
 */
exports.analyzeModels = function(models, fields) {

    var model;
    var modelPageName;

    // Iterate Models to create Model Nodes
    for (var modelName in models) {

        model = models[modelName];
        modelPageName = 'template:' + modelName;

        // Ignore abstract and ignored models
        if (model.abstract || model.ignore) {
            continue;
        }

        exports.nodes[modelPageName] = {
            id: modelPageName,
            label: modelPageName,
            niceLabel: model.title || modelPageName,
            filepath: model.$filepath || '',
            description: model.description || '',
            type: "Model",
            color: exports.getColor("Model"),
            size: exports.settings.buildGraphSettings.modelNodeSize,
            connections: 0
        };

        if (model.smw_subobject) {
            exports.nodes[modelPageName].type = 'SubObject';
            exports.color = exports.getColor("SubObject");
        }

    }

    // Iterate Models to generate edges, depending on the fields used
    for (modelName in models) {

        model = models[modelName];
        modelPageName = 'template:' + modelName;

        // Ignore abstract and ignored models
        if (model.abstract || model.ignore) {
            continue;
        }

        for (var propertyName in model.properties) {

            var property = model.properties[propertyName];

            // If no $reference object is attached, something went wrong when building the registry
            // Give some more detailed informations on this.
            if (!property.$reference || !property.$reference.id) {
                log(' [E] [Graph] "' + modelPageName + '" is malformed, missing its refenence, or ID!');
                log(property);
                continue;
            }

            var fieldName = property.$reference.id;
            var fieldPageName = 'property:' + fieldName;
            var field = fields[fieldName];

            var edgeTemplate =  {
                undirectedId: field.id,
                label: field.title,
                source: modelPageName,
                weight: exports.settings.buildGraphSettings.edgeWeight
            };
            var edge;

            if (field) {

                // Check if Model references to multiple other Models
                var anyArray = false;

                if (field.items && (field.items.anyOf || field.items.allOf)) {
                    if (field.items.anyOf) {
                        anyArray = field.items.anyOf;
                    } else {
                        anyArray = field.items.allOf;
                    }
                }

                // anyOf || allOf
                if (anyArray) {

                    for (var i = 0; i < anyArray.length; i++) {

                        edge = _.cloneDeep(edgeTemplate);

                        var attr = anyArray[i];
                        var target = moboUtil.resolveReference(attr.format).id;

                        edge.target = 'template:' + target;
                        edge.id = modelPageName + '-' + edge.target;

                        if (field.items) {
                            edge.weight = exports.settings.buildGraphSettings.multipleEdgeWeight;
                        }

                        if (!exports.edges[edge.id]) {
                            exports.edges[edge.id] = edge;
                        }
                        exports.connections += 1;
                    }

                } else if (exports.nodes[modelPageName]) {

                    edge = _.cloneDeep(edgeTemplate);

                    // Checks if first char is uppercase. If it is, it references to a Template
                    // If not, it references to an attribute (which is represented as a helper node)
                    // TODO: This does not work if a form does not have a corresponding model with the same name

                    if (!field.target) {
                        log(' [E] [Graph] Field "' + fieldPageName + '" has undefined target!');
                        log(field);
                    } else if (field.target[0] === field.target[0].toUpperCase()) {
                        edge.target = 'template:' + field.target;
                    } else {
                        edge.target = 'property:' + field.target;
                    }

                    edge.id = modelPageName + '-' + edge.target;

                    if (field.items) {
                        edge.weight = exports.settings.buildGraphSettings.multipleEdgeWeight;
                    }

                    if (!exports.edges[edge.id]) {
                        exports.edges[edge.id] = edge;
                    }
                    exports.connections += 1;

                }
            }
        }
    }
};

/**
 * Adds forms to the graph
 *
 * @param forms
 */
exports.analyzeForms = function(forms) {

    for (var formName in forms) {

        var form = forms[formName];
        var id = form.id || formName;
        var formPageName = 'form:' + id;

        if (form.abstract || form.ignore) {
            continue;
        }

        exports.nodes[formPageName] = {
            id: formPageName,
            label: formPageName,
            niceLabel: form.title || formPageName,
            filepath: form.$filepath || '',
            description: form.description || '',
            type: "Form",
            color: exports.getColor("Form"),
            size: exports.settings.buildGraphSettings.formNodeSize,
            connections: 0
        };

        var properties = form.properties;

        if (properties) {

            for (var modelName in properties) {

                var model = properties[modelName];

                if (model) {
                    var modelId = model.id  || modelName;
                    if (model.items) {
                        modelId = model.items.id;
                    }

                    var modelPageName = 'template:' + modelId;

                    if (modelId) {
                        var edgeId = formPageName + '-' + modelName;

                        // Ignore wikitext attributes, since they are directly written into the form template
                        if (!exports.edges[edgeId] && !model.wikitext) {
                            exports.edges[edgeId] = {
                                id: edgeId,
                                undirectedId: 'smwTemplate',
                                label: 'smwTemplate',
                                source: formPageName,
                                target: modelPageName,
                                weight: exports.settings.buildGraphSettings.edgeWeight
                            };
                        }
                        exports.connections += 1;

                    }
                }
            }
        }
    }
};

/**
 * Adds the wikitext mobo_template
 *
 * @param templates
 */
exports.analyzeTemplates = function(templates) {

    // Iterate Models to create Model Nodes
    for (var templateName in templates) {

        var templatePageName = 'template:' + templateName.replace('.wikitext', '');

        if (!exports.nodes[templatePageName]) {
            exports.nodes[templatePageName] = {
                id: templatePageName,
                label: templatePageName,
                niceLabel: templatePageName,
                filepath: '',
                description: '',
                type: "Template",
                color: exports.getColor("Template"),
                size: exports.settings.buildGraphSettings.templateNodeSize,
                connections: 0
            };
        }
    }
};

/**
 * GEFX is the Gephi Graph format.
 * It can be imported and layouted there.
 *
 * @param nodes
 * @param edges
 * @returns {string}
 */
exports.gefxExport = function(nodes, edges) {

    var node, edge, nodeId, edgeId;

    var gefxExport = '\ufeff<?xml version="1.0" encoding="UTF-8"?>\n';
    gefxExport    += '<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2" xmlns:viz="http://www.gexf.net/1.2draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd">\n';
    gefxExport    += '  <meta lastmodifieddate="2014-06-04">\n';
    gefxExport    += '      <creator>Simon Heimler</creator>\n';
    gefxExport    += '      <description>mobo graph visualizaton, generated by https://github.com/Fannon/mobo</description>\n';
    gefxExport    += '  </meta>\n';
    gefxExport    += '  <graph mode="static" defaultedgetype="directed">\n';
    gefxExport    += '      <attributes class="node">\n';
    gefxExport    += '          <attribute id="type" title="Type" type="string"/>\n';
    gefxExport    += '          <attribute id="size" title="Size" type="integer"/>\n';
    gefxExport    += '          <attribute id="nicelabel" title="Nice Label" type="string"/>\n';
    gefxExport    += '          <attribute id="filepath" title="File path" type="string"/>\n';
    gefxExport    += '          <attribute id="description" title="Description" type="string"/>\n';
    gefxExport    += '      </attributes>\n';
    gefxExport    += '      <attributes class="edge">\n';
    gefxExport    += '          <attribute id="undirectedId" title="Undirected ID" type="string"/>\n';
    gefxExport    += '      </attributes>\n';


    //////////////////////////////////////////
    // Export: Nodes                        //
    //////////////////////////////////////////

    gefxExport    += '      <nodes>\n';

    for (nodeId in nodes) {
        node = nodes[nodeId];
        gefxExport    += '          <node id="' + node.id + '" label="' + exports.escape(node.label) + '">\n';
        gefxExport    += '              <attvalues>\n';
        gefxExport    += '                  <attvalue for="type" value="' + node.type + '"/>\n';
        gefxExport    += '                  <attvalue for="size" value="' + node.size + '"/>\n';
        gefxExport    += '                  <attvalue for="nicelabel" value="' + exports.escape(node.niceLabel) + '"/>\n';
        gefxExport    += '                  <attvalue for="filepath" value="' + exports.escape(node.filepath) + '"/>\n';
        gefxExport    += '                  <attvalue for="description" value="' + exports.escape(node.description) + '"/>\n';
        gefxExport    += '              </attvalues>\n';
        gefxExport    += '              <viz:size value="' + node.size + '"></viz:size>\n';
        gefxExport    += '              <viz:color ' + node.color + '></viz:color>\n';
        gefxExport    += '          </node>\n';
    }
    gefxExport    += '      </nodes>\n';

    //////////////////////////////////////////
    // Export: Edges                        //
    //////////////////////////////////////////

    gefxExport    += '      <edges>\n';
    for (edgeId in edges) {
        edge = edges[edgeId];
        gefxExport    += '          <edge id="' + edge.id + '" label="' + edge.label + '" source="' + edge.source + '" target="' + edge.target + '" weight="' + edge.weight + '">\n';
        gefxExport    += '              <attvalues>\n';
        gefxExport    += '                  <attvalue for="undirectedId" value="' + edge.undirectedId + '"/>\n';
        gefxExport    += '              </attvalues>\n';
        gefxExport    += '          </edge>\n';
    }
    gefxExport    += '      </edges>\n';


    //////////////////////////////////////////
    // Export: Footer                       //
    //////////////////////////////////////////

    gefxExport    += '  </graph>\n';
    gefxExport    += '</gexf>\n';

    return gefxExport;
};


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Escapes certain characters for the XML output
 *
 * @param string
 * @returns {string}    escaped string
 */
exports.escape = function(string) {
    if (string) {
        return string.replace('&', '&amp;');
    }
};

/**
 * Colors the node depending on their function
 *
 * @param type
 * @returns {string}
 */
exports.getColor = function(type) {
    if (type === 'Form') {
        return 'r="73" g="199" b="232"';
    } else if (type === 'Model') {
        return 'r="168" g="242" b="53"';
    } else if (type === 'SubObject') {
        return 'r="226" g="242" b="87"';
    } else if (type === 'Template') {
        return 'r="250" g="189" b="43"';
    } else if (type === 'array') {
        return 'r="125" g="235" b="143"';
    } else if (type === 'number') {
        return 'r="209" g="110" b="244"';
    } else if (type.indexOf("string") > -1) {
        return 'r="149" g="91" b="244"';
    } else if (type === 'boolean') {
        return 'r="244" g="91" b="91"';
    } else {
        return 'r="165" g="165" b="165"';
    }
};