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
            build: simple.mock(),
            remove: simple.mock(),
            tickStart: simple.mock(),
            tickEnd: simple.mock(),
            update: simple.mock()
        };

        beforeEach(function () {
            world = new World();
        });

        it('registered systems should call their update methods once for each added entity per world update', function () {
            world.register(mockSystem);
            world.add(new Entity());

            assert.equal(mockSystem.update.callCount, 0);

            world.update();
            assert.equal(mockSystem.update.callCount, 1);

            mockSystem.update.reset();

            world.add(new Entity());
            world.add(new Entity());
            world.add(new Entity());
            world.add(new Entity());

            world.update();
            assert.equal(mockSystem.update.callCount, 5);
        });

        it('registered systems should call their tickStart and tickEnd methods once regardless of how many entities there are', function () {
            world.register(mockSystem);
            world.add(new Entity());

            assert.equal(mockSystem.tickStart.callCount, 0);
            assert.equal(mockSystem.tickEnd.callCount, 0);

            world.tickStart();
            assert.equal(mockSystem.tickStart.callCount, 1);

            world.tickEnd();
            assert.equal(mockSystem.tickEnd.callCount, 1);

            mockSystem.tickStart.reset();
            mockSystem.tickEnd.reset();

            world.add(new Entity());
            world.add(new Entity());
            world.add(new Entity());
            world.add(new Entity());

            world.tickStart();
            assert.equal(mockSystem.tickStart.callCount, 1);

            world.tickEnd();
            assert.equal(mockSystem.tickEnd.callCount, 1);
        });

        it('systems are updated according to their priority, with higher priority systems being updated first.', function () {
            var calls = [];

            var mockSystems = [
                {
                    update: function () {
                        calls.push(1);
                    },
                    priority: 1
                },
                {
                    update: function () {
                        calls.push(2);
                    },
                    priority: 0
                }
            ];

            _.each(
                mockSystems,
                world.register
            );
            world.add(new Entity());

            world.update();
            assert.deepEqual(calls, [1, 2]);
        });

        it('systems are updated according to their priority, with lower priority systems being updated last.', function () {
            var calls = [];

            var mockSystems = [
                {
                    update: function () {
                        calls.push(1);
                    },
                    priority: 0
                },
                {
                    update: function () {
                        calls.push(2);
                    },
                    priority: 1
                }
            ];

            _.each(
                mockSystems,
                world.register
            );
            world.add(new Entity());

            world.update();
            assert.deepEqual(calls, [2, 1]);
        });

        it('systems with the same priority are updated in the order they are added.', function () {
            var calls = [];

            var mockSystems = [
                {
                    update: function () {
                        calls.push(1);
                    },
                    priority: 0
                },
                {
                    update: function () {
                        calls.push(2);
                    },
                    priority: 0
                },
                {
                    update: function () {
                        calls.push(3);
                    },
                    priority: 1
                },
                {
                    update: function () {
                        calls.push(4);
                    },
                    priority: 1
                }
            ];

            _.each(
                mockSystems,
                world.register
            );
            world.add(new Entity());

            world.update();
            assert.deepEqual(calls, [3, 4, 1, 2]);
        });

        it('systems with no priority are always updated last.', function () {
            var calls = [];

            var mockSystems = [
                {
                    update: function () {
                        calls.push(1);
                    },
                    priority: -999999
                },
                {
                    update: function () {
                        calls.push(2);
                    }
                }
            ];

            _.each(
                mockSystems,
                world.register
            );
            world.add(new Entity());

            world.update();
            assert.deepEqual(calls, [1, 2]);
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
            mockSystem.build.reset();
            mockSystem.remove.reset();
            world.register(mockSystem);
            assert.equal(mockSystem.build.callCount, 0);
            assert.equal(mockSystem.remove.callCount, 0);

            var entity = new Entity();
            world.add(entity);
            assert.equal(mockSystem.build.callCount, 1);

            entity.attach({id: 'testComponent'});
            assert.equal(mockSystem.build.callCount, 2);
            assert.equal(mockSystem.remove.callCount, 1);

        });

    });

} ());
