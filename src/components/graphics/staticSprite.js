(function () {
    'use strict';

    var _ = require('lodash');

    var StaticSprite = function (params) {
        this.$id = 'staticSprite';
        this.$deps = ['graphic'];

        params = _.extend({
            rotation: 0
        }, params);

        this.path = params.path;
        this.rotation = params.rotation;
    };

    module.exports = StaticSprite;
} ());
