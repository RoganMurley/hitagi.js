import assert from 'assert';

import Entity from '../entity.js';
import World from '../world.js';

import CollisionSystem from '../systems/collisionSystem.js';

import Collision from '../components/collision.js';
import Position from '../components/position.js';


describe('Collision System', () => {
    let world;
    let collisionSystem;

    const CollisionTestPrefab = (params) => {
        return new Entity()
            .attach(new Position(params))
            .attach(new Collision(params));
    };

    beforeEach(() => {
        world = new World();
        collisionSystem = new CollisionSystem();
        world.register(collisionSystem);
    });

    it('two 1 unit entities both positioned at the origin should collide', () => {
        const entity1 = world.add(
            new CollisionTestPrefab(
                {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1
                }
            )
        );
        const entity2 = world.add(
            new CollisionTestPrefab(
                {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1
                }
            )
        );

        const test = collisionSystem.collide(entity1, 'collision');
        assert.deepEqual(test[0], entity2);
    });

    it('two 1 unit entities both positioned adjacent at the origin should NOT collide', () => {
        const entity1 = world.add(
            new CollisionTestPrefab(
                {
                    x: 1,
                    y: 0,
                    width: 1,
                    height: 1
                }
            )
        );
        world.add(
            new CollisionTestPrefab(
                {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1
                }
            )
        );

        const test = collisionSystem.collide(entity1, 'collision');
        assert.deepEqual(test, []);
    });

    it('two 1000 unit entities at (-250, -100) and (9, 82) should collide', () => {
        const entity1 = world.add(
            new CollisionTestPrefab(
                {
                    x: -250,
                    y: -100,
                    width: 1000,
                    height: 1000
                }
            )
        );
        const entity2 = world.add(
            new CollisionTestPrefab(
                {
                    x: 9,
                    y: 82,
                    width: 1000,
                    height: 1000
                }
            )
        );

        const test = collisionSystem.collide(entity1, 'collision');
        assert.deepEqual(test[0], entity2);
    });

});
