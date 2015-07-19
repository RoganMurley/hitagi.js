(function () {
    'use strict';

    // Represents a graphic to draw.
    // PARAMS:
    //     type: one of ['circle', 'rectangle', 'text']
    // CIRCLE PARAMS:
    //     color, radius
    // RECTANGLE PARAMS:
    //     height, width
    // SPRITE PARAMS:
    //     path
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
                this.visible = true;
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
