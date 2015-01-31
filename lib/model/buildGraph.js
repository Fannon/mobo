//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs     = require('fs-extra');

var logger = require('../logger.js');
var log    = logger.log;

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

    //////////////////////////////////////////
    // Variables                            //
    //////////////////////////////////////////

    var nodes       = {};
    var edges       = {};

    var nodeCounter = 0;
    var edgeCounter = 0;

    var escape      = exports.escape;

    var field;
    var model;

    var node;
    var edge;
    var edgeId;

    var modelSiteName;
    var targetSiteName;
    var fieldSiteName;


    //////////////////////////////////////////
    // Iterate Fields                       //
    //////////////////////////////////////////

    for (var fieldName in registry.field) {

        // Create DataType Nodes
        field = registry.field[fieldName];
        fieldSiteName = 'property:' + fieldName;

        var type, format;

        if (field.items) {
            field.multiple = true;
        }

        if (field.type) {
            type = field.type;
        } else if (field.items && field.items.type) {
            type = field.items.type;
        } else {
            type = false;
        }

        if (field.format) {
            format = field.format;
        } else if (field.items && field.items.format) {
            format = field.items.format;

        } else {
            format = false;
        }

        // Validation
        if (!type) {
            log('> [WARNING] [Graph Structure] ' + fieldSiteName + ':: No Field Type!');
            if (settings.verbose) {
                log(field);
            }
        }

        if (format && format.charAt(0) === '/') {

            // Calculate and write field target
            field.target = exports.getIdByRef(format);

        } else if (field.items && (field.items.anyOf || field.items.allOf)) {

            // Do not create a node for this field, since it is only referencing to other nodes

        } else {

            var typeName = type;

            if (format) {
                typeName += '-' + format;
            }

            if (!field.title) {
                log('> [WARNING] [Graph Structure] Field ' + fieldName + ' has no title!');
            }

            nodes[fieldSiteName.toLowerCase()] = {
                id: fieldSiteName,
                label: fieldSiteName,
                niceLabel: field.title || fieldSiteName,
                description: field.description || '',
                type: typeName,
                size: settings.buildGraphSettings.dataTypeNodeSize
            };

            nodeCounter += 1;

            field.target = fieldName;

        }
    }

    //////////////////////////////////////////
    // Iterate Models                       //
    //////////////////////////////////////////

    // Iterate Models to create Model Nodes
    for (var modelName in registry.expandedModel) {

        model = registry.expandedModel[modelName];
        modelSiteName = 'template:' + modelName;

        nodes[modelSiteName.toLowerCase()] = {
            id: modelSiteName,
            label: modelSiteName,
            niceLabel: model.title || modelSiteName,
            description: model.description || '',
            type: "Model",
            size: settings.buildGraphSettings.modelNodeSize
        };

        if (model.smw_subobject) {
            nodes[modelSiteName.toLowerCase()].type = 'SubObject';
        }

        nodeCounter += 1;

    }

    // Iterate Models to generate edges, depending on the fields used
    for (modelName in registry.expandedModel) {

        model = registry.expandedModel[modelName];
        modelSiteName = 'template:' + modelName;

        for (var propertyName in model.properties) {

            var property = model.properties[propertyName];
            fieldName = exports.getIdByRef(property.$reference);
            fieldSiteName = 'property:' + fieldName;
            field = registry.field[fieldName];

            if (!field) {
                // Field missing completely
                log('> [WARNING] [Graph Structure] Model "' + modelSiteName + '" is missing its field "' + fieldSiteName + '"!');
                if (settings.verbose) {log(model);}

            } else {

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

                        var attr = anyArray[i];
                        var target = exports.getIdByRef(attr.format);
                        targetSiteName = 'template:' + target;
                        edgeId = modelSiteName + '-' + targetSiteName;

                        if (!edges[edgeId.toLowerCase()]) {
                            edges[edgeId.toLowerCase()] = {
                                id: edgeId,
                                undirectedId: field.id,
                                label: field.title,
                                source: modelSiteName,
                                target: targetSiteName,
                                weight: settings.buildGraphSettings.edgeWeight
                            };

                            if (field.items) {
                                edges[edgeId.toLowerCase()].weight = settings.buildGraphSettings.multipleEdgeWeight;
                            }

                            edgeCounter += 1;
                        }
                    }

                } else if (nodes[modelSiteName.toLowerCase()]) {

                    // Checks if first char is uppercase. If it is, it references to a Template
                    // If not, it references to an attribute (which is represented as a helper node)
                    if (field.target[0] === field.target[0].toUpperCase()) {
                        targetSiteName = 'template:' + field.target;
                    } else {
                        targetSiteName = 'property:' + field.target;
                    }

                    edgeId = modelSiteName + '-' + targetSiteName;

                    if (!edges[edgeId.toLowerCase()]) {
                        edges[edgeId.toLowerCase()] = {
                            id: edgeId,
                            undirectedId: field.id,
                            label: field.title,
                            source: modelSiteName,
                            target: targetSiteName,
                            weight: settings.buildGraphSettings.edgeWeight
                        };

                        if (field.items) {
                            edges[edgeId.toLowerCase()].weight = settings.buildGraphSettings.multipleEdgeWeight;
                        }

                        edgeCounter += 1;
                    }

                } else {
                    log('> [WARNING] [Graph Structure] Field "' + fieldSiteName + '" has missing node "' + modelSiteName + '"!');
                    if (settings.verbose) {log(field);}
                }
            }
        }
    }

    //////////////////////////////////////////
    // Iterate Custom Templates             //
    //////////////////////////////////////////

    // Iterate Models to create Model Nodes
    for (var templateName in registry.smw_template) {

        var templateSiteName = 'template:' + templateName.replace('.wikitext', '');

        if (!nodes[templateSiteName.toLowerCase()]) {
            nodes[templateSiteName.toLowerCase()] = {
                id: templateSiteName,
                label: templateSiteName,
                niceLabel: templateSiteName,
                description: '',
                type: "Template",
                size: settings.buildGraphSettings.templateNodeSize
            };
            nodeCounter += 1;
        }

    }

    //////////////////////////////////////////
    // Iterate Forms                        //
    //////////////////////////////////////////

    for (var formName in registry.expandedForm) {

        var form = registry.expandedForm[formName];
        var formSiteName = 'form:' + formName;

        nodes[formSiteName.toLowerCase()] = {
            id: formSiteName,
            label: formSiteName,
            niceLabel: form.title || formSiteName,
            description: form.description || '',
            type: "Form",
            size: settings.buildGraphSettings.formNodeSize
        };

        nodeCounter += 1;

        var models = form.properties || form.items.properties;

        if (models) {

            for (modelName in models) {

                model = models[modelName];

                if (model) {
                    var modelId = model.id || modelName;

                    modelSiteName = 'template:' + modelId;

                    if (modelId) {
                        edgeId = formSiteName + '-' + modelName;

                        // Ignore wikitext attributes, since they are directly written into the form template
                        if (!edges[edgeId.toLowerCase()] && !model.wikitext) {
                            edges[edgeId.toLowerCase()] = {
                                id: edgeId,
                                undirectedId: 'smwTemplate',
                                label: 'smwTemplate',
                                source: formSiteName,
                                target: modelSiteName,
                                weight: settings.buildGraphSettings.edgeWeight
                            };
                            edgeCounter += 1;
                        }
                    } else {
                        log('> [WARNING] [Graph Structure] Form "' + formSiteName + '" has missing template "' + modelSiteName + '"!');
                        if (settings.verbose) {log(form);}
                    }
                } else {
                    log('> [WARNING] [Graph Structure] Form "' + formSiteName + '" has missing model "' + modelName + '"!');
                    if (settings.verbose) {log(form);}
                }
            }

        } else {
            log('> [WARNING] [Graph Structure] Form "' + formSiteName + '" has no properties!');
            if (settings.verbose) {log(form);}
        }

    }

    //////////////////////////////////////////
    // More Validation                      //
    //////////////////////////////////////////

    for (var nodeName in nodes) {

        node = nodes[nodeName.toLowerCase()];

        // Apply Color to Node
        node.color = exports.getColor(node.type);

        var hasConnections = exports.checkForConnections(node, edges);

        if (!hasConnections) {

            if (nodeName.indexOf("template:") > -1) {
                if (settings.verbose) {
                    log('> [NOTICE] Template-Node "' + nodeName + '" has no connections!');
                    log(node);
                }
            } else {
                log('> [WARNING] [Graph Structure] Node "' + nodeName + '" has no connections!');
                if (settings.verbose) {log(node);}
            }

        }

    }

    // Checks if the edges source and target nodes exist
    for (var edgeName in edges) {
        edge = edges[edgeName.toLowerCase()];

        if (!nodes[edge.source.toLowerCase()]) {
            log('> [WARNING] [Graph Structure] Edge "' + edgeName + '" is missing its source node "' + edge.source + '"');
        }

        if (!nodes[edge.target.toLowerCase()]) {
            log('> [WARNING] [Graph Structure] Edge "' + edgeName + '" is missing its target node "' + edge.target + '"');
        }
    }

    //////////////////////////////////////////
    // Export: Header                       //
    //////////////////////////////////////////

    var gefxExport = '\ufeff<?xml version="1.0" encoding="UTF-8"?>\n';
    gefxExport    += '<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2" xmlns:viz="http://www.gexf.net/1.2draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd">\n';
    gefxExport    += '  <meta lastmodifieddate="2014-06-04">\n';
    gefxExport    += '      <creator>Simon Heimler</creator>\n';
    gefxExport    += '      <description>CB Model Graph</description>\n';
    gefxExport    += '  </meta>\n';
    gefxExport    += '  <graph mode="static" defaultedgetype="directed">\n';
    gefxExport    += '      <attributes class="node">\n';
    gefxExport    += '          <attribute id="type" title="Type" type="string"/>\n';
    gefxExport    += '          <attribute id="size" title="Size" type="integer"/>\n';
    gefxExport    += '          <attribute id="nicelabel" title="Nice Label" type="string"/>\n';
    gefxExport    += '          <attribute id="description" title="Description" type="string"/>\n';
    gefxExport    += '      </attributes>\n';
    gefxExport    += '      <attributes class="edge">\n';
    gefxExport    += '          <attribute id="undirectedId" title="Undirected ID" type="string"/>\n';
    gefxExport    += '      </attributes>\n';


    //////////////////////////////////////////
    // Export: Nodes                        //
    //////////////////////////////////////////

    gefxExport    += '      <nodes>\n';

    for (var nodeId in nodes) {
        node = nodes[nodeId];
        gefxExport    += '          <node id="' + node.id + '" label="' + escape(node.label) + '">\n';
        gefxExport    += '              <attvalues>\n';
        gefxExport    += '                  <attvalue for="type" value="' + node.type + '"/>\n';
        gefxExport    += '                  <attvalue for="size" value="' + node.size + '"/>\n';
        gefxExport    += '                  <attvalue for="nicelabel" value="' + escape(node.niceLabel) + '"/>\n';
        gefxExport    += '                  <attvalue for="description" value="' +escape( node.description) + '"/>\n';
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


    //////////////////////////////////////////
    // JSON Graph Export                    //
    //////////////////////////////////////////

    var jsonGraph = {
        nodes: nodes,
        edges: edges
    };

    fs.outputFile(settings.processedModelDir + '_graph.gexf', gefxExport);
    fs.outputFile(settings.processedModelDir + '_graph.json', JSON.stringify(jsonGraph, false, 4));

    log('> ' + nodeCounter + ' Nodes | ' + edgeCounter + ' Edges');
    log('-------------------------------------------------------------------------');

};

//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

/**
 * Takes an model/field/form $extend URL and returns the name of the file without extension
 *
 * @param url
 * @returns {string}
 */
exports.getIdByRef = function(url) {
    var ref = url.split('/');
    return ref[2].replace('.json', '');
};

/**
 * Escapes certain characters for the XML output
 *
 * @param string
 * @returns {string}    escaped string
 */
exports.escape = function(string) {

    if (string) {
        string = string.replace('&', '&amp;');

        return string;
    } else {
        return false;
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

/**
 * Checks if a node has Connections to other nodes
 *
 * If not, it is an orphan and should be adressed
 *
 * @param node
 * @returns {boolean}
 */
exports.checkForConnections = function(node, edges) {

    for (var edgeName in edges) {
        var edge = edges[edgeName.toLowerCase()];

        if (edge.source === node.id || edge.target === node.id) {
            return true;
        }
    }

    return false;
};
