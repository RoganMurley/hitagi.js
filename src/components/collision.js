(function () {
    'use strict';

    var _ = require('lodash');

    // Represents the collision boundaries of an entity.
    var Collision = function (params) {
        params = _.extend({
            anchor: {
                x: 0.5,
                y: 0.5
            }
        }, params);

        this.$id = 'collision';
        this.$deps = ['position'];

        this.width = params.width;
        this.height = params.height;
        this.anchor = params.anchor;
    };

    module.exports = Collision;
} ());
