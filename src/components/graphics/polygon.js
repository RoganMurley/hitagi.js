(function () {
    'use strict';

    var Polygon = function (params) {
        this.$id = 'polygon';
        this.$deps = ['graphic'];

        this.color = params.color;
        this.points = params.points;
    };

    module.exports = Polygon;
} ());
