(function () {
    'use strict';

    var _ = require('lodash');

    var RoomSystem = function (world) {
        var rooms = {};

        this.saveRoom = function (roomName, entities) {
            var componentBatches = _.pluck(entities, 'c');
            rooms[roomName] = componentBatches;
        };

        this.loadRoom = function (roomName) {
            world.clear();
            world.load(rooms[roomName]);
        };
    };

    module.exports = RoomSystem;
} ());
