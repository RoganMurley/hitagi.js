(function () {
    'use strict';

    var _ = require('lodash');

    var defaultor = function (defaultParams, inputParams) {
        var outputParams = inputParams;

        _.each(defaultParams, function (value, key) {
            if (!_.has(outputParams, key)) {
                outputParams[key] = value;
            }
        });

        return outputParams;
    };

    module.exports = defaultor;
} ());
