(function () {
    'use strict';

    var _ = require('lodash');
    var assert = require('assert');
    var simple = require('simple-mock');

    var Entity = require('../entity.js');
    var World = require('../world.js');

    describe('World', function () {
        var world;
        var mockSystem = {
            build: {
                testing: simple.mock()
            },
            destroy: {
                testing: simple.mock()
            },
            tickStart: simple.mock(),
            tickEnd: simple.mock(),
            update: {
                testing: simple.mock()
            }
        };

        beforeEach(function () {
            world = new World();
        });

        it('registered systems should call their update methods once for each added entity per world update', function () {
            world.register(mockSystem);
            world.add(
                new Entity().attach({
                    $id: 'testing'
                })
            );

            assert.equal(mockSystem.update.testing.callCount, 0);

            world.update();
            assert.equal(mockSystem.update.testing.callCount, 1);

            mockSystem.update.testing.reset();

            _.times(4, function () {
                world.add(
                    new Entity().attach({
                        $id: 'testing'
                    })
                );
            });

            world.update();
            assert.equal(mockSystem.update.testing.callCount, 5);
        });

        it('registered systems should call their tickStart and tickEnd methods once regardless of how many entities there are', function () {
            world.register(mockSystem);
            world.add(
                new Entity().attach({
                    $id: 'testing'
                })
            );

            assert.equal(mockSystem.tickStart.callCount, 0);
            assert.equal(mockSystem.tickEnd.callCount, 0);

            world.tickStart();
            assert.equal(mockSystem.tickStart.callCount, 1);

            world.tickEnd();
            assert.equal(mockSystem.tickEnd.callCount, 1);

            mockSystem.tickStart.reset();
            mockSystem.tickEnd.reset();

            _.times(4, function () {
                world.add(
                    new Entity().attach({
                        $id: 'testing'
                    })
                );
            });

            world.tickStart();
            assert.equal(mockSystem.tickStart.callCount, 1);

            world.tickEnd();
            assert.equal(mockSystem.tickEnd.callCount, 1);
        });

        it('world tick should call tickStart, update and tickEnd once each', function () {
            world.tickStart = simple.mock(world.tickStart);
            world.update = simple.mock(world.update);
            world.tickEnd = simple.mock(world.tickEnd);

            assert.equal(world.tickStart.callCount, 0);
            assert.equal(world.update.callCount, 0);
            assert.equal(world.tickEnd.callCount, 0);

            world.tick();

            assert.equal(world.tickStart.callCount, 1);
            assert.equal(world.update.callCount, 1);
            assert.equal(world.tickEnd.callCount, 1);
        });

        it('if an entity has been added to a world, attaching a component to the entity should rebuild the entity.', function () {
            mockSystem.build.testing.reset();
            mockSystem.destroy.testing.reset();
            world.register(mockSystem);
            assert.equal(mockSystem.build.testing.callCount, 0);
            assert.equal(mockSystem.destroy.testing.callCount, 0);

            var entity = new Entity();
            world.add(entity);
            assert.equal(mockSystem.build.testing.callCount, 0);

            entity.attach({$id: 'testing'});
            assert.equal(mockSystem.build.testing.callCount, 1);
            assert.equal(mockSystem.destroy.testing.callCount, 1);

            entity.attach({$id: 'velvet'});
            assert.equal(mockSystem.build.testing.callCount, 1);
            assert.equal(mockSystem.destroy.testing.callCount, 1);

        });

        it('tracking should function as expected.', function () {
            mockSystem.$tracking = {'testing': 'many'};
            world.register(mockSystem);

            // Test tracking.
            var testEntity = world.add(
                new Entity().attach({
                    $id: 'testing'
                })
            );
            assert.deepEqual(
                mockSystem.$tracked.testing[testEntity.uid],
                testEntity
            );

            // Test for false positives.
            var testEntity2 = world.add(
                new Entity().attach({
                    $id: 'testing2'
                })
            );
            assert.equal(
                _.isUndefined(mockSystem.$tracked.testing[testEntity2.uid]),
                true
            );

            // Test untracking.
            world.remove(testEntity);
            assert.equal(
                _.isUndefined(mockSystem.$tracked.testing[testEntity.uid]),
                true
            );
        });

    });

} ());
