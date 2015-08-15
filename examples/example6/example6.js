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
    var PlayerSystem = function (controls) {
        this.update = {
            player: function (entity, dt) {
                // Controls.
                var moveSpeed = 200;

                // Horizontal movement.
                if (controls.check('left')) {
                    entity.c.velocity.xspeed = -moveSpeed;
                }
                else if (controls.check('right')) {
                    entity.c.velocity.xspeed = moveSpeed;
                }
                else {
                    entity.c.velocity.xspeed = 0;
                }

                // Vertical movement.
                if (controls.check('up')) {
                    entity.c.velocity.yspeed = -moveSpeed;
                }
                else if (controls.check('down')) {
                    entity.c.velocity.yspeed = moveSpeed;
                }
                else {
                    entity.c.velocity.yspeed = 0;
                }

                // Update x position with velocity.
                entity.c.position.x += hitagi.utils.delta(entity.c.velocity.xspeed, dt);

                // Collisions.
                var test = collisionSystem.collideNew(entity, 'block', entity.c.position.x, entity.c.position.y);

                // Get the maximum horizontal resolution from our collisions.
                var maxRes = {
                    x: 0,
                    y: 0
                };

                _.each(
                    test,
                    function (other) {
                        if (Math.abs(other.resolution.x) > Math.abs(maxRes.x)) {
                            maxRes.x = other.resolution.x;
                        }
                    }
                );

                // Resolve the collision horizontally.
                entity.c.position.x += maxRes.x;

                // Update y position with velocity.
                entity.c.position.y += hitagi.utils.delta(entity.c.velocity.yspeed, dt);

                // Check for collisions again.
                test = collisionSystem.collideNew(entity, 'block', entity.c.position.x, entity.c.position.y);

                // Get the maximum vertical resolution velocity from our collisions.
                maxRes = {
                    x: 0,
                    y: 0
                };

                _.each(
                    test,
                    function (other) {
                        if (Math.abs(other.resolution.y) > Math.abs(maxRes.y)) {
                            maxRes.y = other.resolution.y;
                        }
                    }
                );

                // Resolve the collisions vertically.
                entity.c.position.y += maxRes.y;
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

    /*
    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);
    */

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var playerSystem = new PlayerSystem(controls);
    world.register(playerSystem);

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
            });
    };

    var Player = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Graphic({
                type: 'sprite',
                path: 'block.png',
                width: params.width,
                height: params.height
            }))
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: 0,
                yspeed: 0
            }))
            .attach(new hitagi.components.Collision({
                width: params.width,
                height: params.height
            }))
            .attach({
                id: 'player'
            });
    };

    // Load assets, then run game.
    //renderSystem.load([], main);
    main();

    function main () {
        // Create starting room.
        var startRoomEntities = [
            new Background({
                color:0X139BC9
            }),
            new Player({
                height: 32,
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
                y: levelHeight/2
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
