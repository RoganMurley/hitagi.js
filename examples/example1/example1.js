(function () {
    "use strict";

    var hitagi = require('hitagi.js');
    var pixi = require('pixi.js');

    // Setup pixi.js.
    var stage = new pixi.Stage(0x141c22);
    var renderer = pixi.autoDetectRenderer(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    // Add entities.
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 0, y: 0}))
            .attach(new hitagi.components.Text(
                {
                    txt: 'Hello, World!',
                    options: {
                        font: '128px monospace',
                        fill: 'white'
                    }
                }
            ))
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
