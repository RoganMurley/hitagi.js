// Powered by https://github.com/RoganMurley/hitagi.js
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

    // Setup rooms.
    var rooms = new hitagi.Rooms(world);

    // Setup controls.
    var controls = new hitagi.Controls();
    controls.bind(82, 'reload');

    controls.bind(32, 'jump');

    controls.bind(37, 'left');
    controls.bind(39, 'right');
    controls.bind(38, 'up');
    controls.bind(40, 'down');

    controls.bind('m1', 'spawn');


    // Define systems.

    // We need to update horizontal and vertical velocity seperately for our collision resolution technique.
    // The default hitagi VelocitySystem doesn't support this, but it's easy to make our own.
    var HorizontalVelocitySystem = function () {
        this.$priority = 4;
        this.update = {
            velocity: function (entity, dt) {
                entity.c.position.x += hitagi.utils.delta(entity.c.velocity.xspeed, dt);
            }
        };
    };

    var VerticalVelocitySystem = function () {
        this.$priority = 2;
        this.update = {
            velocity: function (entity, dt) {
                entity.c.position.y += hitagi.utils.delta(entity.c.velocity.yspeed, dt);
            }
        };
    };

    var PlayerControlsSystem = function (controls) {
        this.$priority = 10;

        var moveSpeed = 200;

        this.update = {
            player: function (entity) {
                // Horizontal movement.
                if (controls.check('left')) {
                    entity.c.velocity.xspeed = -moveSpeed;
                }
                else if (controls.check('right')) {
                    entity.c.velocity.xspeed = moveSpeed;
                } else {
                    entity.c.velocity.xspeed = 0;
                }

                if (controls.check('up')) {
                    if (entity.c.gravity.grounded) {
                        entity.c.velocity.yspeed = -600;
                    }
                }
            }
        };
    };

    var GravitySystem = function (collisionSystem) {
        this.$priority = -Infinity;
        this.update = {
            gravity: function (entity, dt) {
                if (entity.c.velocity.yspeed < 1000) {
                    entity.c.velocity.yspeed += 35;
                }

                var test = collisionSystem.collide(entity, 'solid');

                if (!test.length) {
                    test = collisionSystem.collide(entity, 'solid', entity.c.position.x, entity.c.position.y + 1);
                    if (test.length) {
                        entity.c.velocity.yspeed = 0;
                        entity.c.gravity.grounded = true;
                    } else {
                        entity.c.gravity.grounded = false;
                    }

                    test = collisionSystem.collide(entity, 'solid', entity.c.position.x, entity.c.position.y - 1);
                    if (test.length) {
                        entity.c.velocity.yspeed *= -0.3;
                    }
                }
            }
        };
    };

    var HorizontalBodySystem = function () {
        this.$priority = 3;
        this.update = {
            body: function (entity, dt) {
                var test = collisionSystem.collide(entity, 'solid');
                if (test.length) {
                    var potentialResolutions = _.pluck(test, 'resolution.x');
                    var maxResolution = _.max(potentialResolutions, Math.abs);

                    entity.c.position.x += maxResolution;
                }
            }
        };
    };

    var VerticalBodySystem = function () {
        this.$priority = 1;
        this.update = {
            body: function (entity, dt) {
                var test = collisionSystem.collide(entity, 'solid');
                if (test.length) {
                    var potentialResolutions = _.pluck(test, 'resolution.y');
                    var maxResolution = _.max(potentialResolutions, Math.abs);

                    entity.c.position.y += maxResolution;
                }
            }
        };
    };

    var SpawnSystem = function (world, controls) {
        this.tickStart = function () {
            if (controls.check('spawn', true)) {
                var mousePos = controls.getMousePos();
                world.add(new Block({
                    width: 32,
                    height: 32,
                    x: mousePos.x,
                    y: mousePos.y
                }));
            }
        };
    };

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    var soundSystem = new hitagi.systems.SoundSystem();
    world.register(soundSystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var horizontalVelocitySystem = new HorizontalVelocitySystem();
    world.register(horizontalVelocitySystem);

    var verticalVelocitySystem = new VerticalVelocitySystem();
    world.register(verticalVelocitySystem);

    var playerControlsSystem = new PlayerControlsSystem(controls);
    world.register(playerControlsSystem);

    var horizontalBodySystem = new HorizontalBodySystem();
    world.register(horizontalBodySystem);

    var verticalBodySystem = new VerticalBodySystem();
    world.register(verticalBodySystem);

    var gravitySystem = new GravitySystem(collisionSystem);
    world.register(gravitySystem);

    var spawnSystem = new SpawnSystem(world, controls);
    world.register(spawnSystem);

    // Define components.
    'components';

    // Define entities.
    var Background = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth/2,
                y: levelHeight/2
            }))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: params.color,
                height: levelHeight,
                width: levelWidth,
                z: -Infinity
            }));
    };

    var Block = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: 0XF0433A,
                width: params.width,
                height: params.height
            }))
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Collision({
                width: params.width,
                height: params.height
            }))
            .attach({
                id: 'block'
            })
            .attach({
                id: 'solid'
            });
    };

    var Player = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                width: params.width,
                height: params.height
            }))
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach (new hitagi.components.Velocity({
                xspeed: 0,
                yspeed: 0
            }))
            .attach(new hitagi.components.Collision({
                width: params.width,
                height: params.height
            }))
            .attach({
                id: 'player'
            })
            .attach({
                id: 'body'
            })
            .attach({
                id: 'gravity',
                grounded: false
            });
    };

    // Load assets, then run game.
    renderSystem.load(['block.png'], main);
    //main();

    function main () {
        // Create starting room.
        var startRoomEntities = [
            new Background({
                color: 0X2E112D
            }),
            new Player({
                height: 48,
                width: 32,
                x: levelWidth/2,
                y: levelHeight/2
            }),
            new Block({
                height: 32,
                width: 32,
                x: levelWidth/2 + 128,
                y: levelHeight/2
            }),
            new Block({
                height: 32,
                width: 32,
                x: levelWidth/2 - 128,
                y: levelHeight/2 - 32
            })
        ];

        _.times(20, function (i) {
            startRoomEntities.push(
                new Block({
                    height: 32,
                    width: 32,
                    x: i * 32,
                    y: levelHeight/2 + 64
                })
            );

            startRoomEntities.push(
                new Block({
                    height: 32,
                    width: 32,
                    x: levelWidth/2 + 300,
                    y: i * 32
                })
            );
        });

        startRoomEntities.push(
            new Block({
                height: 64,
                width: 200,
                x: levelWidth/2,
                y: levelHeight -202
            })
        );

        // Load starting room.
        rooms.saveRoom('start', startRoomEntities);
        rooms.loadRoom('start');

        // Setup game loop.
        requestAnimationFrame(animate);

        function animate() {
            // Update the world.
            world.tick(1000/60);

            // Render the world.
            renderer.render(stage);

            // Next frame.
            requestAnimationFrame(animate);
        }
}

} ());
