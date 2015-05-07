(function () {
    'use strict';

    // Represents the collision boundaries of an entity.
    // PARAMS:
    //      width - width of collision hitbox.
    //      height - height of collision hitbox.
    var Collision = function (params) {
        this.id = 'collision';
        this.deps = ['position'];

        this.width = params.width;
        this.height = params.height;
    };

    module.exports = Collision;
} ());
