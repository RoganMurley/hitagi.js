(function () {
    'use strict';

    // Represents an entity's position in 2D space.
    var Position = function (params) {
        this.$id = 'position';
        this.$deps = [];

        this.x = params.x;
        this.y = params.y;
    };

    module.exports = Position;
} ());
