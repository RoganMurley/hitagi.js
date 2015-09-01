(function () {
    'use strict';

    var _ = require('lodash');

    var Line = function (params) {
        this.id = 'line';
        this.deps = ['graphic'];

        params = _.extend({
            thickness: 1
        }, params);

        this.thickness = params.thickness;
        this.x1 = params.x1;
        this.y1 = params.y1;
        this.x2 = params.x2;
        this.y2 = params.y2;
    };

    module.exports = Line;
} ());
