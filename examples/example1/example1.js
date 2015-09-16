// Powered by https://github.com/RoganMurley/hitagi.js
(function () {
    "use strict";

    // Setup world.
    var world = new hitagi.World();

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem();
    world.register(renderSystem);

    // Put the renderer view on the page.
    document.body.appendChild(renderSystem.view)

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

        // Render.
        renderSystem.render();

        // Next frame.
        requestAnimationFrame(animate);
    }

} ());
