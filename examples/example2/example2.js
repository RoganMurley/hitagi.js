// Powered by https://github.com/RoganMurley/hitagi.js
"use strict";

// Setup level dimensions.
var levelWidth = 600;
var levelHeight = 400;

// Setup world.
var world = new hitagi.World();

// Define and register systems.
var renderSystem = new hitagi.systems.PixiRenderSystem({width: levelWidth, height: levelHeight});
world.register(renderSystem);
document.body.appendChild(renderSystem.view);

var controlsSystem = world.register(new hitagi.systems.ControlsSystem());
controlsSystem.bind(38, 'up');
controlsSystem.bind(40, 'down');

world.register(new hitagi.systems.VelocitySystem());

var collisionSystem = world.register(new hitagi.systems.CollisionSystem());

var PaddleSystem = function () {
    this.update = {
        paddle: function (entity, dt) {
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

    this.input = function (entity, input) {
        if (entity.has('paddle')) {
            switch (input) {
                case 'down':
                    entity.c.velocity.yspeed += entity.c.paddle.speed;
                    break;
                case 'up':
                    entity.c.velocity.yspeed -= entity.c.paddle.speed;
                    break;
                default:
                    throw new Error('UnknownInput');
            }
        }
    };
};
var paddleSystem = world.register(new PaddleSystem());

var PlayerSystem = function (controlsSystem, paddleSystem) {
    this.update = {
        player: function (entity, dt) {
            if (controlsSystem.check('up')) {
                paddleSystem.input(entity, 'up');
            }
            if (controlsSystem.check('down')) {
                paddleSystem.input(entity, 'down');
            }
        }
    };
};
world.register(new PlayerSystem(controlsSystem, paddleSystem));

var AISystem = function () {
    var that = this;
    this.$tracking = {
        'ai': 'single'
    };

    this.update = {
        ai: function (entity) {
            var distance = Math.abs(entity.c.position.y - entity.c.ai.lastKnownY);

            if (distance > entity.c.ai.sensitivity + (Math.random()*20 - 10)) {
                if (entity.c.position.y > entity.c.ai.lastKnownY) {
                    paddleSystem.input(entity, 'up');
                } else {
                    paddleSystem.input(entity, 'down');
                }
            }
        },

        ball: function (entity) {
            var ai = that.$tracked.ai;
            ai.c.ai.lastKnownY = entity.c.position.y;
        }
    };
};
world.register(new AISystem());

var BallSystem = function (collisionSystem) {
    this.update = {
        ball: function (entity, dt) {
            var x = entity.c.position.x;
            var y = entity.c.position.y;

            if ((y < 0) || (y > levelHeight)) {
                entity.c.velocity.yspeed *= -1;
            }

            if (entity.c.ball.cooldown > 0) {
                entity.c.ball.cooldown--;
                return;
            }

            var test = collisionSystem.collide(entity, 'paddle');
            if (test.length) {
                var other = test[0];
                entity.c.velocity.xspeed *= -1.01;

                if (entity.c.position.y < other.c.position.y) {
                    entity.c.velocity.yspeed +=
                        (entity.c.position.y - other.c.position.y) / 50;
                    entity.c.ball.cooldown = 10;
                }
                if (entity.c.position.y > other.c.position.y) {
                    entity.c.velocity.yspeed -=
                        (entity.c.position.y - other.c.position.y) / 50;
                    entity.c.ball.cooldown = 10;
                }
            }
        }
    };

    this.resetBall = function (ball) {
        ball.c.position.x = levelWidth/2;
        ball.c.position.y = levelHeight/2;
        ball.c.velocity.yspeed = Math.random()*4 - 2;

        if (ball.c.velocity.xspeed > 0) {
            ball.c.velocity.xspeed = 6;
        } else {
            ball.c.velocity.xspeed = -6;
        }
    };
};
var ballSystem = world.register(new BallSystem(collisionSystem));

var ScoreSystem = function (ballSystem) {
    var that = this;
    this.$tracking = {
        'scorecard': 'single'
    };

    this.update = {
        ball: function (entity) {
            var scores = that.$tracked.scorecard;

            if (entity.c.position.x < 0) {
                ballSystem.resetBall(entity);
                scores.c.scorecard.score2++;
            }

            if (entity.c.position.x > levelWidth) {
                ballSystem.resetBall(entity);
                scores.c.scorecard.score1++;
            }
        },

        scorecard: function (entity) {
            entity.c.text.copy =
                entity.c.scorecard.score1 + ' - ' + entity.c.scorecard.score2;
        }
    };
};
world.register(new ScoreSystem(ballSystem));

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
        .attach(new hitagi.components.graphics.Graphic())
        .attach(new hitagi.components.graphics.Rectangle({
            color: params.color,
            height: params.height,
            width: params.width
        }))
        .attach({
            $id: 'paddle',
            $deps: ['velocity'],
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

// Add entities.
world.add(
    new Paddle({
        color:  0xffff00,
        friction: 0.9,
        height: 96,
        width: 4,
        speed: 1,
        x: 32,
        y: levelHeight/2
    })
    .attach({
        $id: 'player',
        $deps: ['paddle']
    })
);

world.add(
    new Paddle({
        color:  0xffff00,
        friction: 0.9,
        height: 96,
        width: 4,
        speed: 1,
        x: levelWidth - 24,
        y: levelHeight/2
    })
    .attach({
        $id: 'ai',
        $deps: ['paddle'],
        lastKnownY: levelHeight/2,
        sensitivity: 60
    })
);

var ball = new hitagi.Entity()
    .attach(new hitagi.components.Position({
        x: levelWidth/2,
        y: levelHeight/2
    }))
    .attach(new hitagi.components.Velocity({
        xspeed: -5,
        yspeed: Math.random()*4 - 2
    }))
    .attach(new hitagi.components.graphics.Graphic())
    .attach(new hitagi.components.graphics.Circle({
        color: 0xffffff,
        radius: 8
    }))
    .attach(new hitagi.components.Collision({
        height: 16,
        width: 16
    }))
    .attach({
        $id: 'ball',
        cooldown: 0
    });
world.add(ball);

var score = new hitagi.Entity()
    .attach(new hitagi.components.Position({
        x: levelWidth/2,
        y: 16
    }))
    .attach(new hitagi.components.graphics.Graphic())
    .attach(new hitagi.components.graphics.Text({
        copy: '',
        style: {
            font: '16px monospace',
            fill: 0xffffff
        }
    }))
    .attach({
        $id: 'scorecard',
        score1: 0,
        score2: 0
    });
world.add(score);

(function animate() {
    world.tick(1000);
    renderSystem.render();
    requestAnimationFrame(animate);
}());
