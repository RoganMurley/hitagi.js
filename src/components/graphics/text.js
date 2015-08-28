(function () {
    'use strict';

    var _ = require('lodash');

    var Text = function (params) {
        this.id = 'text';
        this.deps = ['graphic'];

        params = _.extend({
            bitmapFont: false
        }, params);

        this.bitmapFont = params.bitmapFont;
        this.copy = params.copy;
        this.style = params.style;
    };

    module.exports = Text;
} ());
