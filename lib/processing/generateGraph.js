//////////////////////////////////////////
// Requirements                         //
//////////////////////////////////////////

var fs          = require('fs-extra');
var Promise     = require('bluebird');
var _           = require('lodash');

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
 *      TODO: This file needs to be refactored into several smaller functions
 *      TODO: Graph validation is not as smart as it could be
 *
 * @param settings
 * @param registry
 */
exports.exec = function(settings, registry) {

    exports.settings = settings;
    exports.nodes = {};
    exports.edges = {};


    return new Promise(function (resolve) {

        //////////////////////////////////////////
        // Variables                            //
        //////////////////////////////////////////

        var escape      = exports.escape;

        var field;
        var model;

        var node;
        var edge;
        var edgeId;

        var modelPageName;
        var targetPageName;
        var fieldPageName;


        //////////////////////////////////////////
        // Iterate Fields                       //
        //////////////////////////////////////////

        exports.analyzeFields(registry.expandedField);

        //////////////////////////////////////////
        // Iterate Models                       //
        //////////////////////////////////////////

        // Iterate Models to create Model Nodes
        for (var modelName in registry.expandedModel) {

            model = registry.expandedModel[modelName];
            modelPageName = 'template:' + modelName;

            exports.nodes[modelPageName.toLowerCase()] = {
                id: modelPageName,
                label: modelPageName,
                niceLabel: model.title || modelPageName,
                description: model.description || '',
                type: "Model",
                size: settings.buildGraphSettings.modelNodeSize
            };

            if (model.smw_subobject) {
                exports.nodes[modelPageName.toLowerCase()].type = 'SubObject';
            }


        }

        // Iterate Models to generate edges, depending on the fields used
        for (modelName in registry.expandedModel) {

            model = registry.expandedModel[modelName];
            modelPageName = 'template:' + modelName;

            for (var propertyName in model.properties) {

                var property = model.properties[propertyName];
                var fieldName = property.$reference.id;
                fieldPageName = 'property:' + fieldName;
                field = registry.expandedField[fieldName];

                if (!field) {
                    // Field missing completely
                    log(' [W] [Graph] Model "' + modelPageName + '" is missing its field "' + fieldPageName + '"!');
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
                            var target = moboUtil.resolveReference(attr.format).id;

                            targetPageName = 'template:' + target;
                            edgeId = modelPageName + '-' + targetPageName;

                            if (!exports.edges[edgeId.toLowerCase()]) {
                                exports.edges[edgeId.toLowerCase()] = {
                                    id: edgeId,
                                    undirectedId: field.id,
                                    label: field.title,
                                    source: modelPageName,
                                    target: targetPageName,
                                    weight: settings.buildGraphSettings.edgeWeight
                                };

                                if (field.items) {
                                    exports.edges[edgeId.toLowerCase()].weight = settings.buildGraphSettings.multipleEdgeWeight;
                                }

                            }
                        }

                    } else if (exports.nodes[modelPageName.toLowerCase()]) {

                        // Checks if first char is uppercase. If it is, it references to a Template
                        // If not, it references to an attribute (which is represented as a helper node)
                        if (field.target[0] === field.target[0].toUpperCase()) {
                            targetPageName = 'template:' + field.target;
                        } else {
                            targetPageName = 'property:' + field.target;
                        }

                        edgeId = modelPageName + '-' + targetPageName;

                        if (!exports.edges[edgeId.toLowerCase()]) {
                            exports.edges[edgeId.toLowerCase()] = {
                                id: edgeId,
                                undirectedId: field.id,
                                label: field.title,
                                source: modelPageName,
                                target: targetPageName,
                                weight: settings.buildGraphSettings.edgeWeight
                            };

                            if (field.items) {
                                exports.edges[edgeId.toLowerCase()].weight = settings.buildGraphSettings.multipleEdgeWeight;
                            }

                        }

                    } else {
                        log(' [W] [Graph] Field "' + fieldPageName + '" has missing node "' + modelPageName + '"!');
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

            var templatePageName = 'template:' + templateName.replace('.wikitext', '');

            if (!exports.nodes[templatePageName.toLowerCase()]) {
                exports.nodes[templatePageName.toLowerCase()] = {
                    id: templatePageName,
                    label: templatePageName,
                    niceLabel: templatePageName,
                    description: '',
                    type: "Template",
                    size: settings.buildGraphSettings.templateNodeSize
                };
            }

        }

        //////////////////////////////////////////
        // Iterate Forms                        //
        //////////////////////////////////////////

        for (var formName in registry.expandedForm) {

            var form = registry.expandedForm[formName];
            var formPageName = 'form:' + formName;

            exports.nodes[formPageName.toLowerCase()] = {
                id: formPageName,
                label: formPageName,
                niceLabel: form.title || formPageName,
                description: form.description || '',
                type: "Form",
                size: settings.buildGraphSettings.formNodeSize
            };

            var models = form.properties || form.items.properties;

            if (models) {

                for (modelName in models) {

                    model = models[modelName];

                    if (model) {
                        var modelId = model.id || modelName;

                        modelPageName = 'template:' + modelId;

                        if (modelId) {
                            edgeId = formPageName + '-' + modelName;

                            // Ignore wikitext attributes, since they are directly written into the form template
                            if (!exports.edges[edgeId.toLowerCase()] && !model.wikitext) {
                                exports.edges[edgeId.toLowerCase()] = {
                                    id: edgeId,
                                    undirectedId: 'smwTemplate',
                                    label: 'smwTemplate',
                                    source: formPageName,
                                    target: modelPageName,
                                    weight: settings.buildGraphSettings.edgeWeight
                                };
                            }
                        } else {
                            log(' [W] [Graph] Form "' + formPageName + '" has missing template "' + modelPageName + '"!');
                            if (settings.verbose) {log(form);}
                        }
                    } else {
                        log(' [W] [Graph] Form "' + formPageName + '" has missing model "' + modelName + '"!');
                        if (settings.verbose) {log(form);}
                    }
                }

            } else {
                log(' [W] [Graph] Form "' + formPageName + '" has no properties!');
                if (settings.verbose) {log(form);}
            }

        }

        //////////////////////////////////////////
        // More Validation                      //
        //////////////////////////////////////////

        for (var nodeName in exports.nodes) {

            node = exports.nodes[nodeName.toLowerCase()];

            // Apply Color to Node
            node.color = exports.getColor(node.type);

            var hasConnections = exports.checkForConnections(node, exports.edges);

            if (!hasConnections) {

                if (nodeName.indexOf("template:") > -1) {
                    if (settings.verbose) {
                        log(' [i] Template-Node "' + nodeName + '" has no connections!');
                        log(node);
                    }
                } else {
                    log(' [W] [Graph] Node "' + nodeName + '" has no connections!');
                    if (settings.verbose) {log(node);}
                }

            }

        }

        // Checks if the edges source and target nodes exist
        for (var edgeName in exports.edges) {
            edge = exports.edges[edgeName.toLowerCase()];

            if (!exports.nodes[edge.source.toLowerCase()]) {
                log(' [W] [Graph] Edge "' + edgeName + '" is missing its source node "' + edge.source + '"');
            }

            if (!exports.nodes[edge.target.toLowerCase()]) {
                log(' [W] [Graph] Edge "' + edgeName + '" is missing its target node "' + edge.target + '"');
            }
        }

        //////////////////////////////////////////
        // Export: Header                       //
        //////////////////////////////////////////

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
        gefxExport    += '          <attribute id="description" title="Description" type="string"/>\n';
        gefxExport    += '      </attributes>\n';
        gefxExport    += '      <attributes class="edge">\n';
        gefxExport    += '          <attribute id="undirectedId" title="Undirected ID" type="string"/>\n';
        gefxExport    += '      </attributes>\n';


        //////////////////////////////////////////
        // Export: Nodes                        //
        //////////////////////////////////////////

        gefxExport    += '      <nodes>\n';

        for (var nodeId in exports.nodes) {
            node = exports.nodes[nodeId];
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
        for (edgeId in exports.edges) {
            edge = exports.edges[edgeId];
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
            nodes: exports.nodes,
            edges: exports.edges
        };

        fs.outputFile(settings.processedModelDir + '_graph.gexf', gefxExport);
        if (settings.debug) {
            fs.outputFile(settings.processedModelDir + '_graph.json', JSON.stringify(jsonGraph, false, 4));
        }


        var nodeCounter = _.size(exports.nodes);
        var edgeCounter = _.size(exports.edges);

        log('-------------------------------------------------------------------------');
        log(' ' + nodeCounter + ' Nodes | ' + edgeCounter + ' Edges');
        log('-------------------------------------------------------------------------');

        resolve(registry);
    });

};

exports.analyzeFields = function(fields) {
    for (var fieldName in fields) {

        // Create DataType Nodes
        var field = fields[fieldName];
        var fieldPageName = 'property:' + fieldName;

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
            log(' [W] [Graph] ' + fieldPageName + ':: No Field Type!');
            if (exports.settings.verbose) {
                log(field);
            }
        }

        if (format && format.charAt(0) === '/') {

            // Calculate and write field target
            field.target = moboUtil.resolveReference(format, fieldPageName).id;

        } else if (field.items && (field.items.anyOf || field.items.allOf)) {

            // Do not create a node for this field, since it is only referencing to other nodes

        } else {

            var typeName = type;

            if (format) {
                typeName += '-' + format;
            }

            if (!field.title) {
                log(' [W] [Graph] Field ' + fieldName + ' has no title!');
            }

            exports.nodes[fieldPageName.toLowerCase()] = {
                id: fieldPageName,
                label: fieldPageName,
                niceLabel: field.title || fieldPageName,
                description: field.description || '',
                type: typeName,
                size: exports.settings.buildGraphSettings.dataTypeNodeSize
            };

            field.target = fieldName;

        }
    }
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
