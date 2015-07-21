(function () {
    "use strict";

    var levelWidth = 600;
    var levelHeight = 400;

    // Setup pixi.
    var stage = new PIXI.Stage(0x141c22);
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
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
    renderSystem.load('ghostSheet.json', function () {

    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var BorderSystem = function (collisionSystem) {
        this.update = function (entity) {
            if (entity.has('ghost')) {
                var x = entity.c.position.x;
                var y = entity.c.position.y;

                var test = collisionSystem.collide(entity, 'border', x, y);
                if (test.hit) {
                    entity.c.velocity.xspeed = Math.random()*10 - 5;
                    entity.c.velocity.yspeed = Math.random()*10 - 5;
                }

                if (controls.check('up')) {
                    //entity.c.graphic.path = 'ghost2.png';
                    //entity.c.graphic.animationSpeed = 1;
                    entity.c.graphic.currentFrame = 0;
                }
                if (controls.check('down')) {
                    //entity.c.graphic.path = 'ghost2.png';
                    //entity.c.graphic.animationSpeed = 0.05;
                    entity.c.graphic.currentFrame = 1;
                }
            }
        };
    };
    world.register(new BorderSystem(collisionSystem));

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
            .attach(new hitagi.components.Graphic({
                animationSpeed: 0.01,
                path: ['ghost.png', 'ghost2.png'],
                sheet: true,
                type: 'sprite'
            }))
            .attach(new hitagi.components.Collision({
                height: 73,
                width: 51
            }))
            .attach({id: 'ghost'})
    );

    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 0, y: levelHeight/2}))
            .attach(new hitagi.components.Collision({
                height: levelHeight,
                width: 4
            }))
            .attach({id: 'border'})
    );
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth, y: levelHeight/2}))
            .attach(new hitagi.components.Collision({
                height: levelHeight,
                width: 4
            }))
            .attach({id: 'border'})
    );
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: 0}))
            .attach(new hitagi.components.Collision({
                height: 4,
                width: levelWidth
            }))
            .attach({id: 'border'})
    );
    world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: levelHeight}))
            .attach(new hitagi.components.Collision({
                height: 4,
                width: levelWidth
            }))
            .attach({id: 'border'})
    );

    // Load assets.
    renderSystem.load(['ghost.png', 'ghost2.png']);

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world.
        world.tick(1000);

        // Render the world.
        renderer.render(stage);

        // Next frame.
        requestAnimationFrame(animate);
    }
});

} ());