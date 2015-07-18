(function () {
    'use strict';

    // Represents an entity's rectangle primitive.
    // PARAMS:
    //      width - rectangle width.
    //      height - rectangle height;
    var Rectangle = function (params) {
        this.id = 'rectangle';
        this.deps = ['position'];

        this.color = params.color;
        this.width = params.width;
        this.height = params.height;
    };

    module.exports = Rectangle;
} ());
