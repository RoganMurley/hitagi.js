(function () {
    'use strict';

    var _ = require('lodash');

    var defaultParams = require('../utils').defaultParams;

    // Represents a graphic to draw.
    var Graphic = function (params) {
        params = defaultParams({
            alpha: 1,
            anchor: {
                x: 0.5,
                y: 0.5
            },
            color: 0xFFFFFF,
            relative: true,
            scale: {
                x: 1,
                y: 1
            },
            visible: true,
            z: 0
        }, params);

        this.id = 'graphic';

        this.deps = [];
        if (params.relative) {
            // BODY V POSITION THING FIX ME.
            //this.deps.push('position');
        }

        this.alpha = params.alpha;
        this.anchor = params.anchor;
        this.color = params.color;
        this.relative = params.relative;
        this.scale = params.scale;
        this.type = params.type;
        this.visible = params.visible;
        this.z = params.z;

        switch (params.type) {
            case 'circle':
                this.radius = params.radius;
                break;

            case 'ellipse':
                this.width = params.width;
                this.height = params.height;
                break;

            case 'line':
                params = defaultParams({thickness: 1}, params);

                this.thickness = params.thickness;
                this.x1 = params.x1;
                this.y1 = params.y1;
                this.x2 = params.x2;
                this.y2 = params.y2;
                break;

            case 'polygon':
                this.points = params.points;
                break;

            case 'rectangle':
                this.width = params.width;
                this.height = params.height;
                break;

            case 'sprite':
                params = defaultParams({
                    rotation: 0,
                    sheet: false
                }, params);

                this.path = params.path; // Can be an array of paths to make an animation.

                this.rotation = params.rotation; // In radians
                this.sheet = params.sheet; // Set to true if we're loading a spritesheet.

                // Animation.
                if (_.isArray(params.path) || params.sheet) {
                    params = defaultParams({
                        animationSpeed: 1,
                        currentFrame: 0,
                        loop: true
                    }, params);

                    this.animationSpeed = params.animationSpeed;
                    this.currentFrame = params.currentFrame;
                    this.loop = params.loop;
                }
                break;

            case 'text':
                params = defaultParams({
                    bitmapFont: false
                }, params);
                this.bitmapFont = params.bitmapFont;
                this.copy = params.copy;
                this.style = params.style;
                break;

            default:
                throw new Error('InvalidGraphicType');
        }
    };

    module.exports = Graphic;
} ());
