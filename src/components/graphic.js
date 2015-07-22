(function () {
    'use strict';

    var _ = require('lodash');

    // Represents a graphic to draw.
    // PARAMS:
    //     type: one of ['circle', 'rectangle', 'sprite' 'text']
    // CIRCLE PARAMS:
    //     color, radius
    // RECTANGLE PARAMS:
    //     height, width
    // SPRITE PARAMS:
    //     path (string for static or array of strings for animated)
    // TEXT PARAMS:
    //     copy, options
    var Graphic = function (params) {
        this.id = 'graphic';
        this.deps = ['position'];

        this.color = params.color;
        this.type = params.type;

        switch (params.type) {
            case 'circle':
                this.radius = params.radius;
                break;

            case 'rectangle':
                this.width = params.width;
                this.height = params.height;
                break;

            case 'sprite':
                this.path = params.path;

                //  Is the sprite visible.
                if (_.isUndefined(params.visible)) {
                    params.visible = true;
                }
                this.visible = params.visible;

                // Rotation is in radians.
                if (_.isUndefined(params.rotation)) {
                    params.rotation = true;
                }
                this.rotation = params.rotation;

                // Is the animation being loaded is a spritesheet.
                this.sheet = params.sheet ? true : false;

                // Animation.
                if (_.isArray(params.path) || params.sheet) {
                    if (_.isUndefined(params.animationSpeed)) {
                        params.animationSpeed = 1;
                    }
                    this.animationSpeed = params.animationSpeed;

                    if (_.isUndefined(params.currentFrame)) {
                        params.currentFrame = 0;
                    }
                    this.currentFrame = params.currentFrame;
                }
                break;

            case 'text':
                this.copy = params.copy;
                this.options = params.options;
                break;

            default:
                throw new Error('InvalidGraphicType');
        }
    };

    module.exports = Graphic;
} ());
