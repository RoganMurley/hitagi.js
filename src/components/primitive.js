(function () {
    'use strict';

    // Represents a graphics primitive.
    // PARAMS:
    //      color - primitive color
    //      type - type of primitive, can be 'circle' or 'rectangle'
    // CIRCLE PARAMS:
    //      radius
    // RECTANGLE PARAMS:
    //      width - rectangle width.
    //      height - rectangle height;
    var Primitive = function (params) {
        this.id = 'primitive';
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
            default:
                throw new Error('NotAPGraphicsrimitiveType');
        }
    };

    module.exports = Primitive;
} ());
