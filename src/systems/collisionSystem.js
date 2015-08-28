(function () {
    'use strict';

    var _ = require('lodash');

    var CollisionSystem = function () {
        var that = this;

        this.$tracking = {
            'collision': 'many'
        };

        // Prospective collision test.
        // Tests for a collision between entity and any
        // entity with otherComponent.
        this.collide = function (entity, otherComponent, params) {
            return _.filter(
                that.$tracked.collision,
                function (other) {
                    return (other.uid !== entity.uid) &&
                        other.has(otherComponent) &&
                        hitTestAABB(entity, other, params);
                }
            );
        };

        this.resolutionVector = function (entity, other, params) {
            var positions = anchoredPositions(entity, other, params);
            var x1 = positions.x1,
                y1 = positions.y1,
                x2 = positions.x2,
                y2 = positions.y2;

            var dirX, dirY;
            if (x2 - x1 < 0) {
                dirX = -1;
            } else {
                dirX = 1;
            }
            if (y2 - y1 < 0) {
                dirY = -1;
            } else {
                dirY = 1;
            }

            var minApart = {
                x: (entity.c.collision.width + other.c.collision.width) / 2,
                y: (entity.c.collision.height + other.c.collision.height) / 2
            };

            var actualDisplacement = {
                x: Math.abs(x1 - x2),
                y: Math.abs(y1 - y2)
            };

            var overlap = {
                x: actualDisplacement.x - minApart.x,
                y: actualDisplacement.y - minApart.y
            };

            if (overlap.x > overlap.y ) {
                return {
                    x: dirX * overlap.x,
                    y: 0
                };
            }
            else if (overlap.x < overlap.y ) {
                return {
                    x: 0,
                    y: dirY * overlap.y
                };
            }
            else { //if(overlap.x == overlap.y)
                return {
                    x: dirX * overlap.x,
                    y: dirY * overlap.y
                };
            }
        };

        var hitTestAABB = function (entity, other, params) {
            var positions = anchoredPositions(entity, other, params);
            var x1 = positions.x1,
                y1 = positions.y1,
                x2 = positions.x2,
                y2 = positions.y2;

            var width = (entity.c.collision.width + other.c.collision.width) / 2;
            var height = (entity.c.collision.height + other.c.collision.height) / 2;

            if (x1 + width > x2) {
                if (x1 < x2 + width) {
                    if (y1 + height > y2) {
                        if (y1 < y2 + height) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        var anchoredPositions = function (entity, other, params) {
            params = _.extend({
                x: entity.c.position.x,
                y: entity.c.position.y
            }, params);

            var result = {
                x1: params.x,
                y1: params.y,
                x2: other.c.position.x,
                y2: other.c.position.y
            };

            result.x1 -= (entity.c.collision.anchor.x - 0.5) * entity.c.collision.width;
            result.y1 -= (entity.c.collision.anchor.y - 0.5) * entity.c.collision.height;

            result.x2 -= (other.c.collision.anchor.x - 0.5) * other.c.collision.width;
            result.y2 -= (other.c.collision.anchor.y - 0.5) * other.c.collision.height;

            return result;
        };

    };

    module.exports = CollisionSystem;
} ());
