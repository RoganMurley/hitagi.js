(function () {
    'use strict';

    var _ = require('lodash');
    var Howler = require('howler');

    var SoundSystem = function () {
        var that = this,
            sounds = {};

        this.load = function (path) {
            sounds[path] = new Howler.Howl({urls: [path]});
            return sounds[path];
        };

        this.play = function (path) {
            if (_.has(sounds, path)) {
                sounds[path].play();
            } else {
                that.load(path).play();
            }
        };
    };

    module.exports = SoundSystem;
} ());
