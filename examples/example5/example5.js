// Powered by https://github.com/RoganMurley/hitagi.js
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

    // Setup rooms.
    var rooms = new hitagi.Rooms(world);

    // Setup controls.
    var controls = new hitagi.Controls();
    controls.bind('m1', 'spawn');
    controls.bind(82, 'reload');
    controls.bind('m2', 'spin');


    // Define systems.
    var SpawnSystem = function (world, controls) {
        this.tickStart = function () {
            if (controls.check('spawn', true)) {
                var mousePos = controls.getMousePos();
                world.add(
                    new Block({
                        angle: 2*Math.PI*Math.random(),
                        height: 32,
                        width: 32,
                        x: mousePos.x,
                        y: mousePos.y
                    })
                );
            }
        };
    };

    var ReloadSystem = function (rooms, controls) {
        this.tickStart = function () {
            if (controls.check('reload', true)) {
                rooms.loadRoom('start');
            }
        };

        this.update = {
            spinner: function (entity) {
                if (controls.check('spin')) {
                    entity.c.body.angle += 0.1;
                }
            }
        };
    };

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    var soundSystem = new hitagi.systems.SoundSystem();
    world.register(soundSystem);

    var physicsSystem = new hitagi.systems.MatterPhysicsSystem({
        x: levelWidth,
        y: levelHeight
    });
    world.register(physicsSystem);

    var spawnSystem = new SpawnSystem(world, controls);
    world.register(spawnSystem);

    var reloadSystem = new ReloadSystem(rooms, controls);
    world.register(reloadSystem);

    // Define components.
    'components';

    // Define entities.
    var Background = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth/2,
                y: levelHeight/2
            }))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: params.color,
                height: levelHeight,
                width: levelWidth,
                z: -Infinity
            }));
    };

    var Block = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Graphic({
                type: 'sprite',
                path: 'block.png',
                width: params.width,
                height: params.height
            }))
            .attach(new hitagi.components.Body({
                angle: params.angle,
                width: params.width,
                height: params.height,
                x: params.x,
                y: params.y
            }))
            .attach({id: 'spinner'});
    };

    var Floor = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                width: params.width,
                height: params.height
            }))
            .attach(new hitagi.components.Body({
                angle: 0,
                width: params.width,
                height: params.height,
                static: true,
                x: params.x,
                y: params.y
            }));
    };

    // Load assets, then run game.
    //renderSystem.load([], main);
    main();

    function main () {
        // Create starting room.
        var startRoomEntities = [
            new Background({
                color:0X139BC9
            }),
            new Floor({
                height: 32,
                width: levelWidth,
                x: levelWidth/2,
                y: levelHeight - 16
            })
        ];

        // Load starting room.
        rooms.saveRoom('start', startRoomEntities);
        rooms.loadRoom('start');

        // Setup game loop.
        requestAnimationFrame(animate);

        function animate() {
            // Update the world.
            world.tick(1000/60);

            // Render the world.
            renderer.render(stage);

            // Next frame.
            requestAnimationFrame(animate);
        }
}

} ());
