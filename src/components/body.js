(function () {
    'use strict';

    var defaultParams = require('../utils').defaultParams;

    var Body = function (params) {
        params = defaultParams({
            static: false
        }, params);


        this.id = 'body';
        this.deps = ['position'];

        this.height = params.height;
        this.width = params.width;
        this.static = params.static;
    };

    module.exports = Body;
} ());
