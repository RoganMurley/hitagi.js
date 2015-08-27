(function () {
    'use strict';

    var _ = require('lodash');

    var CollisionSystem = function () {
        var that = this;

        this.$tracking = {
            'collision': 'many'
        };

        var hitTestRectangle = function (entity, other, params) {
            params = _.extend({
                x1: entity.c.position.x,
                y1: entity.c.position.y,
                x2: other.c.position.x,
                y2: other.c.position.y
            }, params);

            var x1 = params.x1;
            var y1 = params.y1;
            var x2 = params.x2;
            var y2 = params.y2;

            // Collision anchor stuff.
            x1 -= (entity.c.collision.anchor.x - 0.5) * entity.c.collision.width;
            y1 -= (entity.c.collision.anchor.y - 0.5) * entity.c.collision.height;

            x2 -= (other.c.collision.anchor.x - 0.5) * other.c.collision.width;
            y2 -= (other.c.collision.anchor.y - 0.5) * other.c.collision.height;

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

        var minimumDisplacementVector = function (entity, other) {
            var entityX = entity.c.position.x;
            var entityY = entity.c.position.y;
            var otherX = other.c.position.x;
            var otherY = other.c.position.y;

            // Collision anchor stuff.
            entityX -= (entity.c.collision.anchor.x - 0.5) * entity.c.collision.width;
            entityY -= (entity.c.collision.anchor.y - 0.5) * entity.c.collision.height;

            otherX -= (other.c.collision.anchor.x - 0.5) * other.c.collision.width;
            otherY -= (other.c.collision.anchor.y - 0.5) * other.c.collision.height;

            var dirX, dirY;
            if (otherX - entityX < 0) {
                dirX = -1;
            } else {
                dirX = 1;
            }
            if (otherY - entityY < 0) {
                dirY = -1;
            } else {
                dirY = 1;
            }

            var minApart = {
                x: entity.c.collision.width/2 + other.c.collision.width/2,
                y: entity.c.collision.height/2 + other.c.collision.height/2
            };

            var actualDisplacement = {
                x: Math.abs(entityX - otherX),
                y: Math.abs(entityY - otherY)
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

        // Prospective collision test.
        // Tests for a collision between entity and any
        // entity with otherComponent.
        this.collide = function (entity, otherComponent, params) {
            var hitEntities = _.filter(
                that.$tracked.collision,
                function (other) {
                    return (other.uid !== entity.uid) &&
                        other.has(otherComponent) &&
                        hitTestRectangle(entity, other, params);
                }
            );

            return _.map(
                hitEntities,
                function (other) {
                    return {
                        entity: other,
                        resolution: minimumDisplacementVector(entity, other)
                    };
                }
            );
        };
    };

    module.exports = CollisionSystem;
} ());
