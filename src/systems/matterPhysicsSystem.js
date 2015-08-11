(function () {
    'use strict';

    var _ = require('lodash');
    var Matter = require('matter-js');



    var utils = require('../utils.js'),
        look = utils.look,
        proxy = utils.proxy;

    var MatterPhysicsSystem = function (bounds) {
        var engine = Matter.Engine.create();
        engine.world.bounds.max = bounds;

        var bodies = {};

        this.build = {
            body: function (entity) {
                var body = Matter.Bodies.rectangle(
                    entity.c.body.x,
                    entity.c.body.y,
                    entity.c.body.width,
                    entity.c.body.height,
                    {
                        angle: entity.c.body.angle,
                        density: entity.c.body.density,
                        isStatic: entity.c.body.static
                    }
                );

                // Set and proxy stuff.
                body.angle = entity.c.body.angle;
                proxy(entity.c.body, 'angle', body, 'angle');

                proxy(entity.c.body, 'width', body, 'width');
                proxy(entity.c.body, 'height', body, 'height');

                body.force = entity.c.body.force;
                proxy(entity.c.body, 'force', body, 'force');

                proxy(entity.c.body, 'density', body, 'density');


                body.position.x = entity.c.body.x;
                proxy(entity.c.body, 'x', body.position, 'x');

                body.position.y = entity.c.body.y;
                proxy(entity.c.body, 'y', body.position, 'y');

                //proxy(entity.c, 'velocity', body, 'velocity');

                Matter.World.add(engine.world, body);
                bodies[entity.uid] = body;
            }
        };

        this.destroy = {
            body: function (entity) {
                Matter.World.remove(engine.world, bodies[entity.uid]);
                delete bodies[entity.uid];
            }
        };

        this.update = {
            body: function (entity) {
                var body = bodies[entity.uid];

                entity.c.body.x = body.position.x;
                entity.c.body.y = body.position.y;

                entity.c.body.velocity = body.velocity;

                entity.c.body.angle = body.angle;

                if (entity.has('player')) {
                    console.log(body.angle);
                }
            },
            graphic: function (entity) {
                if (entity.has('body')) {
                    entity.c.graphic.rotation = entity.c.body.angle;
                }
            }
        };

        this.tickStart = function () {
            var event = {
                timestamp: engine.timing.timestamp
            };

            Matter.Events.on(engine, "beforeRender",  event);
            Matter.Events.on(engine, "beforeTick",  event);
            Matter.Events.on(engine, "tick",  event);

            Matter.Engine.update(engine, 1000/60);

            Matter.Events.on(engine, "afterTick",  event);
            Matter.Events.on(engine, "afterRender",  event);
        };

       this.rayQuery = function (entities, startPoint, endPoint) {
            var queryBodies = [];
            _.each(
                entities,
                function (entity) {
                    queryBodies.push(bodies[entity.uid]);
                }
            );

            return _.any(
                Matter.Query.ray(queryBodies, startPoint, endPoint)
            );
        };
    };

    module.exports = MatterPhysicsSystem;
} ());
