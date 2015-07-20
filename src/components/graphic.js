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

                if (_.isUndefined(params.visible)) {
                    params.visible = true;
                }
                this.visible = params.visible;

                // Animation.
                if (_.isArray(params.path)) {
                    if (_.isUndefined(params.animationSpeed)) {
                        params.animationSpeed = 1;
                    }
                    this.animationSpeed = params.animationSpeed;
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
