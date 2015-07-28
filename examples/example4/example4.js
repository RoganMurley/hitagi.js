(function () {
    "use strict";

    var levelWidth = window.innerWidth;
    var levelHeight = window.innerHeight;

    // Setup pixi.
    var stage = new PIXI.Container();
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Setup controls.
    var controls = new hitagi.Controls();
    controls.bind('m1', 'flap');

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);
    renderSystem.load(['flappybird.png', 'pipe.png', 'floor.png'], function () {

    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var GravitySystem = function () {
        this.update = {
            gravity: function (entity, dt) {
                if (entity.c.velocity.yspeed < entity.c.gravity.terminal) {
                    entity.c.velocity.yspeed += hitagi.utils.delta(entity.c.gravity.magnitude, dt);
                }
            }
        };
    };
    world.register(new GravitySystem());

    var BirdSystem = function (world, controls, collisionSystem) {
        var that = this;
        var savedState;

        this.saveState = function () {
            savedState = world.save();
        };

        this.loadState = function () {
            world.clear();
            world.load(savedState);
        };

        this.update = {
            bird: function (entity, dt) {
                if (controls.check('flap', true)) {
                    entity.c.velocity.yspeed = -entity.c.bird.flapSpeed;
                }

                var x = entity.c.position.x;
                var y = entity.c.position.y;
                var test = collisionSystem.collide(entity, 'kill', x, y);
                if (test.hit) {
                    that.loadState();
                    return;
                }

                entity.c.graphic.rotation = entity.c.velocity.yspeed/15;

                if (entity.c.position.y < 0) {
                    entity.c.position.y = 0;
                    entity.c.velocity.yspeed = 0;
                }

                if (entity.c.position.y > levelHeight) {
                    that.loadState();
                }
            }
        };
    };
    var birdSystem = new BirdSystem(world, controls, collisionSystem);
    world.register(birdSystem);

    // Pipe stuff.
    var Pipe = function (params) {
        var pipe = new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth + 200, y: params.y}))
            .attach(new hitagi.components.Velocity({xspeed: -5, yspeed: 0}))
            .attach(new hitagi.components.Graphic({
                type:'sprite',
                path: 'pipe.png',
                scale: {
                    x: 1,
                    y: params.yscale
                },
                z: 10
            }))
            .attach(new hitagi.components.Collision({
                height: 793,
                width: 138
            }))
            .attach({id: 'pipe'})
            .attach({id: 'kill'});

        return pipe;
    };

    var PipeSystem = function (world) {
        this.update = {
            pipe: function (entity) {
                if (entity.c.position.x < -100) {
                    world.remove(entity);
                }
            },

            score: function (entity) {
                // Update timer.
                entity.c.score.pipeTimer--;

                // Generate pipes if they're ready.
                if (entity.c.score.pipeTimer <= 0) {
                    entity.c.score.pipeTimer = entity.c.score.pipeTimerMax;

                    var pipeHeight = 793;
                    var pipeGap = 120;
                    var minimumTopDistance = 200;
                    var offset = Math.random() * (pipeHeight/2) - minimumTopDistance;

                    world.add(
                        new Pipe({
                            y: -offset,
                            yscale: -1
                        })
                    );
                    world.add(
                        new Pipe({
                            y: pipeHeight + pipeGap - offset,
                            yscale: 1
                        })
                    );
                }
            }
        };
    };
    world.register(new PipeSystem(world));

    var FloorSystem = function () {
        this.update = {
            floor: function (entity) {
                if (entity.c.position.x <= -154) {
                    entity.c.position.x = 308 * 11;
                }
            }
        };
    };
    world.register(new FloorSystem(world));

    // Add entities.
    var player = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 320, y: levelHeight/2}))
            .attach(new hitagi.components.Velocity({xspeed: 0, yspeed: 0}))
            .attach(new hitagi.components.Graphic({
                type: 'sprite',
                path: 'flappybird.png'
            }))
            .attach({
                id: 'gravity',
                magnitude: 0.6,
                terminal: 12
            })
            .attach({
                id: 'bird',
                flapSpeed: 10
            })
            .attach(new hitagi.components.Collision({
                height: 18,
                width: 32
            }))
    );

    var background = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: levelHeight/2}))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: 0X139BC9,
                height: levelHeight,
                width: levelWidth,
                z: -100
            }))
    );

    var score = world.add(
        new hitagi.Entity()
            .attach({
                id: 'score',
                pipeTimer: 0,
                pipeTimerMax: 85
            })
    );

    for (var i = 0; i < 12; i++) {
        world.add(
            new hitagi.Entity()
                .attach(new hitagi.components.Position({
                    x: 308 * i,
                    y: levelHeight - 108/2
                }))
                .attach(new hitagi.components.Velocity({
                    xspeed: -5,
                    yspeed: 0
                }))
                .attach(new hitagi.components.Graphic({
                    type: 'sprite',
                    path: 'floor.png',
                    z: 1000
                }))
                .attach(new hitagi.components.Collision({
                    height: 108,
                    width: 308
                }))
                .attach({id: 'floor'})
                .attach({id: 'kill'})
        );
    }
    // Save a clean state for reloading the game.
    birdSystem.saveState();

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world.
        world.tick(1000);

        // Render the world.
        renderer.render(stage);

        // Next frame.
        requestAnimationFrame(animate);
    }
});

} ());
