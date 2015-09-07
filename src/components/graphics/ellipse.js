(function () {
    'use strict';

    var Ellipse = function (params) {
        this.$id = 'ellipse';
        this.$deps = ['graphic'];

        this.color = params.color;
        this.width = params.width;
        this.height = params.height;
    };

    module.exports = Ellipse;
} ());
