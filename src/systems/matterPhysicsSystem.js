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
                    entity.c.position.x,
                    entity.c.position.y,
                    entity.c.body.width,
                    entity.c.body.height,
                    {
                        angle: entity.c.body.angle,
                        isStatic: entity.c.body.static
                    }
                );

                // Set and proxy stuff.
                body.angle = entity.c.body.angle;
                proxy(entity.c.body, 'angle', body, 'angle');

                proxy(entity.c.body, 'width', body, 'width');
                proxy(entity.c.body, 'height', body, 'height');

                proxy(entity.c, 'position', body, 'position');
                proxy(entity.c, 'velocity', body, 'velocity');

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

                entity.c.position.x = body.position.x;
                entity.c.position.y = body.position.y;

                entity.c.velocity.x = body.velocity.x;
                entity.c.velocity.y = body.velocity.y;

                entity.c.body.angle = body.angle;
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
    };

    module.exports = MatterPhysicsSystem;
} ());
