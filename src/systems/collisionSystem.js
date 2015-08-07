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

        // Prospective collision test.
        // Tests for a collision between entity and any
        // entity with otherComponent.
        // If x and y is given, we pretend our entity is at that pos
        // Returns {hit: bool, entity: object}
        this.collide = function (entity, otherComponent, x, y) {
            var others = that.$tracked.collision,
                hitEntity = null;

            var hit = _.some(
                others,
                function (other) {
                    hitEntity = other;

                    if (other === entity) {
                        return false;
                    }
                    if (other.has(otherComponent) || !otherComponent) {
                        return hitTestRectangle(entity, other, x, y);
                    }
                    return false;
                }
            );

            return {
                hit: hit,
                entity: hit ? hitEntity : null
            };
        };
    };

    module.exports = CollisionSystem;
} ());
