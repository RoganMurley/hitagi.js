(function () {
    'use strict';

    var _ = require('lodash');

    var Entity = require('../entity.js');

    var Position = require('../components/position.js');
    var Graphic = require('../components/graphics/graphic.js');

    var Static = function (params) {
        params = _.extend({
            x: 0,
            y: 0
        }, params);

        return new Entity()
            .attach(new Position(params))
            .attach(new Graphic(params));
    };

    module.exports = Static;
} ());
