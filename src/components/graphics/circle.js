(function () {
    'use strict';

    var Circle = function (params) {
        this.$id = 'circle';
        this.$deps = ['graphic'];

        this.color = params.color;
        this.radius = params.radius;
    };

    module.exports = Circle;
} ());
