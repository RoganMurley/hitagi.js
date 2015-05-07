(function () {
    'use strict';

    var _ = require('lodash');
    var pixi = require('pixi.js');

    var PixiSprite = pixi.Sprite;
    var PixiTexture = pixi.Texture;
    var PixiText = pixi.Text;
    var PixiGraphics = pixi.Graphics;
    var PixiAssetLoader = pixi.AssetLoader;

    var RenderSystem = function (stage, width, height) {
        var that = this,

            x = 0,
            newX = 0,
            targetX = 0,

            y = 0,
            newY = 0,
            targetY = 0,

            cameraSpeed = 0.1,

            xShake = 0,
            yShake = 0,
            shakeDecay = 0.9;

        var sprites = {},
            textures = {},
            texts = {},
            lines = {};

        // Build the system, called by world on every entity.
        this.build = function (entity) {
            if (entity.has('sprite')) {
                var path = entity.c.sprite.path,
                    texture = PixiTexture.fromImage(path);

                textures[entity.uid] = texture;
                var sprite = sprites[entity.uid] = new PixiSprite(texture);

                // Set anchor.
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;

                // Set visibility.
                if (entity.c.sprite.visible) {
                    that.show(entity);
                } else {
                    that.hide(entity);
                }

                stage.addChild(sprite);
            }
            if (entity.has('text')) {
                texts[entity.uid] = new PixiText(
                        entity.c.text.txt,
                        entity.c.text.options
                    );

                stage.addChild(texts[entity.uid]);
            }
            if (entity.has('line')) {
                lines[entity.uid] = new PixiGraphics();
                lines[entity.uid].lineColor = 'red';
                lines[entity.uid].moveTo(entity.c.position.x, entity.c.position.y);
                lines[entity.uid].lineTo(entity.c.line.x, entity.c.line.y);

                stage.addChild(lines[entity.uid]);
            }
            if (entity.has('xDirectionSprite')) {
                that.load([
                    entity.c.xDirectionSprite.left,
                    entity.c.xDirectionSprite.right
                ]);
            }
        };

        // Remove an entity from the system.
        this.remove = function (entity) {
            var id = entity.uid;

            if (_.has(sprites, id)) {
                stage.removeChild(sprites[id]);
            }
            if (_.has(texts, id)) {
                stage.removeChild(texts[id]);
            }
            if (_.has(lines, id)) {
                stage.removeChild(lines[id]);
            }

            delete sprites[id];
            delete textures[id];
            delete texts[id];
            delete lines[id];
        };

        this.update = function (entity) {
            // Set a directional sprite to the right direction.
            if (entity.has('xDirectionSprite')) {
                var direction = entity.c.xMovement.direction;

                if (direction === 'left') {
                    that.setSprite(entity, entity.c.xDirectionSprite.left);
                }
                else if (direction === 'right') {
                    that.setSprite(entity, entity.c.xDirectionSprite.right);
                }
            }

            // Lock the camera to an entity with camera lock.
            if (entity.has('cameraLock')) {
                targetX = width/2 - entity.c.position.x;
                targetY = height/2 - entity.c.position.y;

                // Pan to camera lock position.
                var xDiff = Math.abs(newX - targetX),
                    yDiff = Math.abs(newY - targetY);

                if (newX < targetX) {
                    newX += xDiff * cameraSpeed;
                }
                else if (newX > targetX) {
                    newX -= xDiff * cameraSpeed;
                }

                if (newY < targetY) {
                    newY += yDiff * cameraSpeed;
                }
                else if (newY > targetY) {
                    newY -= yDiff * cameraSpeed;
                }

                // Screen shake.
                if (_.random(0, 1)) {
                    newX += _.random(0, xShake);
                } else {
                    newX -= _.random(0, xShake);
                }
                if (_.random(0, 1)) {
                    newY += _.random(0, yShake);
                } else {
                    newY -= _.random(0, yShake);
                }

                xShake *= 0.9;
                yShake *= 0.9;
            }

            // Update text positions.
            // Don't update HUD positions.
            if (entity.has('text') && !entity.has('hud')) {
                texts[entity.uid].position.x = x + entity.c.position.x;
                texts[entity.uid].position.y = y + entity.c.position.y;
            }

            // Update sprite positions.
            if (entity.has('sprite')) {
                var sprite = sprites[entity.uid];
                sprite.position.x = x + entity.c.position.x;
                sprite.position.y = y + entity.c.position.y;

                // Rotate.
                if (entity.has('rotation')) {
                    entity.c.rotation.angle += entity.c.rotation.speed;
                    sprite.rotation = entity.c.rotation.angle;
                }
            }

        };

        // Called at the end of every tick.
        this.tickEnd = function () {
            x = newX;
            y = newY;
        };

        this.setText = function (entity, text) {
            texts[entity.uid].setText(text);
        };

        this.setSprite = function (entity, path) {
            var id = entity.uid;

            // Remove old sprite.
            if (_.has(sprites, id)) {
                stage.removeChild(sprites[id]);
            }
            delete sprites[id];
            delete textures[id];

            // Add new sprite.
            entity.c.sprite.path = path;
            this.build(entity);
        };

        this.show = function (entity) {
            entity.c.sprite.visible = sprites[entity.uid].visible = true;
        };

        this.hide = function (entity) {
            entity.c.sprite.visible = sprites[entity.uid].visible = false;
        };

        this.shake = function (magnitude, decay) {
            xShake = magnitude;
            yShake = magnitude;
            shakeDecay = decay;
        };

        // Preload assets.
        this.load = function (assets) {
            var loader = new PixiAssetLoader(assets);
            loader.load();
        };

        // Get offset from camera.
        this.relativeMousePos = function (absoluteMousePos) {
            return {
                x: absoluteMousePos.x - x,
                y: absoluteMousePos.y - y
            };
        };

        this.getPos = function () {
            return {
                x: -x,
                y: y
            };
        };
    };

    module.exports = RenderSystem;
} ());
