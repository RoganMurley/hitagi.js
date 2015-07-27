(function () {
    'use strict';

    var utils = require('../utils.js');

    var VelocitySystem = function () {

        this.update = {
            velocity: function (entity, dt) {
                entity.c.position.x += utils.delta(entity.c.velocity.xspeed, dt);
                entity.c.position.y += utils.delta(entity.c.velocity.yspeed, dt);
            }
        };
    };

    module.exports = VelocitySystem;
} ());
