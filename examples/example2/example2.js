// Powered by https://github.com/RoganMurley/hitagi.js
"use strict";

var levelWidth = 600;
var levelHeight = 400;
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
                entity.c.velocity.yspeed = 0;
                entity.c.position.y += 1;
            }
            if (projectedY + entity.c.paddle.height/2 > levelHeight) {
                entity.c.velocity.yspeed = 0;
                entity.c.position.y -= 1;
            }
        }
    };

    this.input = function (entity, input) {
        if (input === 'up') {
            entity.c.velocity.yspeed -= entity.c.paddle.speed;
        }
        else if (input === 'down') {
            entity.c.velocity.yspeed += entity.c.paddle.speed;
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
        'ball': 'single'
    };

    this.update = {
        ai: function (entity) {
            var ballY = that.$tracked.ball.c.position.y;
            var distance = Math.abs(entity.c.position.y - ballY);

            if (distance > 60 + (Math.random() * 20 - 10)) {
                if (entity.c.position.y > ballY) {
                    paddleSystem.input(entity, 'up');
                } else {
                    paddleSystem.input(entity, 'down');
                }
            }
        }
    };
};
world.register(new AISystem());

var BallSystem = function (collisionSystem) {
    this.update = {
        ball: function (entity, dt) {
            // Hit top of screen.
            if ((entity.c.position.y < 0) || (entity.c.position.y > levelHeight)) {
                entity.c.velocity.yspeed *= -1;
            }

            // Collie with paddle.
            var test = collisionSystem.collide(entity, 'paddle');
            if (test.length) {
                var other = test[0];
                entity.c.velocity.xspeed *= -1.01;
                if (entity.c.position.y < other.c.position.y) {
                    entity.c.velocity.yspeed += (entity.c.position.y - other.c.position.y) / 50;
                } else {
                    entity.c.velocity.yspeed -= (entity.c.position.y - other.c.position.y) / 50;
                }
            }

            // Reset ball.
            if ((entity.c.position.x < 0) || (entity.c.position.x > levelWidth)) {
                ball.c.position.x = levelWidth/2;
                ball.c.position.y = levelHeight/2;
                ball.c.velocity.yspeed = Math.random()*4 - 2;

                if (ball.c.velocity.xspeed > 0) {
                    ball.c.velocity.xspeed = 6;
                } else {
                    ball.c.velocity.xspeed = -6;
                }
            }
        }
    };
};
var ballSystem = world.register(new BallSystem(collisionSystem));

// Define prefabs.
// Paddle params: x, y
var Paddle = function (params) {
    return new hitagi.prefabs.Body({x: params.x, y: params.y, width: 4, height: 96})
        .attach(new hitagi.components.graphics.Rectangle({
            color: 0xffff00,
            height: 96,
            width: 4
        }))
        .attach({
            $id: 'paddle',
            $deps: ['velocity'],
            friction: 0.9,
            height: 96,
            speed: 1,
            width: 4
        });
};

// Add entities.
world.add(new Paddle({x: 32, y: levelHeight / 2}).attach({$id: 'player'}));
world.add(new Paddle({x: levelWidth - 24, y: levelHeight / 2}).attach({$id: 'ai'}));

var ball = new hitagi.prefabs.Body({
        height: 16,
        width: 16,
        x: levelWidth/2,
        y: levelHeight/2,
        xspeed: -5,
        yspeed: Math.random()*4 - 2,
    })
    .attach(new hitagi.components.graphics.Circle({color: 0xffffff, radius: 8}))
    .attach({$id: 'ball'});
world.add(ball);

(function animate() {
    world.tick(1000);
    renderSystem.render();
    requestAnimationFrame(animate);
}());
