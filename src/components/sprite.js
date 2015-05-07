(function () {
    'use strict';

    // Represents an entity's sprite.
    // PARAMS:
    //      path - URL of raw sprite
    var Sprite = function (params) {
        this.id = 'sprite';
        this.deps = ['position'];
        this.path = params.path;
        this.visible = true;
    };

    module.exports = Sprite;
} ());
