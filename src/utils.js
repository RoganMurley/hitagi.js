(function () {
    'use strict';

    var Utils = {
        // Transform a speed by our delta time.
        delta:
            function (speed, dt) {
                return speed * (dt / 1000);
            }
    };

    module.exports = Utils;
} ());
