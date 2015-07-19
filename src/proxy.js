(function () {
    'use strict';

    // Proxy a property, simillar to the proxy in ES6.
    // Allows us to propagate changes to the target property.
    var proxy = function (originalObj, originalProp, targetObj, targetProp) {
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
    };

    module.exports = proxy;
} ());
