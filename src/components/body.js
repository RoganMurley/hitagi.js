(function () {
    'use strict';

    var defaultParams = require('../utils').defaultParams;

    var Body = function (params) {
        params = defaultParams({
            angle: 0,
            static: false
        }, params);


        this.id = 'body';
        this.deps = ['velocity'];

        this.angle = params.angle;
        this.height = params.height;
        this.width = params.width;
        this.static = params.static;
    };

    module.exports = Body;
} ());
