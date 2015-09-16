// Powered by https://github.com/RoganMurley/hitagi.js
(function () {
    "use strict";

    var levelWidth = window.innerWidth;
    var levelHeight = window.innerHeight;

    // Keep the game window sensible dimensions.
    if (levelHeight < 800) {
        levelHeight = 800;
    }

    // Setup pixi.
    var renderer = PIXI.autoDetectRenderer(levelWidth, levelHeight);
    document.body.appendChild(renderer.view);

    // Setup world.
    var world = new hitagi.World();

    // Setup rooms.
    var rooms = new hitagi.Rooms(world);

    // Define systems.
    var GravitySystem = function () {
        this.update = {
            gravity: function (entity, dt) {
                // Accelerate entity until it reaches terminal velocity.
                if (entity.c.velocity.yspeed < entity.c.gravity.terminal) {
                    entity.c.velocity.yspeed += hitagi.utils.delta(entity.c.gravity.magnitude, dt);
                }
            }
        };
    };

    var BirdSystem = function (controlsSystem, collisionSystem, soundSystem, scoreSystem) {
        this.update = {
            bird: function (entity, dt) {
                // Flap wings if clicking,
                if (controlsSystem.check('flap', {once: true})) {
                    entity.c.velocity.yspeed = -entity.c.bird.flapSpeed;
                    entity.c.sprite.currentFrame = 0;
                    soundSystem.play('http://hitagi.s3-website-eu-west-1.amazonaws.com/flap.ogg');
                }

                // Stop bird from leaving the top of the screen.
                if (entity.c.position.y < 0) {
                    entity.c.position.y = 0;
                    entity.c.velocity.yspeed = 0;
                }

                // Rotate bird sprite depending on velocity.
                entity.c.sprite.rotation = entity.c.velocity.yspeed/15;

                // Score if we hit a goal.
                var x = entity.c.position.x;
                var y = entity.c.position.y;

                var test = collisionSystem.collide(entity, 'goal');

                if (test.length && !test[0].c.goal.done) {
                    test[0].c.goal.done = true;
                    scoreSystem.updateScore(test[0].c.goal.n);
                }
            }
        };
    };

    var ScoreSystem = function (soundSystem) {
        var that = this;

        var BEST_SCORE_KEY = 'BestScore';

        this.$tracking = {
            'best': 'single',
            'score': 'single'
        };

        this.updateScore = function (newScore) {
            var score = that.$tracked.score;
            var best = that.$tracked.best;

            /// Update score.
            score.c.score.cleared = newScore;
            score.c.text.copy = 'SCORE: ' + score.c.score.cleared;

            // Update best score.
            if (score.c.score.cleared > best.c.best.cleared) {
                best.c.best.cleared = score.c.score.cleared;
                best.c.text.copy = 'BEST: ' + best.c.best.cleared;
            }

            soundSystem.play('http://hitagi.s3-website-eu-west-1.amazonaws.com/clear.ogg');
        };

        this.loadBestScore = function () {
            var bestScore = 0;
            if (localStorage) {
                var savedScore = localStorage[BEST_SCORE_KEY];
                if (savedScore) {
                    bestScore = savedScore;
                }
            }
            return bestScore;
        };

        this.saveBestScore = function () {
            var best = that.$tracked.best;
            localStorage.setItem(BEST_SCORE_KEY, best.c.best.cleared);
        };

        this.clearBestScore = function () {
            var best = that.$tracked.best;
            best.c.best.cleared = 0;
            that.saveBestScore();
        };
    };

    var DeathSystem = function (world, rooms, collisionSystem, soundSystem, scoreSystem) {
        var that = this;
        this.$tracking = {
            'pipeGenerator': 'single',
            'scroll': 'many'
        };

        var stopGame = function () {
            // Stop screen scroll.
            _.each(that.$tracked.scroll, function (scroller) {
                scroller.c.scroll.speed = 0;
            });
            // Stop generating pipes.
            var generator = that.$tracked.pipeGenerator;
            generator.c.pipeGenerator.period = Infinity;
            generator.c.pipeGenerator.timer = Infinity;
        };

        var restartGame = function () {
            scoreSystem.saveBestScore();
            rooms.loadRoom('start');
            world.add(
                new Best({cleared: scoreSystem.loadBestScore()})
            );
        };

        this.update = {
            bird: function (entity) {
                // Test for hitting something which kills you.
                var test = collisionSystem.collide(entity, 'kill');
                if (test.length) {
                    stopGame();

                    soundSystem.play('http://hitagi.s3-website-eu-west-1.amazonaws.com/die.ogg');
                    setTimeout(function () {
                        soundSystem.play('http://hitagi.s3-website-eu-west-1.amazonaws.com/fail.ogg');
                    }, 500);

                    // Add corpse.
                    world.remove(entity);
                    world.add(new Corpse({
                        x: entity.c.position.x,
                        y: entity.c.position.y,
                        xspeed: 2,
                        yspeed: -10
                    }));
                    return;
                }
            },
            corpse: function (entity, dt) {
                // Rotate corpse.
                entity.c.staticSprite.rotation += hitagi.utils.delta(0.1, dt);

                // When the corpse leaves the screen, restart.
                if (entity.c.position.y > levelHeight) {
                    restartGame();
                }
            }
        };
    };

    var PipeGeneratorSystem = function (world) {
        this.update = {
            pipeGenerator: function (entity, dt) {
                entity.c.pipeGenerator.timer -= hitagi.utils.delta(1, dt);

                if (entity.c.pipeGenerator.timer <= 0) {

                    entity.c.pipeGenerator.timer = entity.c.pipeGenerator.period;
                    entity.c.pipeGenerator.created++;

                    var pipeHeight = 793;
                    var pipeGap = 145;
                    var minimumEdgeDistance = levelHeight * 0.2;
                    var pipePosition = minimumEdgeDistance - (Math.random() * pipeHeight/2);

                    world.add(
                        new Pipe({
                            y: pipePosition,
                            yscale: -1
                        })
                    );
                    world.add(
                        new Pipe({
                            y: pipePosition + pipeGap + pipeHeight,
                            yscale: 1
                        })
                    );
                    world.add(new Goal({
                        width: 60,
                        height: pipeGap,
                        y: pipePosition + pipeHeight/2 + pipeGap/2,
                        n: entity.c.pipeGenerator.created
                    }));
                }
            }
        };
    };

    var ScrollSystem = function (world) {
        this.update = {
            floor: function (entity) {
                // Wrap the floor horizontally.
                var floorWidth = 308;
                var floorCount = Math.floor(levelWidth/floorWidth) + 2;
                if (entity.c.position.x <= -floorWidth/2) {
                    var diff = floorWidth/2 + entity.c.position.x;
                    entity.c.position.x = (floorCount * floorWidth) - floorWidth/2 + diff;
                }
            },
            pipe: function (entity) {
                if (entity.c.position.x < -100) {
                    world.remove(entity);
                }
            },
            scroll: function (entity) {
                entity.c.velocity.xspeed = entity.c.scroll.speed;
            }
        };
    };

    var StartSystem = function (controlsSystem) {
        var that = this;
        this.$tracking = {
            'bird': 'single',
            'pipeGenerator': 'single',
            'start': 'single'
        };

        this.tickStart = function () {
            var start = that.$tracked.start;
            var bird = that.$tracked.bird;
            var generator = that.$tracked.pipeGenerator;

            if (!start.c.started) {
                if (controlsSystem.check('start')) {
                    // Hide text.
                    start.c.graphic.visible = false;

                    // Start pipe generator.
                    generator.c.pipeGenerator.timer = 85;
                    generator.c.pipeGenerator.period = 85;

                    // Start gravity.
                    bird.c.gravity.magnitude = 0.6;

                    // Start flapping.
                    bird.c.sprite.loop = false;

                    start.c.started = true;
                }
            }
        };
    };

    // Register systems.
    var controlsSystem = world.register(new hitagi.systems.ControlsSystem());

    var renderSystem = new hitagi.systems.PixiRenderSystem();
    world.register(renderSystem);

    world.register(new hitagi.systems.VelocitySystem());

    var collisionSystem = new hitagi.systems.CollisionSystem();
    world.register(collisionSystem);

    var soundSystem = new hitagi.systems.SoundSystem();
    world.register(soundSystem);

    var scoreSystem = new ScoreSystem(soundSystem);
    world.register(scoreSystem);

    world.register(new BirdSystem(controlsSystem, collisionSystem, soundSystem, scoreSystem));
    world.register(new GravitySystem());
    world.register(new DeathSystem(world, rooms, collisionSystem, soundSystem, scoreSystem));
    world.register(new PipeGeneratorSystem(world));
    world.register(new ScrollSystem(world));
    world.register(new StartSystem(controlsSystem));

    // Bind controls.
    controlsSystem.bind('m1', 'flap');
    controlsSystem.bind('m1', 'start');

    // Define entities.
    var Player = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({xspeed: 0, yspeed: 0}))
            .attach(new hitagi.components.graphics.Graphic({
                scale: {
                    x: 0.45,
                    y: 0.45
                }
            }))
            .attach(new hitagi.components.graphics.Sprite({
                animationSpeed: 0.12,
                path: [
                    'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_0.png',
                    'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_1.png',
                    'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_2.png'
                ]
            }))
            .attach({
                $id: 'gravity',
                magnitude: 0,
                terminal: 12
            })
            .attach({
                $id: 'bird',
                flapSpeed: 10
            })
            .attach(new hitagi.components.Collision({
                height: 18,
                width: 32
            }));
    };

    var Corpse = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: params.xspeed,
                yspeed: params.yspeed
            }))
            .attach(new hitagi.components.graphics.Graphic({
                scale: {
                    x: 0.45,
                    y: 0.45
                },
                z: 10000
            }))
            .attach(new hitagi.components.graphics.StaticSprite({
                path: 'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_0.png'
            }))
            .attach({
                $id: 'gravity',
                magnitude: 1,
                terminal: Infinity
            }).attach({
                $id: 'corpse'
            });
    };

    var Goal = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({
                x: levelWidth + 200,
                y: params.y
            }))
            .attach(new hitagi.components.Velocity({
                xspeed: 0,
                yspeed: 0
            }))
            .attach({
                $id: 'scroll',
                speed: -5
            })
            .attach(new hitagi.components.Collision({
                width: params.width,
                height: params.height
            }))
            .attach({
                $id: 'goal',
                n: params.n,
                done: false
            });
    };

    var Pipe = function (params) {
        var pipe = new hitagi.Entity()
            .attach(new hitagi.components.Position({x: levelWidth + 200, y: params.y}))
            .attach(new hitagi.components.Velocity({xspeed: 0, yspeed: 0}))
            .attach({
                $id: 'scroll',
                speed: -5
            })
            .attach(new hitagi.components.graphics.Graphic({
                scale: {
                    x: 1,
                    y: params.yscale
                },
                z: 10
            }))
            .attach(new hitagi.components.graphics.StaticSprite({
                path: 'http://hitagi.s3-website-eu-west-1.amazonaws.com/pipe.png'
            }))
            .attach(new hitagi.components.Collision({
                height: 793,
                width: 138
            }))
            .attach({$id: 'pipe'})
            .attach({$id: 'kill'});

        return pipe;
    };

    var Background = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.graphics.Graphic({
                anchor: {
                    x: 0,
                    y: 0
                },
                relative: false,
                z: -100
            }))
            .attach(new hitagi.components.graphics.Rectangle({
                color: params.color,
                height: levelHeight,
                width: levelWidth
            }));
    };

    var Floor = function (params) {
        return new hitagi.Entity()
                .attach(new hitagi.components.Position({
                    x: params.x,
                    y: levelHeight - 108/2
                }))
                .attach(new hitagi.components.Velocity({
                    xspeed: 0,
                    yspeed: 0
                }))
                .attach({
                    $id: 'scroll',
                    speed: -5
                })
                .attach(new hitagi.components.graphics.Graphic({
                    z: 1000
                }))
                .attach(new hitagi.components.graphics.StaticSprite({
                    path: 'http://hitagi.s3-website-eu-west-1.amazonaws.com/floor.png'
                }))
                .attach(new hitagi.components.Collision({
                    height: 108,
                    width: 308
                }))
                .attach({$id: 'floor'})
                .attach({$id: 'kill'});
    };

    var Score = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 25, y: 0}))
            .attach(new hitagi.components.graphics.Graphic({
                z: Infinity
            }))
            .attach(new hitagi.components.graphics.Text({
                bitmapFont: true,
                copy: 'SCORE: 0',
                style: {
                    font: '64px VT323',
                    fill: 'white'
                }
            }))
            .attach({
                $id: 'score',
                cleared: 0
            });
    };

    var Best = function (params) {
        return new hitagi.Entity()
            .attach(new hitagi.components.Position({x: 25, y: 84}))
            .attach(new hitagi.components.graphics.Graphic({
                z: Infinity
            }))
            .attach(new hitagi.components.graphics.Text({
                bitmapFont: true,
                copy: 'BEST: ' + params.cleared,
                style: {
                    font: '64px VT323',
                    fill: 'white'
                }
            }))
            .attach({
                $id: 'best',
                cleared: params.cleared
            });
    };

    var PipeGenerator = function (params) {
        return new hitagi.Entity()
            .attach({
                $id: 'pipeGenerator',
                created: 0,
                period: params.period,
                timer: params.period
            });
    };

    var Start = function (params) {
        return new hitagi.Entity()
            .attach({
                $id: 'start',
                started: false
            })
            .attach(new hitagi.components.Position({
                x: params.x,
                y: params.y
            }))
            .attach(new hitagi.components.graphics.Graphic({}))
            .attach(new hitagi.components.graphics.Text({
                bitmapFont: true,
                copy: params.copy,
                style: {
                    font: '48px VT323',
                    fill: 'white'
                }
            }));
    };

    // Load assets, then run game.
    renderSystem.load([
        'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_0.png',
        'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_1.png',
        'http://hitagi.s3-website-eu-west-1.amazonaws.com/bird_2.png',
        'http://hitagi.s3-website-eu-west-1.amazonaws.com/pipe.png',
        'http://hitagi.s3-website-eu-west-1.amazonaws.com/floor.png',
        'http://hitagi.s3-website-eu-west-1.amazonaws.com/FlappyFont.xml'
    ], main);

    function main () {
        // Create starting room.
        var startRoomEntities = [
            new Score(),
            new Background({
                color: 0X139BC9
            }),
            new Player({
                x: levelWidth * 0.15,
                y: levelHeight / 2
            }),
            new PipeGenerator({
                period: Infinity
            }),
            new Start({
                copy: 'CLICK TO FLAP',
                x: levelWidth * 0.15 - 118,
                y: levelHeight / 2 + 64
            })
        ];

        // Add floor to starting room.
        var floorWidth = 308;
        var floorCount = Math.floor(levelWidth/floorWidth) + 2;
        _.times(floorCount, function (i) {
            startRoomEntities.push(new Floor({x: (floorWidth/2) + i * floorWidth}));
        });

        rooms.saveRoom('start', startRoomEntities);
        rooms.loadRoom('start');

        // Load best score.
        var bestScore = scoreSystem.loadBestScore();
        world.add(new Best({cleared: bestScore}));

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
    }

} ());
