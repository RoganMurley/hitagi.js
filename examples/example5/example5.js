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

    // Define systems.
    'systems';

    // Register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    var soundSystem = new hitagi.systems.SoundSystem();
    world.register(soundSystem);

    var physicsSystem = new hitagi.systems.MatterPhysicsSystem(
        levelWidth,
        levelHeight
    );
    world.register(physicsSystem);

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
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Graphic({
                type: 'rectangle',
                color: 0X910E2F,
                width: params.width,
                height: params.height
            }))
            .attach(new hitagi.components.Body({
                width: params.width,
                height: params.height,
                static: params.static
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
            new Block({
                height: 32,
                width: 32,
                x: levelWidth/2,
                y: levelHeight/2
            }),
            new Block({
                height: 32,
                width: levelWidth,
                x: levelWidth/2,
                y: levelHeight - 16,
                static: true
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
