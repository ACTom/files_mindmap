define(function(require, exports, module) {
    var kity = require('../core/kity');
    var Layout = require('../core/layout');

    [-1, 1].forEach(registerLayoutForDir);

    function registerLayoutForDir(dir) {
        var name = 'filetree-' + (dir > 0 ? 'down' : 'up');

        Layout.register(name, kity.createClass({
            base: Layout,

            doLayout: function(parent, children, round) {
                var pBox = parent.getContentBox();
                var indent = 20;

                parent.setVertexOut(new kity.Point(pBox.left + indent, dir > 0 ? pBox.bottom : pBox.top));
                parent.setLayoutVectorOut(new kity.Vector(0, dir));

                if (!children.length) return;

                children.forEach(function(child) {
                    var cbox = child.getContentBox();
                    child.setLayoutTransform(new kity.Matrix());

                    child.setVertexIn(new kity.Point(cbox.left, cbox.cy));
                    child.setLayoutVectorIn(new kity.Vector(1, 0));
                });

                this.align(children, 'left');
                this.stack(children, 'y');

                var xAdjust = 0;
                xAdjust += pBox.left;
                xAdjust += indent;
                xAdjust += children[0].getStyle('margin-left');

                var yAdjust = 0;

                if (dir > 0) {
                    yAdjust += pBox.bottom;
                    yAdjust += parent.getStyle('margin-bottom');
                    yAdjust += children[0].getStyle('margin-top');
                } else {
                    yAdjust -= this.getTreeBox(children).bottom;
                    yAdjust += pBox.top;
                    yAdjust -= parent.getStyle('margin-top');
                    yAdjust -= children[0].getStyle('margin-bottom');
                }

                this.move(children, xAdjust, yAdjust);

            },

            getOrderHint: function(node) {
                var hint = [];
                var box = node.getLayoutBox();
                var offset = node.getLevel() > 1 ? 3 : 5;

                hint.push({
                    type: 'up',
                    node: node,
                    area: new kity.Box({
                        x: box.x,
                        y: box.top - node.getStyle('margin-top') - offset,
                        width: box.width,
                        height: node.getStyle('margin-top')
                    }),
                    path: ['M', box.x, box.top - offset, 'L', box.right, box.top - offset]
                });

                hint.push({
                    type: 'down',
                    node: node,
                    area: new kity.Box({
                        x: box.x,
                        y: box.bottom + offset,
                        width: box.width,
                        height: node.getStyle('margin-bottom')
                    }),
                    path: ['M', box.x, box.bottom + offset, 'L', box.right, box.bottom + offset]
                });
                return hint;
            }
        }));

    }

});