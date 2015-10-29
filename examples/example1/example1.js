// Powered by https://github.com/RoganMurley/hitagi.js
'use strict';

var world = new hitagi.World();
var renderSystem = world.register(new hitagi.systems.PixiRenderSystem());

document.body.appendChild(renderSystem.view);

world.add(
    new hitagi.prefabs.Static({x: 300, y: 200})
        .attach(new hitagi.components.graphics.Text({copy: 'Hello, World!'}))
);

world.register({
    update: {
        text: function (entity) {
            entity.c.text.rotation += 0.01;
        }
    }
});

(function animate() {
    world.tick();
    renderSystem.render();
    requestAnimationFrame(animate);
}());
