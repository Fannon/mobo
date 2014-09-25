;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.labels');

  /**
   * This label renderer will just display the label on the right of the node.
   *
   * @param  {object}                   node     The node object.
   * @param  {CanvasRenderingContext2D} context  The canvas context.
   * @param  {configurable}             settings The settings function.
   */
  sigma.canvas.labels.def = function(node, context, settings) {
      var x,
          y,
          w,
          h,
          e,
          fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'],
          fontSize = (settings('labelSize') === 'fixed') ?
              settings('defaultLabelSize') :
              settings('labelSizeRatio') * size;

    if (size < settings('labelThreshold'))
      return;

    if (typeof node.label !== 'string')
      return;


      // Label background:
      context.font = (fontStyle ? fontStyle + ' ' : '') +
          fontSize + 'px ' + (settings('hoverFont') || settings('font'));

      context.beginPath();
      context.fillStyle = 'rgba(0, 0, 0, 0.9)';
//      context.fillStyle = 'red';

      if (typeof node.label === 'string') {
          x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
          y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
          w = Math.round(
                  context.measureText(node.label).width + fontSize / 2 + size + 7
          );
          h = Math.round(fontSize + 4);
          e = Math.round(fontSize / 2 + 2);

          context.moveTo(x, y + e);
          context.arcTo(x, y, x + e, y, e);
          context.lineTo(x + w, y);
          context.lineTo(x + w, y + h);
          context.lineTo(x + e, y + h);
          context.arcTo(x, y + h, x, y + h - e, e);
          context.lineTo(x, y + e);

          context.closePath();
          context.fill();
      }

      // Node:
      var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
      nodeRenderer(node, context, settings);

      // Display the label:
      if (typeof node.label === 'string') {
          context.fillStyle = '#FFF';

          context.fillText(
              node.label,
              Math.round(node[prefix + 'x'] + size + 3),
              Math.round(node[prefix + 'y'] + fontSize / 3)
          );
      }
  };
}).call(this);
