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

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

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
                    entity.c.graphic.path = 'ghost2.png';
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
                path: 'ghost.png',
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

} ());
