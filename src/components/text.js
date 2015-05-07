(function () {
    'use strict';

    // Represents an entity's text copy and styling.
    // PARAMS:
    //      txt - copy of text.
    //      options - styling options, taken from the Pixi.js text primitive.
    var Text = function (params) {
        this.id = 'text';
        this.deps = ['position'];

        this.txt = params.txt;
        this.options = params.options;
    };

    module.exports = Text;
} ());
