(function () {
    'use strict';

    var defaultParams = require('../utils').defaultParams;

    var Body = function (params) {
        params = defaultParams({
            angle: 0,
            density: 0.001,
            force: {
                x: 0,
                y: 0
            },
            static: false,
            velocity: {
                xspeed: 0,
                yspeed: 0
            }
        }, params);


        this.id = 'body';
        this.deps = [];

        this.angle = params.angle;
        this.density = params.density;
        this.force = params.force;
        this.height = params.height;
        this.width = params.width;
        this.static = params.static;
        this.velocity = params.velocity;
        this.x = params.x;
        this.y = params.y;
    };

    module.exports = Body;
} ());
