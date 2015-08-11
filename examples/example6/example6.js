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


    // Define systems.
    var GravitySystem = function (collisionSystem) {
        this.update = {
            gravity: function (entity) {
                entity.c.velocity.yspeed += entity.c.gravity.magnitude;
                entity.c.gravity.grounded = false;

                var x = entity.c.position.x;
                var y = entity.c.position.y;
                var test = collisionSystem.collide(entity, 'block', x, y);
                if (test.hit) {
                    var other = test.entity;
                    var yDisplacement = y - other.c.position.y;
                    var move = -(entity.c.collision.height + yDisplacement)
                    
                    entity.c.position.y += move;
                    entity.c.velocity.yspeed = 0;
                    entity.c.gravity.grounded = true;
                }
            }
        };
    };

    var PlayerSystem = function (controls) {
        this.update = {
            player: function (entity) {
                // Controls.
                if (controls.check('jump')) {
                    if (entity.c.gravity.grounded) {
                        entity.c.velocity.yspeed = -500;
                    }
                }

                if (controls.check('left')) {
                    entity.c.velocity.xspeed = -600;
                }
                else if (controls.check('right')) {
                    entity.c.velocity.xspeed = 600;
                }
                else {
                    entity.c.velocity.xspeed = 0;
                }

                // Collisions.
                var x = entity.c.position.x;
                var y = entity.c.position.y;
                var test = collisionSystem.collide(entity, 'block', x, y);
                if (test.hit) {
                    var other = test.entity;
                    var xDisplacement = x - other.c.position.x;
                    var move = -(entity.c.collision.width + xDisplacement)
                    
                    entity.c.position.x += move;
                    entity.c.velocity.xspeed = 0;
                }
            }
        };
    };

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    var soundSystem = new hitagi.systems.SoundSystem();
    world.register(soundSystem);

    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var gravitySystem = new GravitySystem(collisionSystem);
    world.register(gravitySystem);

    var playerSystem = new PlayerSystem(controls);
    world.register(playerSystem);

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
                id: 'gravity',
                magnitude: 10
            })
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
                y: levelHeight - 128
            }),
            new Block({
                height: 32,
                width: levelWidth,
                x: levelWidth/2,
                y: levelHeight - 16
            }),
            new Block({
                height: levelHeight,
                width: 32,
                x: 16,
                y: levelHeight/2
            }),
            new Block({
                height: levelHeight,
                width: 32,
                x: levelWidth - 16,
                y: levelHeight/2
            })
        ];

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
