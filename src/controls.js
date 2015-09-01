(function () {
    'use strict';

    var _ = require('lodash');

    var Controls = function () {
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

        var pressKey = function (key) {
            keys[key] = {
                active: true
            }
        };

        var releaseKey = function (key) {
            keys[key] = {
                active: false
            }
        };

        // Listen for input.
        document.onkeydown = function (e) {
            pressKey(e.which);
        };

        document.onkeyup = function (e) {
            releaseKey(e.which);
        };

        document.onmousedown = function(e) {
            pressKey(mouseMappings[e.which]);
        };

        document.onmouseup = function(e) {
            releaseKey(mouseMappings[e.which]);
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
            var keyPressed = keys[keyCode] && keys[keyCode].active; // Shortcircuit
            if (hold) {
                keys[keyCode].active = false;
            }
            return keyPressed;
        };

    };

    module.exports = Controls;
} ());
