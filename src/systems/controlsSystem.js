(function () {
    'use strict';

    var _ = require('lodash');

    var ControlsSystem = function () {
        var keys = {};
        var mousePos = {
            x: 0,
            y: 0
        };

        var bindings = {};
        var mouseMappings = {
            1: 'm1',
            2: 'm2',
            3: 'm3'
        };

        var KeyState = function () {
            this.active = false;
            this.held = false;

            this.updateHeld = function () {
                if (this.active) {
                    this.held = true;
                }
            };

            this.press = function () {
                this.active = true;
            };

            this.release = function () {
                this.active = false;
                this.held = false;
            };
        };

        // Listen for input.
        document.onkeydown = function (e) {
            var code = e.which;
            if (_.has(keys, code)) {
                keys[code].press();
                return false; // Prevent default.
            }
        };

        document.onkeyup = function (e) {
            var code = e.which;
            if (_.has(keys, code)) {
                keys[code].release();
                return false; // Prevent default.
            }
        };

        document.onmousedown = function(e) {
            var code = mouseMappings[e.which];
            if (_.has(keys, code)) {
                keys[code].press();
                return false; // Prevent default.
            }
        };

        document.onmouseup = function(e) {
            var code = mouseMappings[e.which];
            if (_.has(keys, code)) {
                keys[code].release();
                return false; // Prevent default.
            }
        };

        // Update mouse position.
        document.onmousemove = function(e) {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        };

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
            if (_.has(bindings, name)) {
                console.error(name + ' already bound.');
                throw new Error('ControlAlreadyBound');
            }
            bindings[name] = code;
            keys[code] = new KeyState();
        };

        // Remove a binding.
        this.unbind = function () {
            if (!_.has(bindings, name)) {
                console.error(name + ' not bound.');
                throw new Error('ControlNotBound');
            }
            var code = bindings[name];
            delete bindings[name];
            delete keys[code];
        };

        // Check that a key binding has been pressed.
        // Options: once
        // If once is true, only check for the press..
        this.check = function (binding, options) {
            var keyCode = bindings[binding],
                key = keys[keyCode];

            if (options && options.once) {
                return key.active && !key.held;
            }
            return key.active;
        };

        this.tickEnd = function () {
            _.each(
                keys,
                function (key) {
                    key.updateHeld();
                }
            );
        };

    };

    module.exports = ControlsSystem;
} ());
