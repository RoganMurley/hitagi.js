(function () {
    'use strict';

    var _ = require('lodash');

    var Utils = {

        // Assign default params.
        defaultParams:
            function (defaultParams, inputParams) {
                var outputParams = inputParams;

                _.each(defaultParams, function (value, key) {
                    if (!_.has(outputParams, key)) {
                        outputParams[key] = value;
                    }
                });

                return outputParams;
            },

        // Transform a speed by our delta time.
        delta:
            function (speed, dt) {
                return speed * (dt / 1000);
            },

        // Proxy a property, simillar to the proxy in ES6.
        // Allows us to propagate changes to the target property.
        proxy:
            function (originalObj, originalProp, targetObj, targetProp) {
                Object.defineProperty(
                    originalObj,
                    originalProp,
                    {
                        get: function () {
                            return targetObj[targetProp];
                        },
                        set: function (newValue) {
                            targetObj[targetProp] = newValue;
                        }
                    }
                );
            },

        // Watches a property, executing a callback when the property changes.
        look:
            function (obj, prop, callback, callbackParams) {
                var value = obj[prop];

                Object.defineProperty(
                    obj,
                    prop,
                    {
                        get: function () {
                            return value;
                        },
                        set: function (newValue) {
                            value = newValue;
                            callback(newValue, callbackParams);
                        }
                    }
                );
            }

    };

    module.exports = Utils;
} ());
