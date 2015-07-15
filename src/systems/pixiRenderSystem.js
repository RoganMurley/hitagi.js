(function () {
    'use strict';

    var _ = require('lodash');
    var pixi = require('pixi.js');

    var PixiRenderSystem = function (stage) {
        var that = this;

        var sprites = {};
        var textures = {};
        var texts = {};
        var lines = {};
        var rectangles = {};

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
            if (entity.has('line')) {
                lines[entity.uid] = new pixi.Graphics();
                lines[entity.uid].moveTo(entity.c.position.x, entity.c.position.y);
                lines[entity.uid].lineTo(entity.c.line.x, entity.c.line.y);

                stage.addChild(lines[entity.uid]);
            }
            if (entity.has('rectangle')) {
                rectangles[entity.uid] = new pixi.Graphics();
                rectangles[entity.uid].beginFill(entity.c.rectangle.color);
                rectangles[entity.uid].drawRect(
                    entity.c.rectangle.x1,
                    entity.c.rectangle.y1,
                    entity.c.rectangle.x2,
                    entity.c.rectangle.y2
                );

                stage.addChild(rectangles[entity.uid]);
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
            if (_.has(rectangles, id)) {
                stage.removeChild(rectangles[id]);
            }

            delete sprites[id];
            delete textures[id];
            delete texts[id];
            delete lines[id];
            delete rectangles[id];
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

            if (entity.has('rectangle')) {
                var rectangle = rectangles[entity.uid];
                rectangle.position.x = entity.c.position.x + entity.c.rectangle.offsetX;
                rectangle.position.y = entity.c.position.y + entity.c.rectangle.offsetY;
            }

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
