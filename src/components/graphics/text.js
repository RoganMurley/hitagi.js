(function () {
    'use strict';

    var _ = require('lodash');

    var Text = function (params) {
        this.$id = 'text';
        this.$deps = ['graphic'];

        params = _.extend({
            bitmapFont: false,
            rotation: 0,
            style: {}
        }, params);

        params.style = _.extend({
            font: '32px monospace',
            fill: 0xffffff
        }, params.style);

        this.bitmapFont = params.bitmapFont;
        this.copy = params.copy;
        this.rotation = params.rotation;
        this.style = params.style;
    };

    module.exports = Text;
} ());
