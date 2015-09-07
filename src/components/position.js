(function () {
    'use strict';

    // Represents an entity's position in 2D space.
    // PARAMS:
    //      x - x Cartesian coordinate.
    //      y - y Cartesian coordinate.
    var Position = function (params) {
        this.$id = 'position';
        this.$deps = [];

        this.x = params.x;
        this.y = params.y;
    };

    module.exports = Position;
} ());
