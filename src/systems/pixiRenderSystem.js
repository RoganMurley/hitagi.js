(function () {
    'use strict';

    var _ = require('lodash');
    var pixi = require('pixi.js');

    var PixiRenderSystem = function (stage) {
        var that = this;

        var sprites = {};
        var textures = {};
        var texts = {};
        var graphics = {};

        var offset = {
            x: 0,
            y: 0
        };

        // Build the system, called by world on every entity.
        this.build = function (entity) {
            if (entity.has('sprite')) {
                var path = entity.c.sprite.path,
                    texture = pixi.Texture.fromImage(path);

                textures[entity.uid] = texture;
                var sprite = sprites[entity.uid] = new pixi.Sprite(texture);

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
                texts[entity.uid] = new pixi.Text(
                        entity.c.text.txt,
                        entity.c.text.options
                    );

                stage.addChild(texts[entity.uid]);
            }

            if (entity.has('graphic')) {
                switch (entity.c.graphic.type) {
                    case 'circle':
                        graphics[entity.uid] = new pixi.Graphics();
                        graphics[entity.uid].beginFill(entity.c.graphic.color);
                        graphics[entity.uid].drawCircle(0, 0, entity.c.graphic.radius);

                        stage.addChild(graphics[entity.uid]);
                        break;

                    case 'rectangle':
                        graphics[entity.uid] = new pixi.Graphics();
                        graphics[entity.uid].beginFill(entity.c.graphic.color);
                        graphics[entity.uid].drawRect(
                            -entity.c.graphic.width/2,
                            -entity.c.graphic.height/2,
                            entity.c.graphic.width,
                            entity.c.graphic.height
                        );

                        stage.addChild(graphics[entity.uid]);
                        break;

                    default:
                        throw new Error('InvalidGraphicType');
                }
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
            if (_.has(graphics, id)) {
                stage.removeChild(graphics[id]);
            }

            delete sprites[id];
            delete textures[id];
            delete texts[id];
            delete graphics[id];
        };

        this.update = function (entity) {

            // Update text positions.
            if (entity.has('text')) {
                texts[entity.uid].position.x = entity.c.position.x + offset.x;
                texts[entity.uid].position.y = entity.c.position.y + offset.y;
            }

            // Update sprite positions.
            if (entity.has('sprite')) {
                var sprite = sprites[entity.uid];
                sprite.position.x = entity.c.position.x + offset.x;
                sprite.position.y = entity.c.position.y + offset.y;
            }

            if (entity.has('graphic')) {
                var graphic = graphics[entity.uid];
                graphic.position.x = entity.c.position.x + offset.x;
                graphic.position.y = entity.c.position.y + offset.y;
            }

        };

        this.setText = function (entity, text) {
            texts[entity.uid].text = text;
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

        // Show a display object.
        this.show = function (entity) {
            entity.c.sprite.visible = sprites[entity.uid].visible = true;
        };

        // Hide a display object.
        this.hide = function (entity) {
            entity.c.sprite.visible = sprites[entity.uid].visible = false;
        };

        // Preload assets.
        this.load = function (assets) {
            var loader = new pixi.AssetLoader(assets);
            loader.load();
        };
    };

    module.exports = PixiRenderSystem;
} ());
