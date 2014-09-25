var cbm = {};

cbm.wikiUrl = 'http://semwiki-exp01.multimedia.hs-augsburg.de/exp-wiki/index.php/';

//////////////////////////////////////////
// Graph Visualisation                  //
//////////////////////////////////////////

cbm.prepareGraph = function() {
    // Add a method to the graph model that returns an
    // object with every neighbors of a node inside:
    sigma.classes.graph.addMethod('neighbors', function(nodeId) {
        var k,
            neighbors = {},
            index = this.allNeighborsIndex[nodeId] || {};

        for (k in index)
            neighbors[k] = this.nodesIndex[k];

        return neighbors;
    });
};

cbm.drawGraph = function() {

    var edgeColor = 'rgba(255, 255, 255, 0.16)';
    var edgeMutedColor = 'rgba(255, 255, 255, 0.05)';
    var nodeMutedColor = '#333';

    $('#graph').html('');

    sigma.parsers.gexf('_processed_model/_graph_layouted.gexf', {

            renderers: [
                {
                  container: document.getElementById('graph'),
                  type: 'canvas' // sigma.renderers.canvas works as well
                }
            ],

            settings: {

                defaultNodeColor: '#CCC',
                defaultNodeBorderColor: '#FFF',

                defaultLabelColor: '#fff',
                defaultLabelBGColor: '#fff',
                defaultLabelHoverColor: '#000',

                borderSize: 2,
                defaultLabelSize: 11,

                minEdgeSize: 0.7,
                maxEdgeSize: 0.7,
                edgeColor: "default",
                edgeLabels: true,

                minNodeSize: 2,
                maxNodeSize: 8,

                enableHovering: true,

                labelThreshold: 8,

                doubleClickZoomingRatio: 4,
                zoomMin: 0.02,
                zoomMax: 2

            }
        },
        function(s) {

            var colorLegend = {};

            window.s = s;

            s.graph.nodes().forEach(function(n) {
                n.originalColor = n.color;
                colorLegend[n.color] = n.attributes.type;
            });

            s.graph.edges().forEach(function(e) {
                e.type = ['arrow'];
                e.color = edgeColor;
                e.originalColor = e.color;
            });

            // Render Color/Type Legend
            var colorLegendHtml = '';
            for (var color in colorLegend) {
                var type = colorLegend[color];
                colorLegendHtml += '<span style="color: ' + color + '">' + type + '</span> | ';
            }
            colorLegendHtml = colorLegendHtml.slice(0, - 2);
            $('#color-legend').html(colorLegendHtml);


            s.refresh();

            s.bind('clickNode', function(e) {

                var nodeId = e.data.node.id,
                    toKeep = s.graph.neighbors(nodeId);
                toKeep[nodeId] = e.data.node;

                console.log(e.data.node);

                // Print Node Infos to Detail Div
                var html = '';
                html += '<div class="node-title" style="border-color: ' + e.data.node.viz.color + '">' + e.data.node.label + '</div>';

                html += '<strong>Link to Wiki</strong>: <a href="' + cbm.wikiUrl + e.data.node.label + '" target="_blank">' + e.data.node.label + '</a><br>';

                if (e.data.node.attributes['nice label']) {
                    html += '<strong>Label</strong>: ' + e.data.node.attributes['nice label'] + '<br>';
                }

                if (e.data.node.attributes.type) {
                    html += '<strong>Type</strong>: ' + e.data.node.attributes.type + '<br>';
                }

                if (e.data.node.attributes.description) {
                    html += '<strong>Description</strong>: ' + e.data.node.attributes.description + '<br>';
                }

                html += '<hr>';

                // List Connections
                s.graph.nodes().forEach(function(n) {
                    if (toKeep[n.id]) {
                        n.color = n.originalColor;
                    } else {
                        n.color = nodeMutedColor;
                    }
                });

                // Color Edges
                html += '<div class="edges-title"><strong>Connections</strong>:</div>';
                html += '<table class="connections-table">';

                var nodes = s.graph.read('').nodesIndex;

                s.graph.edges().forEach(function(e) {

                    if (toKeep[e.source] && toKeep[e.target] ) {

                        var nt = nodes[e.target];
                        var ns = nodes[e.source];

                        if (nodeId === nt.label || nodeId === ns.label) {
                            e.color = e.nodeColor;
                            e.color = nodes[e.source].color;

                            html += '<tr>';

                            if (nodeId === ns.label) {
                                html += '<td style="color: #EEE; border-bottom: 2px solid ' + ns.color + ';" title="' + ns.attributes.type + '">' + ns.label + '</td>';
                            } else {
                                html += '<td style="border-bottom: 1px solid ' + ns.color + ';" title="' + ns.attributes.type + '">' + ns.label + '</td>';
                            }

                            html += '<td style="text-align: center">' + e.attributes['undirected id'] + '</td>';

                            if (nodeId === nt.label) {
                                html += '<td style="color: #EEE; border-bottom: 2px solid ' + nt.color + ';" title="' + nt.attributes.type + '">' + nt.label + '</td>';
                            } else {
                                html += '<td style="border-bottom: 1px solid ' + nt.color + ';" title="' + nt.attributes.type + '">' + nt.label + '</td>';
                            }

                            html += '</tr>';
                        } else {
                            e.color = edgeMutedColor;
                        }



                    } else {
                        e.color = edgeMutedColor;
                    }
                });
                html += '</table>';


                $('#node-details').html(html);

                s.refresh();
            });

            // If stage is clicked: Undo selection and coloring
            s.bind('clickStage', function(e) {
                s.graph.nodes().forEach(function(n) {
                    n.color = n.originalColor;
                });

                s.graph.edges().forEach(function(e) {
                    e.color = e.originalColor;
                });

                $('#node-details').html('');

                s.refresh();
            });
        }
    );
};
