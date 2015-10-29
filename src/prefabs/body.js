(function () {
    'use strict';

    var Base = require('./base.js');

    var Collision = require('../components/collision.js');

    var Body = function (params) {
        return new Base(params)
            .attach(new Collision(params));
    };

    module.exports = Body;
} ());
