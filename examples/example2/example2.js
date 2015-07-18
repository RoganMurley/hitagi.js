(function () {
    "use strict";

    // Setup dimensions.
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

    // Define and register systems.
    var renderSystem = new hitagi.systems.PixiRenderSystem(stage);
    world.register(renderSystem);

    world.register(new hitagi.systems.VelocitySystem());

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var PaddleSystem = function () {
        this.update = function (entity, dt) {
            if (entity.has('paddle')) {
                // Slow down from friction.
                entity.c.velocity.yspeed *= entity.c.paddle.friction;
                if (Math.abs(entity.c.velocity.yspeed) < 0.01) {
                    entity.c.velocity.yspeed = 0;
                }

                // Stop from leaving screen.
                var projectedY = entity.c.position.y + entity.c.velocity.yspeed;
                if (projectedY - entity.c.paddle.height/2 < 0) {
                    entity.c.velocity.yspeed *= -1.4;
                }
                if (projectedY + entity.c.paddle.height/2 > levelHeight) {
                    entity.c.velocity.yspeed *= -1.4;
                }
            }
        };
    };
    world.register(new PaddleSystem());

    var PlayerSystem = function () {
        this.update = function (entity, dt) {
            if (entity.has('player') && entity.has('paddle')) {
                // Handle player input.
                if (controls.check('up')) {
                    entity.c.velocity.yspeed -= entity.c.paddle.speed;
                }
                if (controls.check('down')) {
                    entity.c.velocity.yspeed += entity.c.paddle.speed;
                }
            }
        };
    };
    world.register(new PlayerSystem());

    var AISystem = function () {
        var ai = null;

        this.build = function (entity) {
            if (entity.has('ai')) {
                ai = entity;
            }
        }

        this.update = function (entity) {
            if (entity.has('ai')) {
                if (Math.random() > 0.8) {
                    if (entity.c.position.y < entity.c.ai.lastKnownY) {
                        entity.c.velocity.yspeed += entity.c.paddle.speed;
                    } else {
                        entity.c.velocity.yspeed -= entity.c.paddle.speed;
                    }
                }
            }
            if (entity.has('ball')) {
                ai.c.ai.lastKnownY = entity.c.position.y;
            }
        };
    };
    world.register(new AISystem());

    var BallSystem = function (collisionSystem) {
        this.update = function (entity, dt) {
            if (entity.has('ball')) {
                var x = entity.c.position.x;
                var y = entity.c.position.y;

                var test = collisionSystem.collide(entity, 'paddle', x, y);
                if (test.hit) {
                    entity.c.velocity.xspeed *= -1.01;

                    if (entity.c.position.y < test.entity.c.position.y) {
                        entity.c.velocity.yspeed +=
                            (entity.c.position.y - test.entity.c.position.y) / 50;
                    }
                    if (entity.c.position.y > test.entity.c.position.y) {
                        entity.c.velocity.yspeed -=
                            (entity.c.position.y - test.entity.c.position.y) / 50;
                    }
                }

                if ((entity.c.position.y < 0) || (entity.c.position.y > levelHeight)) {
                    entity.c.velocity.yspeed *= -1;
                }
            }
        };

        this.resetBall = function (ball) {
            ball.c.position.x = levelWidth/2;
            ball.c.position.y = levelHeight/2;
            ball.c.velocity.yspeed *= -0.95;
            ball.c.velocity.xspeed *= -0.95;
        };
    };
    var ballSystem = world.register(new BallSystem(collisionSystem));

    var ScoreSystem = function (ballSystem, renderSystem) {
        var scores = null;

        this.build = function (entity) {
            if (entity.has('scorecard')) {
                scores = entity;
            }
        }

        this.update = function (entity, dt) {
            if (entity.has('ball')) {
                if (entity.c.position.x < 0) {
                    ballSystem.resetBall(entity);
                    scores.c.scorecard.score2++;
                }

                if (entity.c.position.x > levelWidth) {
                    ballSystem.resetBall(entity);
                    scores.c.scorecard.score1++;
                }
            }

            if (entity.has('scorecard')) {
                renderSystem.setText(
                    entity,
                    entity.c.scorecard.score1 + ' - ' + entity.c.scorecard.score2
                );
            }
        };
    };
    world.register(new ScoreSystem(ballSystem, renderSystem));

    // Define prefabs.

    // Params: color, friction, height, width, speed, x, y
    var Paddle = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: 0,
                yspeed: 0
            }))
            .attach(new hitagi.components.Rectangle({
                color: params.color,
                x1: 0,
                y1: 0,
                x2: params.width,
                y2: params.height,
                offsetX: -params.width/2,
                offsetY: -params.height/2
            }))
            .attach({
                id: 'paddle',
                deps: ['velocity'],
                friction: params.friction,
                height: params.height,
                speed: params.speed,
                width: params.width
            })
            .attach(new hitagi.components.Collision({
                height: params.height,
                width: params.width
            }));
    };

    // Params: color, height, width, x, y, xspeed, yspeed
    var Ball = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: params.xspeed,
                yspeed: params.yspeed
            }))
            .attach(new hitagi.components.Rectangle({
                color: params.color,
                x1: 0,
                y1: 0,
                x2: params.width/2,
                y2: params.height/2,
                offsetX: -params.width/2,
                offsetY: -params.height/2
            }))
            .attach(new hitagi.components.Collision({
                height: params.width,
                width: params.height
            }))
            .attach({'id': 'ball'})
    };

    // Params: color, font, score1, score2, x, y
    var Score = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Text({
                txt: '',
                options: {
                    font: params.font,
                    fill: params.color
                }
            }))
            .attach({
                id: 'scorecard',
                score1: params.score1,
                score2: params.score2
            })
    };

    // Add entities.
    var player = world.add(
        new Paddle({
            color:  0xFFFF00,
            friction: 0.9,
            height: 96,
            width: 4,
            speed: 1,
            x: 32,
            y: levelHeight/2
        })
        .attach({
            id: 'player',
            deps: ['paddle']
        })
    );

    var opponent = world.add(
        new Paddle({
            color:  0xFFFF00,
            friction: 0.9,
            height: 96,
            width: 4,
            speed: 1,
            x: levelWidth - 24,
            y: levelHeight/2
        })
        .attach({
            id: 'ai',
            deps: ['paddle'],
            lastKnownY: levelHeight/2
        })
    );

    var ball = world.add(
        new Ball({
            color: 0xFFFFFF,
            height: 16,
            width: 16,
            x: levelWidth/2,
            y: levelHeight/2,
            xspeed: -5,
            yspeed: 0
        })
    );

    var score = world.add(
        new Score({
            color: 'white',
            font: '16px monospace',
            score1: 0,
            score2: 0,
            x: levelWidth/2 - 16/2,
            y: 16
        })
    );

    // Setup game loop.
    requestAnimationFrame(animate);

    function animate() {
        // Update the world, using a fixed delta time.
        world.tick(1000);

        // Render the world.
        renderer.render(stage);

        // Next frame.
        requestAnimationFrame(animate);
    }

} ());
