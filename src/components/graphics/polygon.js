(function () {
    'use strict';

    var Polygon = function (params) {
        this.id = 'polygon';
        this.deps = ['graphic'];

        this.points = params.points;
    };

    module.exports = Polygon;
} ());
