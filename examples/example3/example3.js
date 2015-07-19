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

    // Add entities.
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 20, y: 20}))
            .attach(new hitagi.components.Graphic({
                path: 'ghost.png',
                type: 'sprite'
            }))
    );

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world.
        world.tick();

        // Render the world.
        renderer.render(stage);

        // Next frame.
        requestAnimationFrame(animate);
    }

} ());
