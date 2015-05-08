(function () {
    'use strict';

    // Represents that a 2D camera is following the entity.
    // PARAMS:
    //      x - x position of camera viewport.
    //      y - y position of camera viewpoint.
    //      speed - speed the camera moves at.
    //      xShake - magnitude of horizontal camera shaking.
    //      yShake - magnitude of vertical camera shaking.
    //      shakeDecay - rate at which shake decays.
    var Camera = function (params) {
        this.id = 'camera';
        this.deps = ['position'];

        this.speed = params.speed;
    };

    module.exports = Camera;
} ());
