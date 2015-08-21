(function () {
    'use strict';

    var defaultParams = require('../utils').defaultParams;

    // Represents the collision boundaries of an entity.
    // PARAMS:
    //      width - width of collision hitbox.
    //      height - height of collision hitbox.
    var Collision = function (params) {
        params = defaultParams({
            anchor: {
                x: 0.5,
                y: 0.5
            }
        }, params);

        this.id = 'collision';
        this.deps = ['position'];

        this.width = params.width;
        this.height = params.height;
        this.anchor = params.anchor;
    };

    module.exports = Collision;
} ());
