// Powered by https://github.com/RoganMurley/hitagi.js
'use strict';

var world = new hitagi.World();
var renderSystem = world.register(new hitagi.systems.PixiRenderSystem());

document.body.appendChild(renderSystem.view);

world.add(
    new hitagi.prefabs.Base({x: 300, y: 200})
        .attach(new hitagi.components.graphics.Text({copy: 'Hello, World!'}))
);

(function animate() {
    world.tick(1000/60); // Hacky fixed timestep as it's just an example!
    renderSystem.render();
    requestAnimationFrame(animate);
}());
