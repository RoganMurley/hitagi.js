(function () {
    'use strict';

    // Represents a graphic to draw.
    // PARAMS:
    //      type: 'circle' or 'rectangle'
    // CIRCLE PARAMS:
    //      color, radius
    // RECTANGLE PARAMS:
    //      height, width
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

            case 'text':
                this.txt = params.txt;
                this.options = params.options;
                break;

            default:
                throw new Error('InvalidGraphicType');
        }
    };

    module.exports = Graphic;
} ());
