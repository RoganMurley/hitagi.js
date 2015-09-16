// Powered by https://github.com/RoganMurley/hitagi.js
(function () {
    "use strict";

    var levelWidth = 600;
    var levelHeight = 400;

    // Setup pixi.
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Register systems.
    var controlsSystem = new hitagi.systems.ControlsSystem();
    controlsSystem.bind(38, 'up');
    controlsSystem.bind(40, 'down');
    world.register(controlsSystem);

    var renderSystem = new hitagi.systems.PixiRenderSystem();
    world.register(renderSystem);
    renderSystem.load('ghostSheet.json', function () {

    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var BorderSystem = function (collisionSystem, controlsSystem) {
        this.update = {
            ghost: function (entity) {
                var test = collisionSystem.collide(entity, 'border');
                if (test.length) {
                    entity.c.velocity.xspeed = Math.random()*10 - 5;
                    entity.c.velocity.yspeed = Math.random()*10 - 5;
                }

                if (controlsSystem.check('up')) {
                    entity.c.sprite.currentFrame = 0;
                }
                if (controlsSystem.check('down')) {
                    entity.c.sprite.currentFrame = 1;
                }

                entity.c.sprite.rotation += 0.01;
            },
            rose: function (entity) {
                if (Math.random() < entity.c.rose.activity) {
                    entity.c.polygon.points = entity.c.polygon.points.concat([
                        Math.random() * levelWidth,
                        Math.random() * levelHeight
                    ]);
                    entity.c.rose.activity *= 1.01;
                    entity.c.polygon.color = 0xffffff * Math.random();
                }
            }
        };
    };
    world.register(new BorderSystem(collisionSystem, controlsSystem));

    // Add entities.
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth/2,
                y: levelHeight/2
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: Math.random()*10 - 5,
                yspeed: Math.random()*10 - 5
            }))
            .attach(new hitagi.components.graphics.Graphic({
                scale: {
                    x: 0.6,
                    y: 0.6
                },
                z: 1000
            }))
            .attach(new hitagi.components.graphics.Sprite({
                animationSpeed: 0.01,
                path: ['ghost.png', 'ghost2.png']
            }))
            .attach(new hitagi.components.Collision({
                height: 73,
                width: 51
            }))
            .attach({$id: 'ghost'})
    );

    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 0, y: levelHeight/2}))
            .attach(new hitagi.components.Collision({
                height: levelHeight,
                width: 4
            }))
            .attach({$id: 'border'})
    );
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth, y: levelHeight/2}))
            .attach(new hitagi.components.Collision({
                height: levelHeight,
                width: 4
            }))
            .attach({$id: 'border'})
    );
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: 0}))
            .attach(new hitagi.components.Collision({
                height: 4,
                width: levelWidth
            }))
            .attach({$id: 'border'})
    );
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: levelHeight}))
            .attach(new hitagi.components.Collision({
                height: 4,
                width: levelWidth
            }))
            .attach({$id: 'border'})
    );

    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: levelHeight/2}))
            .attach(new hitagi.components.graphics.Graphic({
                alpha: 0.2
            }))
            .attach(new hitagi.components.graphics.Line({
                thickness: 5,
                x1: 0,
                y1: 0,
                x2: levelWidth,
                y2: levelHeight
            }))
    );

    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.graphics.Graphic({
                relative: false
            }))
            .attach(new hitagi.components.graphics.Polygon({
                points: [
                    0, 0,
                    100, 100,
                    150, 100
                ]
            }))
            .attach({
                $id: 'rose',
                activity: 0.01
            })
    );

    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.graphics.Graphic({
                relative: false,
                translate: {
                    x: levelWidth * 0.6,
                    y: levelHeight * 0.7
                },
                z: -Infinity
            }))
            .attach(new hitagi.components.graphics.Ellipse({
                color: 0x910e2f,
                height: levelHeight,
                width: levelWidth
            }))
    );

    // Load assets.
    renderSystem.load(['g.png', 'g2.png']);

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world.
        world.tick(1000);

        // Render the world.
        renderSystem.render(renderer);

        // Next frame.
        requestAnimationFrame(animate);
    }
});

} ());
