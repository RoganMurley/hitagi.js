(function () {
    "use strict";

    var levelWidth = window.innerWidth;
    var levelHeight = window.innerHeight;

    // Setup pixi.
    var stage = new PIXI.Container();
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Setup controls.
    var controls = new hitagi.Controls();
    controls.bind(32, 'flap');

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);
    renderSystem.load('ghostSheet.json', function () {

    var velocitySystem = new hitagi.systems.VelocitySystem();
    world.register(velocitySystem);

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var GravitySystem = function () {
        this.update = {
            gravity: function (entity, dt) {
                if (entity.c.velocity.yspeed < entity.c.gravity.terminal) {
                    entity.c.velocity.yspeed += hitagi.utils.delta(entity.c.gravity.magnitude, dt);
                }
            }
        };
    };
    world.register(new GravitySystem());

    var BirdSystem = function (controls, collisionSystem) {
        this.update = {
            bird: function (entity, dt) {
                if (controls.check('flap', true)) {
                    entity.c.velocity.yspeed = -entity.c.bird.flapSpeed;
                }

                var x = entity.c.position.x;
                var y = entity.c.position.y;
                var test = collisionSystem.collide(entity, 'pipe', x, y);
                if (test.hit) {
                    console.log('hitting');
                }
            }
        };
    };
    world.register(new BirdSystem(controls, collisionSystem));

    // Pipe stuff.
    var Pipe = function (params) {
        var pipe = new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth, y: 0}))
            .attach(new hitagi.components.Velocity({xspeed: -20, yspeed: 0}))
            .attach(new hitagi.components.Graphic({
                type:'rectangle',
                alpha: 0.4,
                color: 0XDE2B58,
                width: 64,
                height: params.height
            }))
            .attach(new hitagi.components.Collision({
                height: params.height,
                width: 64
            }))
            .attach({id: 'pipe'});

        if (params.top) {
            pipe.c.position.y = 0;
        } else if (params.bottom) {
            pipe.c.position.y = levelHeight;
        }

        return pipe;
    };

    var PipeSystem = function (world) {
        this.tickStart = function () {
            world.add(
                new Pipe({
                    height: Math.random() * levelHeight*0.6,
                    top: true
                })
            );
            world.add(
                new Pipe({
                    height: Math.random() * levelHeight*0.6,
                    bottom: true
                })
            );
        };

        this.update = {
            pipe: function (entity) {
                if (entity.c.position.x < -100) {
                    world.remove(entity);
                }
            }
        };
    };
    world.register(new PipeSystem(world));

    // Add entities.
    var player = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 128, y: levelHeight/2}))
            .attach(new hitagi.components.Velocity({xspeed: 0, yspeed: 0}))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: 0XE3D943,
                height: 18,
                width: 32
            }))
            .attach({
                id: 'gravity',
                magnitude: 0.45,
                terminal: 12
            })
            .attach({
                id: 'bird',
                flapSpeed: 8
            })
            .attach(new hitagi.components.Collision({
                height: 18,
                width: 32
            }))
    );

    var background = world.add(
        new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth/2, y: levelHeight/2}))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: 0X139BC9,
                height: levelHeight,
                width: levelWidth
            }))
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
});

} ());
