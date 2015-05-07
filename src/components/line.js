(function () {
    'use strict';

    // Represents the graphics primitive line of an entity in 2d space.
    // Stores the ending point of the line, the starting point is the position.
    // PARAMS:
    //      x - the ending x co-ordinate of the line.
    //      y - the ending y co-ordingate of the line.
    var Line = function (params) {
        this.id = 'line';
        this.deps = ['position'];

        this.x = params.x;
        this.y = params.y;
    };

    module.exports = Line;
} ());
