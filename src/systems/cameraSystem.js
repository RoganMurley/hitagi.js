(function () {
    'use strict';

    var _ = require('lodash');

    var CameraSystem = function (renderSystem, width, height) {
        var that = this;

        this.update = function (entity) {
            if (entity.has('camera')) {
                entity.c.camera.x = entity.c.position.x;
                entity.c.camera.y = entity.c.position.y;
            }
        };
    };

    module.exports = CameraSystem;
} ());
