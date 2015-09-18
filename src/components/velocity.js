(function () {
    'use strict';

    // Represents an entity's velocity in 2D space.
    var Velocity = function (params) {
        this.$id = 'velocity';
        this.$deps = ['position'];

        this.xspeed = params.xspeed;
        this.yspeed = params.yspeed;
    };

    module.exports = Velocity;
} ());
