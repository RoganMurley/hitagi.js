(function () {
    "use strict";

    // Setup pixi.
    var stage = new PIXI.Stage(0x141c22);
    var renderer = PIXI.autoDetectRenderer(600, 400);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);
    world.register(new hitagi.systems.VelocitySystem());

    // Add entities.
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: 0,
                y: 0
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: 10,
                yspeed: 0
            }))
            .attach(new hitagi.components.Rectangle({
                x1: 0,
                y1: 0,
                x2: 32,
                y2: 32
            }))
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
