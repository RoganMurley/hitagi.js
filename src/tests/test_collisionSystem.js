(function () {
    'use strict';

    var _ = require('lodash');
    var assert = require('assert');

    var Entity = require('../entity.js');
    var World = require('../world.js');

    var CollisionSystem = require('../systems/collisionSystem.js');

    var Collision= require('../components/collision.js');
    var Position = require('../components/position.js');


    describe('Collision System', function () {
        var world;
        var collisionSystem;

        var CollisionTestPrefab = function (params) {
            return new Entity()
                        .attach(new Position(params))
                        .attach(new Collision(params));
        };

        beforeEach(function () {
            world = new World();
            collisionSystem = new CollisionSystem();
            world.register(collisionSystem);
        });

        it('two 1 unit entities both positioned at the origin should collide', function () {
            var entity1 = world.add(
                new CollisionTestPrefab(
                    {
                        x: 0,
                        y: 0,
                        width: 1,
                        height: 1
                    }
                )
            );
            var entity2 = world.add(
                new CollisionTestPrefab(
                    {
                        x: 0,
                        y: 0,
                        width: 1,
                        height: 1
                    }
                )
            );

            var test = collisionSystem.collide(entity1, 'collision');
            assert.deepEqual(test[0].entity, entity2);
        });

        it('two 1 unit entities both positioned adjacent at the origin should NOT collide', function () {
            var entity1 = world.add(
                new CollisionTestPrefab(
                    {
                        x: 1,
                        y: 0,
                        width: 1,
                        height: 1
                    }
                )
            );
            var entity2 = world.add(
                new CollisionTestPrefab(
                    {
                        x: 0,
                        y: 0,
                        width: 1,
                        height: 1
                    }
                )
            );

            var test = collisionSystem.collide(entity1, 'collision');
            assert.deepEqual(test, []);
        });

        it('two 1000 unit entities at (-250, -100) and (9, 82) should collide', function () {
            var entity1 = world.add(
                new CollisionTestPrefab(
                    {
                        x: -250,
                        y: -100,
                        width: 1000,
                        height: 1000
                    }
                )
            );
            var entity2 = world.add(
                new CollisionTestPrefab(
                    {
                        x: 9,
                        y: 82,
                        width: 1000,
                        height: 1000
                    }
                )
            );

            var test = collisionSystem.collide(entity1, 'collision');
            assert.deepEqual(test[0].entity, entity2);
        });

    });

} ());
