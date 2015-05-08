(function () {
    'use strict';

    var _ = require('lodash');
    var $ = require('jquery');

    var Controls = function () {
        var keys = {};
        var mousePos = {
                x: 0,
                y: 0
            };

        var bindings = {};

        // Listen for input.
        $(document).keydown(function (e) {
            keys[e.which] = true;
        });

        $(document).keyup(function (e) {
            delete keys[e.which];
        });

        $(document).mousedown(function(e) {
            switch (e.which) {
                case 1:
                    keys.m1 = true;
                    break;
                case 2:
                    keys.m3 = true;
                    break;
                case 3:
                    keys.m2 = true;
                    break;
            }
        });

        $(document).mouseup(function(e) {
            switch (e.which) {
                case 1:
                    delete keys.m1;
                    break;
                case 2:
                    delete keys.m3;
                    break;
                case 3:
                    delete keys.m2;
                    break;
            }
        });

        // Update mouse position.
        $(document).mousemove(function(e) {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        });

        this.getMousePos = function () {
            return mousePos;
        };

        // Disable context menu, so we can right click.
        window.oncontextmenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        // Add a binding.
        this.bind = function (code, name) {
            if (!_.has(bindings, name)) {
                console.error(name + ' already bound.');
                throw new Error('ControlAlreadyBound');
            }
            bindings[name] = code;
        };

        // Remove a binding.
        this.unbind = function () {
            if (!_.has(bindings, name)) {
                console.error(name + ' not bound.');
                throw new Error('ControlNotBound');
            }
            delete bindings[name];
        };

        // Check that a key binding has been pressed.
        // If hold is true, only check for it once.
        this.check = function (binding, hold) {
            var keyCode = bindings[binding];
            var keyPressed = keys[keyCode];
            if (hold) {
                delete keys[keyCode];
            }
            return keyPressed;
        };

    };

    module.exports = Controls;
} ());
