(function () {
    'use strict';

    var _ = require('lodash');
    var pixi = require('pixi.js');

    var utils = require('../utils.js'),
        look = utils.look,
        proxy = utils.proxy;

    var PixiRenderSystem = function (stage) {
        var that = this;

        var sprites = {};
        var graphics = {};

        var offset = {
            x: 0,
            y: 0
        };

        var redraw = function (newValue, entity) {
            // Remove old sprite.
            stage.removeChild(graphics[entity.uid]);
            delete graphics[entity.uid];

            // Add new sprite.
            that.build.graphic(entity);
        };

        // Build the system, called by world on every entity.
        this.build = {
            text: function (entity) {
                if (entity.c.text.bitmapFont) {
                    graphics[entity.uid] = new pixi.extras.BitmapText(
                        entity.c.text.copy,
                        entity.c.text.style
                    );
                } else {
                    graphics[entity.uid] = new pixi.Text(
                        entity.c.text.copy,
                        entity.c.text.style
                    );
                }

                proxy(entity.c.text, 'copy', graphics[entity.uid], 'text');
                proxy(entity.c.text, 'style', graphics[entity.uid], 'style');
            },

            graphic: function (entity) {
                // Proxy graphic properties.
                var propertiesToProxy = ['alpha', 'anchor', 'scale', 'tint', 'visible', 'z'];
                _.each(
                    propertiesToProxy,
                    function (property) {
                        graphics[entity.uid][property] = entity.c.graphic[property];
                        proxy(entity.c.graphic, property, graphics[entity.uid], property);
                    }
                );

                // Add child to stage.
                stage.addChild(graphics[entity.uid]);

                // Sort stage by depth.
                stage.children = _.sortBy(stage.children, 'z');

                // Refresh screen.
                that.update.graphic(entity);
            }
        };

        // Destroy an entity from the system.
        this.destroy = {
            graphic: function (entity) {
                var id = entity.uid;

                if (_.has(graphics, id)) {
                    stage.removeChild(graphics[id]);
                }

                delete graphics[id];
            }
        };

        this.update = {
            graphic: function (entity)  {
                var graphic = graphics[entity.uid];

                var x = entity.c.graphic.translate.x;
                var y = entity.c.graphic.translate.y;

                if (entity.c.graphic.relative) {
                    x += entity.c.position.x;
                    y += entity.c.position.y;
                }

                graphic.position.x = Math.floor(x);
                graphic.position.y = Math.floor(y);
            }

        };

         // Preload assets.
        this.load = function (assets, callback) {
            var loader = new pixi.loaders.Loader();

            if (!_.isArray(assets)) {
                assets = [assets];
            }
            _.each(assets, function (asset) {
                loader.add(asset, asset);
            });

            if (callback) {
                loader.once('complete', callback);
            }
            loader.load();
        };
    };

    module.exports = PixiRenderSystem;
} ());
