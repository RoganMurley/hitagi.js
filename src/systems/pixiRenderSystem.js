(function () {
    'use strict';

    var _ = require('lodash');
    var pixi = require('pixi.js');

    var proxy = require('../proxy.js');

    var PixiRenderSystem = function (stage) {
        var that = this;

        var sprites = {};
        var textures = {};
        var graphics = {};

        var offset = {
            x: 0,
            y: 0
        };

        // Build the system, called by world on every entity.
        this.build = function (entity) {
            if (entity.has('graphic')) {
                switch (entity.c.graphic.type) {

                    case 'circle':
                        graphics[entity.uid] = new pixi.Graphics();
                        graphics[entity.uid].beginFill(entity.c.graphic.color);
                        graphics[entity.uid].drawCircle(0, 0, entity.c.graphic.radius);
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
                        break;

                    case 'sprite':
                        var path = entity.c.graphic.path,
                            texture = pixi.Texture.fromImage(path);

                        textures[entity.uid] = texture;
                        graphics[entity.uid] = new pixi.Sprite(texture);

                        // Set anchor.
                        graphics[entity.uid].anchor.x = 0.5;
                        graphics[entity.uid].anchor.y = 0.5;

                        // Set and proxy visibility.
                        graphics[entity.uid].visible = entity.c.graphic.visible;
                        proxy(
                            entity.c.graphic,
                            'visible',
                            graphics[entity.uid],
                            'visible'
                        );

                        // Custom proxy to make sure sprite changes properly occur.
                        Object.defineProperty(
                            entity.c.graphic,
                            'path',
                            {
                                get: function () {
                                    return path;
                                },
                                set: function (newValue) {
                                    path = newValue;

                                    // Remove old sprite.
                                    stage.removeChild(graphics[entity.uid]);
                                    delete graphics[entity.uid];
                                    delete textures[entity.uid];

                                    // Add new sprite.
                                    that.build(entity);
                                    that.update(entity);
                                }
                            }
                        );
                        break;

                    case 'text':
                        graphics[entity.uid] = new pixi.Text(
                            entity.c.graphic.copy,
                            entity.c.graphic.options
                        );
                        proxy(entity.c.graphic, 'copy', graphics[entity.uid], 'text');
                        break;

                    default:
                        throw new Error('InvalidGraphicType');
                }

                stage.addChild(graphics[entity.uid]);
            }
        };

        // Remove an entity from the system.
        this.remove = function (entity) {
            var id = entity.uid;

            if (_.has(graphics, id)) {
                stage.removeChild(graphics[id]);
            }

            delete graphics[id];
            delete textures[id];
        };

        this.update = function (entity) {
            if (entity.has('graphic')) {
                var graphic = graphics[entity.uid];
                graphic.position.x = entity.c.position.x + offset.x;
                graphic.position.y = entity.c.position.y + offset.y;
            }

        };

        // Preload assets.
        this.load = function (assets) {
            var loader = new pixi.AssetLoader(assets);
            loader.load();
        };
    };

    module.exports = PixiRenderSystem;
} ());
