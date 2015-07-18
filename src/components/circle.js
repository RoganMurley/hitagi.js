(function () {
    'use strict';

    // Represents an entity's circle primitive.
    // PARAMS:
    //      radius - circle radius
    var Circle = function (params) {
        this.id = 'circle';
        this.deps = ['position'];

        this.color = params.color;
        this.radius = params.radius;
    };

    module.exports = Circle;
} ());
