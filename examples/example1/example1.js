// Powered by https://github.com/RoganMurley/hitagi.js
'use strict';

var world = new hitagi.World();
var renderSystem = world.register(new hitagi.systems.PixiRenderSystem());

document.body.appendChild(renderSystem.view);

world.add(
    new hitagi.Entity()
        .attach(new hitagi.components.Position({x: 300, y: 200}))
        .attach(new hitagi.components.graphics.Graphic())
        .attach(new hitagi.components.graphics.Text({copy: 'Hello, World!'}))
);

(function animate() {
    world.tick(1000/60);
    renderSystem.render();
    requestAnimationFrame(animate);
}());
