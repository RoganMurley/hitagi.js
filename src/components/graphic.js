(function () {
    'use strict';

    var _ = require('lodash');

    var defaultParams = require('../utils').defaultParams;

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
        params = defaultParams({
            alpha: 1,
            anchor: {
                x: 0.5,
                y: 0.5
            },
            relative: true
        }, params);

        this.id = 'graphic';
        this.deps = ['position'];

        this.alpha = params.alpha;
        this.anchor = params.anchor;
        this.color = params.color;
        this.relative = params.relative;
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
                params = defaultParams({
                    visible: true,
                    rotation: 0,
                    sheet: true
                }, params);

                this.path = params.path; // Can be an array of paths to make an animation.

                this.visible = params.visible;
                this.rotation = params.rotation; // In radians
                this.sheet = params.sheet; // Set to true if we're loading a spritesheet.

                // Animation.
                if (_.isArray(params.path) || params.sheet) {
                    params = defaultParams({
                        animationSpeed: 1,
                        currentFrame: 0
                    }, params);

                    this.animationSpeed = params.animationSpeed;
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
