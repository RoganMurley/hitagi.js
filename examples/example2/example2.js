(function () {
    "use strict";

    // Setup dimensions.
    var levelWidth = 600;
    var levelHeight = 400;

    // Setup pixi.
    var stage = new PIXI.Stage(0x141c22);
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Setup controls.
    var controls = new hitagi.Controls();
    controls.bind(38, 'up');
    controls.bind(40, 'down');

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    world.register(new hitagi.systems.VelocitySystem());

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var PlayerPaddleSystem = function () {
        var that = this;

        var verticalBounce = function (entity) {
            entity.c.velocity.yspeed *= -1.4;
        };

        that.update = function (entity, dt) {
            if (entity.has('player') && entity.has('paddle')) {
                // Handle player input.
                if (controls.check('up')) {
                    entity.c.velocity.yspeed -= entity.c.paddle.speed;
                }
                if (controls.check('down')) {
                    entity.c.velocity.yspeed += entity.c.paddle.speed;
                }

                // Add friction to paddle.
                entity.c.velocity.yspeed *= entity.c.paddle.friction;

                // Stop paddle from leaving screen.
                if (entity.c.position.y + entity.c.velocity.yspeed < 0) {
                    verticalBounce(entity);
                }
                if (entity.c.position.y + entity.c.velocity.yspeed + entity.c.paddle.height > levelHeight) {
                    verticalBounce(entity);
                }
            }
        };
    };
    world.register(new PlayerPaddleSystem());

    var BallSystem = function () {
        var that = this;

        that.update = function (entity, dt) {
            if (entity.has('ball')) {
                var x = entity.c.position.x;
                var y = entity.c.position.y;

                if (collisionSystem.collide(entity, 'paddle', x, y).hit) {
                    entity.c.velocity.xspeed *= -1.1;
                }
            }
        };
    };
    world.register(new BallSystem());

    // Add entities.
    var player = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: 8,
                y: 0
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: 0,
                yspeed: 0
            }))
            .attach(new hitagi.components.Rectangle({
                color: 0xFFFF00,
                x1: 0,
                y1: 0,
                x2: 16,
                y2: 128
            }))
            .attach({'id': 'player'})
            .attach({
                id: 'paddle',
                deps: ['velocity'],
                friction: 0.9,
                height: 128,
                speed: 1,
                width: 16
            })
            .attach(new hitagi.components.Collision({
                height: 128,
                width: 16
            }))
    );

    var opponent = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth - 24,
                y: 0
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: 0,
                yspeed: 0
            }))
            .attach(new hitagi.components.Rectangle({
                color: 0xFFFF00,
                x1: 0,
                y1: 0,
                x2: 16,
                y2: 128
            }))
            .attach({
                id: 'paddle',
                deps: ['velocity'],
                friction: 0.9,
                height: 128,
                speed: 1,
                width: 16
            })
            .attach(new hitagi.components.Collision({
                height: 128,
                width: 16
            }))
    );

    var ball = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth / 2,
                y: levelHeight / 2
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: -5,
                yspeed: 0
            }))
            .attach(new hitagi.components.Rectangle({
                color: 0xFFFFFF,
                x1: 0,
                y1: 0,
                x2: 16,
                y2: 16
            }))
            .attach(new hitagi.components.Collision({
                height: 16,
                width: 16
            }))
            .attach({'id': 'ball'})
    );

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world, using a fixed delta time.
        world.tick(1000);

        // Render the world.
        renderer.render(stage);

        // Next frame.
        requestAnimationFrame(animate);
    }

} ());
