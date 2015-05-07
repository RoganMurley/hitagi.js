(function () {
    'use strict';

    // Represents an entity's velocity in 2D space.
    // PARAMS:
    //      xspeed - delta in x direction.
    //      yspeed - delta in y direction.
    var Velocity = function (params) {
        this.id = 'velocity';
        this.deps = ['position'];

        this.xspeed = params.xspeed;
        this.yspeed = params.yspeed;
    };

    module.exports = Velocity;
} ());
