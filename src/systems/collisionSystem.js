(function () {
    'use strict';

    var _ = require('lodash');
    var Victor = require('victor');

    var CollisionSystem = function () {
        var that = this;

        this.$tracking = {
            'collision': 'many'
        };

        var hitTestRectangle = function (entity, other, x1, y1) {
            // Check for default args.
            if (typeof x1 === 'undefined' && typeof y1 === 'undefined') {
                x1 = entity.c.position.x;
                y1 = entity.c.position.y;
            }

            var x2 = other.c.position.x,
                y2 = other.c.position.y;

            var width = (entity.c.collision.width + other.c.collision.width) / 2,
                height = (entity.c.collision.height + other.c.collision.height) / 2;

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
            var entityPos = Victor.fromObject(entity.c.position);
            var otherPos = Victor.fromObject(other.c.position);

            var direction = otherPos
                .clone()
                .subtract(entityPos)
                .clone()
                .normalize();

            var minApart = {
                x: entity.c.collision.width/2 + other.c.collision.width/2,
                y: entity.c.collision.height/2 + other.c.collision.height/2
            };

            var actualDisplacement = {
                x: Math.abs(entityPos.x - otherPos.x),
                y: Math.abs(entityPos.y - otherPos.y)
            };

            var overlap = {
                x: actualDisplacement.x - minApart.x,
                y: actualDisplacement.y - minApart.y
            };

            if (overlap.x > overlap.y ) {
                return {
                    x: direction.x * overlap.x,
                    y: 0
                };
            }
            else if (overlap.x < overlap.y ) {
                return {
                    x: 0,
                    y: direction.y * overlap.y
                };
            }
            else {//if(overlap.x == overlap.y)
                return {
                    x: Math.round(direction.x + overlap.x),
                    y: Math.round(direction.y * overlap.y)
                };
            }
        };

        // Prospective collision test.
        // Tests for a collision between entity and any
        // entity with otherComponent.
        // If x and y is given, we pretend our entity is at that pos
        // Returns {hit: bool, entity: object}
        this.collide = function (entity, otherComponent, x, y) {
            var others = that.$tracked.collision,
                hitEntity = null,
                displacementVector = null;

            var hit = _.some(
                others,
                function (other) {
                    hitEntity = other;

                    if (other === entity) {
                        return false;
                    }
                    if (other.has(otherComponent) || !otherComponent) {
                        var hitTest = hitTestRectangle(entity, other, x, y);
                        if (hitTest) {
                            displacementVector = minimumDisplacementVector(entity, other);
                            console.log(displacementVector);
                            return true;
                        }
                    }
                    return false;
                }
            );

            return {
                hit: hit,
                entity: hit ? hitEntity : null,
                displacement: hit ? displacementVector : null
            };
        };
    };

    module.exports = CollisionSystem;
} ());
