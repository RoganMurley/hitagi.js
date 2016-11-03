(function () {
    'use strict';

    var _ = require('lodash');

    var Static = require('./static.js');

    var Velocity = require('../components/velocity.js');

    var Basic = function (params) {
        params = _.extend({
            xspeed: 0,
            yspeed: 0
        }, params);

        return new Static(params)
            .attach(new Velocity(params));
    };

    module.exports = Basic;
} ());
