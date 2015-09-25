(function () {
    'use strict';

    var Static = require('./static.js');

    var Collision = require('../components/collision.js');

    var StaticBody = function (params) {
        return new Static(params)
            .attach(new Collision(params));
    };

    module.exports = StaticBody;
} ());
