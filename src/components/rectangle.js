(function () {
    'use strict';

    // Represents an entity's rectangle primitive.
    // PARAMS:
    //      x1 - top-left x co-ordinate relative to entity position.
    //      y1 - top-left y co-ordinate relative to entity position.
    //      x2 - bottom-right x co-ordinate relative to entity position.
    //      y2 - bottom-right y co-ordinate relative to entity position.
    var Rectangle = function (params) {
        this.id = 'rectangle';
        this.deps = ['position'];

        this.color = params.color;
        this.x1 = params.x1;
        this.y1 = params.y1;
        this.x2 = params.x2;
        this.y2 = params.y2;
        this.offsetX = params.offsetX;
        this.offsetY = params.offsetY;
    };

    module.exports = Rectangle;
} ());
