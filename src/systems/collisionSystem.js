(function () {
    'use strict';

    var _ = require('lodash');

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
            var dirX, dirY;
            if (other.c.position.x - entity.c.position.x < 0) {
                dirX = -1;
            } else {
                dirX = 1;
            }
            if (other.c.position.y - entity.c.position.y < 0) {
                dirY = -1;
            } else {
                dirY = 1;
            }

            var minApart = {
                x: entity.c.collision.width/2 + other.c.collision.width/2,
                y: entity.c.collision.height/2 + other.c.collision.height/2
            };

            var actualDisplacement = {
                x: Math.abs(entity.c.position.x - other.c.position.x),
                y: Math.abs(entity.c.position.y - other.c.position.y)
            };

            var overlap = {
                x: actualDisplacement.x - minApart.x,
                y: actualDisplacement.y - minApart.y
            };

            if (overlap.x > overlap.y ) {
                //console.log('overlap x');
                return {
                    x: dirX * overlap.x,
                    y: 0
                };
            }
            else if (overlap.x < overlap.y ) {
                //console.log('overlap y');
                return {
                    x: 0,
                    y: dirY * overlap.y
                };
            }
            else {//if(overlap.x == overlap.y)
                return {
                    x: dirX + overlap.x,
                    y: dirY * overlap.y
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
