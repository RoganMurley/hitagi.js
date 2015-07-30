(function () {
    'use strict';

    var _ = require('lodash');
    var Howler = require('howler');

    var SoundSystem = function () {
        var that = this,
            sounds = {};

        this.volume = 1; // Between 0 and 1

        this.load = function (path) {
            sounds[path] = new Howler.Howl({urls: [path]});
            return sounds[path];
        };

        this.play = function (path) {
            if (!_.has(sounds, path)) {
                that.load(path);
            }
            sounds[path]._volume = that.volume;
            sounds[path].play();
        };
    };

    module.exports = SoundSystem;
} ());
