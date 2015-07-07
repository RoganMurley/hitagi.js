(function () {
    "use strict";

    // Setup pixi.
    var stage = new PIXI.Stage(0x141c22);
    var renderer = PIXI.autoDetectRenderer(600, 400);
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

    var PaddleSystem = function () {
        var that = this;

        that.update = function (entity, dt) {
            if (entity.has('paddle')) {
                if (controls.check('up')) {
                    entity.c.velocity.yspeed -= entity.c.paddle.speed;
                }
                if (controls.check('down')) {
                    entity.c.velocity.yspeed += entity.c.paddle.speed;
                }
                entity.c.velocity.yspeed *= entity.c.paddle.friction;
            }
        };
    };
    world.register(new PaddleSystem());

    // Add entities.
    world.add(
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
                x1: 0,
                y1: 0,
                x2: 16,
                y2: 128
            }))
            .attach({
                'id': 'paddle',
                'speed': 1,
                'friction': 0.9
            })
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
