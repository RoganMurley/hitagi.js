// Powered by https://github.com/RoganMurley/hitagi.js
(function () {
    "use strict";

    // Setup pixi.
    var renderer = PIXI.autoDetectRenderer(600, 400);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem();
    world.register(renderSystem);

    // Add entities.
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: 300,
                y: 200
            }))
            .attach(new hitagi.components.graphics.Graphic())
            .attach(new hitagi.components.graphics.Text({
                copy: 'Hello, World!',
                style: {
                    font: '32px monospace',
                    fill: 'white'
                }
            }))
    );

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world.
        world.tick();

        // Render the world.
        renderSystem.render(renderer);

        // Next frame.
        requestAnimationFrame(animate);
    }

} ());
