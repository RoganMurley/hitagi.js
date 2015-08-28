(function () {
    'use strict';

    var Rectangle = function (params) {
        this.id = 'rectangle';
        this.deps = ['graphic'];

        this.color = params.color;
        this.width = params.width;
        this.height = params.height;
    };

    module.exports = Rectangle;
} ());
