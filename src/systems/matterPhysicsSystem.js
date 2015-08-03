(function () {
    'use strict';

    var _ = require('lodash');
    var Matter = require('matter-js');

    var MatterPhysicsSystem = function (levelWidth, levelHeight) {
        var engine = Matter.Engine.create();
        engine.world.bounds.max = {
            x: levelWidth,
            y: levelHeight
        };

        var bodies = {};

        this.build = {
            body: function (entity) {
                var body = Matter.Bodies.rectangle(
                    entity.c.position.x,
                    entity.c.position.y,
                    entity.c.body.width,
                    entity.c.body.height,
                    {
                        isStatic: entity.c.body.static
                    }
                );
                Matter.World.add(engine.world, body);

                bodies[entity.uid] = body;
            }
        };

        this.update = {
            body: function (entity) {
                var body = bodies[entity.uid];

                entity.c.position.x = body.position.x;
                entity.c.position.y = body.position.y;
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
