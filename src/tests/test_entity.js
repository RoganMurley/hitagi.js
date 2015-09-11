(function () {
    'use strict';

    var _ = require('lodash');
    var assert = require('assert');

    var Entity = require('../entity.js');

    describe('Entity', function () {
        var entity;

        beforeEach(function () {
            entity = new Entity();
        });

        it('should have no components on initialisation', function () {
            assert.deepEqual(entity.c, {});
        });

        it('component should be properly attached and detached', function () {
            var testComponent = {$id: 'testComponent'};

            entity.attach(testComponent);
            assert.deepEqual(
                entity.c,
                {
                    'testComponent': testComponent
                }
            );

            entity.detach(testComponent.$id);
            assert.deepEqual(entity.c, {});
        });

        it('component should meets its dependencies before being attached', function () {
            var testComponent1 = {
                $id: 'testComponent1',
            };
            var testComponent2 = {
                $id: 'testComponent2',
                $deps: ['testComponent1']
            };
            assert.throws(
                function () {
                    entity.attach(testComponent2);
                },
                'ComponentDependencyMissing'
            );
            entity.attach(testComponent1);
            entity.attach(testComponent2);
        });

        it('component should not be attached twice', function () {
            var testComponent = {$id: 'testComponent'};
            entity.attach(testComponent);
            assert.throws(
                function () {
                    entity.attach(testComponent);
                },
                'ComponentAlreadyAttached'
            );
        });

        it('multiple components should be attached and detached properly', function () {
            var testComponent1 = {$id: 'testComponent1'};
            var testComponent2 = {$id: 'testComponent2'};
            var testComponent3 = {$id: 'testComponent3'};

            entity.attach(testComponent1);
            assert.deepEqual(
                entity.c,
                {'testComponent1': testComponent1}
            );

            entity.attach(testComponent2);
            assert.deepEqual(
                entity.c,
                {
                    'testComponent1': testComponent1,
                    'testComponent2': testComponent2
                }
            );

            entity.attach(testComponent3);
            assert.deepEqual(
                entity.c,
                {
                    'testComponent1': testComponent1,
                    'testComponent2': testComponent2,
                    'testComponent3': testComponent3
                }
            );

            assert.deepEqual(
                entity.c,
                {
                    'testComponent1': testComponent1,
                    'testComponent2': testComponent2,
                    'testComponent3': testComponent3
                }
            );

            entity.detach(testComponent1.$id);
            assert.deepEqual(
                entity.c,
                {
                    'testComponent2': testComponent2,
                    'testComponent3': testComponent3
                }
            );

            entity.detach(testComponent2.$id);
            assert.deepEqual(
                entity.c,
                {'testComponent3': testComponent3}
            );

            entity.detach(testComponent3.$id);
            assert.deepEqual(entity.c, {});
        });

        it('has should test for components', function () {
            var testComponent = {$id: 'testComponent'};
            entity.attach(testComponent);
            assert.equal(true, entity.has(testComponent.$id));
            assert.equal(false, entity.has('noComponent'));
        });

        it('component should throw an error if it is detached while it is a dependency', function () {
            var testComponent1 = {
                $id: 'testComponent1',
            };
            var testComponent2 = {
                $id: 'testComponent2',
                $deps: ['testComponent1']
            };

            entity.attach(testComponent1);
            entity.attach(testComponent2);

            assert.throws(
                function () {
                    entity.detach('testComponent1');
                },
                'ComponentDependencyMissing'
            );
        });

    });

} ());
