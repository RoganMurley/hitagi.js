(function () {
    "use strict";

    var levelWidth = window.innerWidth;
    var levelHeight = window.innerHeight;

    // Keep the game window sensible dimensions.
    if (levelHeight < 800) {
        levelHeight = 800;
    }

    // Setup pixi.
    var stage = new PIXI.Container();
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Setup rooms.
    var rooms = new hitagi.Rooms(world);

    // Setup controls.
    var controls = new hitagi.Controls();
    controls.bind('m1', 'flap');
    controls.bind('m1', 'start');

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);
    renderSystem.load(['flappybird.png', 'pipe.png', 'floor.png'], function () {

    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var soundSystem = new hitagi.systems.SoundSystem();
    world.register(soundSystem);
    soundSystem.volume = 0;

    var GravitySystem = function () {
        this.update = {
            gravity: function (entity, dt) {
                // Accelerate entity until it reaches terminal velocity.
                if (entity.c.velocity.yspeed < entity.c.gravity.terminal) {
                    entity.c.velocity.yspeed += hitagi.utils.delta(entity.c.gravity.magnitude, dt);
                }
            }
        };
    };
    world.register(new GravitySystem());

    var BirdSystem = function (world, rooms, controls, collisionSystem, soundSystem) {
        var that = this;
        var score = null;

        this.build = {
            score: function (entity) {
                score = entity;
            }
        };

        this.update = {
            bird: function (entity, dt) {
                // Flap wings if clicking,
                if (controls.check('flap', true)) {
                    entity.c.velocity.yspeed = -entity.c.bird.flapSpeed;
                    soundSystem.play('flap.ogg');
                }

                // Score if we hit a goal.
                if (score) {
                    test = collisionSystem.collide(entity, 'goal', x, y);

                    if (test.hit) {
                        if (!test.entity.c.goal.done) {
                            test.entity.c.goal.done = true;
                            score.c.cleared = test.entity.c.goal.n;
                            score.c.graphic.copy = test.entity.c.goal.n;
                            soundSystem.play('clear.ogg');
                        }
                    }
                }

                // Rotate bird depending on velocity.
                entity.c.graphic.rotation = entity.c.velocity.yspeed/15;

                // Stop bird from leaving the top of the screen.
                if (entity.c.position.y < 0) {
                    entity.c.position.y = 0;
                    entity.c.velocity.yspeed = 0;
                }

                // Test for hitting something which kills you.
                var x = entity.c.position.x;
                var y = entity.c.position.y;

                var test = collisionSystem.collide(entity, 'kill', x, y);
                if (test.hit) {
                    rooms.loadRoom('start');
                    soundSystem.play('die.ogg');
                    return;
                }
            }
        };
    };

    var birdSystem = new BirdSystem(
        world,
        rooms,
        controls,
        collisionSystem,
        soundSystem
    );
    world.register(birdSystem);

    var Goal, Pipe; // PipeSystem needs these entities defined.
    var PipeSystem = function (world) {
        this.update = {
            pipe: function (entity) {
                if (entity.c.position.x < -100) {
                    world.remove(entity);
                }
            },

            pipeGenerator: function (entity, dt) {
                entity.c.pipeGenerator.timer -= hitagi.utils.delta(1, dt);

                if (entity.c.pipeGenerator.timer <= 0) {

                    entity.c.pipeGenerator.timer = entity.c.pipeGenerator.period;
                    entity.c.pipeGenerator.created++;

                    var pipeHeight = 793;
                    var pipeGap = 145;
                    var minimumEdgeDistance = levelHeight * 0.2;
                    var pipePosition = minimumEdgeDistance - (Math.random() * pipeHeight/2);

                    world.add(
                        new Pipe({
                            y: pipePosition,
                            yscale: -1
                        })
                    );
                    world.add(
                        new Pipe({
                            y: pipePosition + pipeGap + pipeHeight,
                            yscale: 1
                        })
                    );
                    world.add(new Goal({
                        width: 60,
                        height: pipeGap,
                        y: pipePosition + pipeHeight/2 + pipeGap/2,
                        n: entity.c.pipeGenerator.created
                    }));
                }
            }
        };
    };
    world.register(new PipeSystem(world));

    var FloorSystem = function () {
        this.update = {
            floor: function (entity) {
                // Wrap the floor horizontally.
                if (entity.c.position.x <= -154) {
                    entity.c.position.x = 308 * 11;
                }
            }
        };
    };
    world.register(new FloorSystem(world));

    var StartSystem = function (controls) {
        var bird = null,
            generator = null,
            start = null;

        this.build = {
            bird: function (entity) {
                bird = entity;
            },
            pipeGenerator: function (entity) {
                generator = entity;
            },
            start: function (entity) {
                start = entity;
            }
        };

        this.destroy = {
            bird: function () {
                bird = null;
            },
            pipeGenerator: function () {
                generator = null;
            },
            start: function () {
                start = null;
            }
        };

        this.tickStart = function () {
            if (!start.c.started) {
                if (controls.check('start')) {
                    // Hide text.
                    start.c.graphic.visible = false;

                    // Start pipe generator.
                    generator.c.pipeGenerator.timer = 85;
                    generator.c.pipeGenerator.period = 85;

                    // Start gravity.
                    bird.c.gravity.magnitude = 0.6;

                    start.c.started = true;
                }
            }
        };
    };
    world.register(new StartSystem(controls));


    // Define entities.
    var Player = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({xspeed: 0, yspeed: 0}))
            .attach(new hitagi.components.Graphic({
                type: 'sprite',
                path: 'flappybird.png'
            }))
            .attach({
                id: 'gravity',
                magnitude: 0,
                terminal: 12
            })
            .attach({
                id: 'bird',
                flapSpeed: 10
            })
            .attach(new hitagi.components.Collision({
                height: 18,
                width: 32
            }));
    };

    Goal = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth + 200,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: -5,
                yspeed: 0
            }))
            .attach(new hitagi.components.Collision({
                width: params.width,
                height: params.height
            }))
            .attach({
                id: 'goal',
                n: params.n,
                done: false
            });
    };

    Pipe = function (params) {
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

    var Background = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: levelHeight/2}))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: params.color,
                height: levelHeight,
                width: levelWidth,
                z: -100
            }));
    };

    var Floor = function (params) {
        return new hitagi.Entity()
                .attach(new hitagi.components.Position({
                    x: params.x,
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
                .attach({id: 'kill'});
    };

    var Score = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 25, y: 10}))
            .attach(new hitagi.components.Graphic({
                type: 'text',
                copy: '0',
                options: {
                    font: '128px Arial',
                    fill: 'white'
                },
                z: Infinity
            }))
            .attach({
                id: 'score',
                cleared: 0
            });
    };

    var PipeGenerator = function (params) {
        return new hitagi.Entity()
            .attach({
                id: 'pipeGenerator',
                created: 0,
                period: params.period,
                timer: params.period
            });
    };

    // Create starting room.
    var startRoomEntities = [
        new Score(),
        new Background({
            color: 0X139BC9
        }),
        new Player({
            x: levelWidth * 0.15,
            y: levelHeight / 2
        }),
        new PipeGenerator({
            period: Infinity
        }),
        new hitagi.Entity()
            .attach({
                id: 'start',
                started: false
            })
            .attach(new hitagi.components.Position({
                x: levelWidth / 2,
                y: levelHeight / 2
            }))
            .attach(new hitagi.components.Graphic({
                type: 'text',
                copy: 'Click to flap!'
            }))
    ];
    for (var i = 0; i < 12; i++) {
        startRoomEntities.push(new Floor({x: i * 308}));
    }

    rooms.saveRoom('start', startRoomEntities);
    rooms.loadRoom('start');

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
