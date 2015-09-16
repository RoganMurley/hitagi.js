(function () {
    'use strict';

    var _ = require('lodash');
    var pixi = require('pixi.js');

    var utils = require('../utils.js'),
        look = utils.look,
        proxy = utils.proxy,
        readOnlyProxy = utils.readOnlyProxy;

    var PixiRenderSystem = function (params) {
        var that = this;

        params = _.extend({
            width: 600,
            height: 400
        }, params);

        var stage = new pixi.Container();

        var renderer = pixi.autoDetectRenderer(params.width, params.height);

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
            _.each(
                that.build,
                function (func, key) {
                    if (key === 'graphic') {
                        return;
                    }
                    if (entity.has(key)) {
                        func(entity);
                    }
                }
            );
            that.build.graphic(entity);
        };

        // Getter for renderer view.
        Object.defineProperty(
            this,
            'view',
            {
                get: function() {
                    return renderer.view;
                }
            }
        );

        // Render stage to a renderer.
        this.render = function () {
            renderer.render(stage);
        };

        // Build the system, called by world on every entity.
        this.build = {

            circle: function (entity) {
                graphics[entity.uid] = new pixi.Graphics();
                graphics[entity.uid].beginFill(entity.c.circle.color);

                graphics[entity.uid].drawCircle(
                    -entity.c.circle.radius * entity.c.graphic.anchor.x,
                    -entity.c.circle.radius * entity.c.graphic.anchor.y,
                    entity.c.circle.radius
                );

                // Look for changes to radius, redrawing if necessary.
                look(entity.c.circle, 'radius', redraw, entity);
            },

            ellipse : function (entity) {
                graphics[entity.uid] = new pixi.Graphics();
                graphics[entity.uid].beginFill(entity.c.ellipse.color);

                graphics[entity.uid].drawEllipse(
                    -entity.c.ellipse.width * entity.c.graphic.anchor.x,
                    -entity.c.ellipse.height * entity.c.graphic.anchor.y,
                    entity.c.ellipse.width,
                    entity.c.ellipse.height
                );

                // Look for changes to dimensions, redrawing if necessary.
                look(entity.c.ellipse, 'width', redraw, entity);
                look(entity.c.ellipse, 'height', redraw, entity);

                // Primitives don't have anchors, so we look at the anchor and redraw when it changes.
                look(entity.c.graphic, 'anchor', redraw, entity);
            },

            line : function (entity) {
                graphics[entity.uid] = new pixi.Graphics();
                graphics[entity.uid].lineStyle(
                    entity.c.line.thickness,
                    entity.c.line.color,
                    1
                );
                graphics[entity.uid].moveTo(
                    entity.c.line.x1,
                    entity.c.line.y1
                );
                graphics[entity.uid].lineTo(
                    entity.c.line.x2,
                    entity.c.line.y2
                );

                // Look for changes to params, redrawing if necessary.
                look(entity.c.line, 'thickness', redraw, entity);
                look(entity.c.line, 'x1', redraw, entity);
                look(entity.c.line, 'y1', redraw, entity);
                look(entity.c.line, 'x2', redraw, entity);
                look(entity.c.line, 'y2', redraw, entity);
            },

            polygon: function (entity) {
                graphics[entity.uid] = new pixi.Graphics();
                graphics[entity.uid].beginFill(entity.c.polygon.color);
                graphics[entity.uid].drawPolygon(entity.c.polygon.points);
                graphics[entity.uid].endFill();

                // Look for changes to params, redrawing if necessary.
                look(entity.c.polygon, 'points', redraw, entity);
            },

            rectangle : function (entity) {
                graphics[entity.uid] = new pixi.Graphics();
                graphics[entity.uid].beginFill(entity.c.rectangle.color);

                graphics[entity.uid].drawRect(
                    -entity.c.rectangle.width * entity.c.graphic.anchor.x,
                    -entity.c.rectangle.height * entity.c.graphic.anchor.y,
                    entity.c.rectangle.width,
                    entity.c.rectangle.height
                );

                // Look for changes to params, redrawing if necessary.
                look(entity.c.rectangle, 'width', redraw, entity);
                look(entity.c.rectangle, 'height', redraw, entity);

                // Primitives don't have anchors, so we look at the anchor and redraw when it changes.
                look(entity.c.graphic, 'anchor', redraw, entity);
            },

            sprite: function (entity) {
                var frames;

                // If spritesheet.
                if (_.isArray(entity.c.sprite.path)) {
                    frames = _.map(entity.c.sprite.path, function (framePath) {
                        return pixi.Texture.fromFrame(framePath);
                    });
                }
                // If array of frames.
                else {
                    frames = _.map(entity.c.sprite.path, function (framePath) {
                        return pixi.Texture.fromImage(framePath);
                    });
                }

                graphics[entity.uid] = new pixi.extras.MovieClip(frames);

                // Set and proxy framespeed.
                graphics[entity.uid].animationSpeed = entity.c.sprite.animationSpeed;
                proxy(
                    entity.c.sprite, 'animationSpeed',
                    graphics[entity.uid], 'animationSpeed'
                );

                // Set and proxy loop.
                graphics[entity.uid].loop = entity.c.sprite.loop;
                proxy(
                    entity.c.sprite, 'loop',
                    graphics[entity.uid], 'loop'
                );

                graphics[entity.uid].gotoAndPlay(entity.c.sprite.currentFrame);

                // Set and proxy rotation.
                graphics[entity.uid].rotation = entity.c.sprite.rotation;
                proxy(entity.c.sprite, 'rotation', graphics[entity.uid], 'rotation');

                // Redraw on path change.
                look(entity.c.sprite, 'path', redraw, entity);

                // Change animation frame on frame change.
                look(
                    entity.c.sprite,
                    'currentFrame',
                    function (currentFrame, entity) {
                        graphics[entity.uid].gotoAndPlay(currentFrame);
                    },
                    entity
                );

                // Read only framecount property.
                readOnlyProxy(
                    entity.c.sprite,
                    'frameCount',
                    graphics[entity.uid],
                    'totalFrames'
                );

                // Anchor is a Pixi property on MovieClip, so is proxied here.
                graphics[entity.uid].anchor = entity.c.graphic.anchor;
                proxy(entity.c.graphic, 'anchor', graphics[entity.uid], 'anchor');
            },

            staticSprite: function (entity) {
                var texture = pixi.Texture.fromImage(entity.c.staticSprite.path);
                graphics[entity.uid] = new pixi.Sprite(texture);

                // Set and proxy rotation.
                graphics[entity.uid].rotation = entity.c.staticSprite.rotation;
                proxy(entity.c.staticSprite, 'rotation', graphics[entity.uid], 'rotation');

                // Redraw on path change.
                look(entity.c.staticSprite, 'path', redraw, entity);

                // Anchor is a Pixi property on Sprite, so is proxied here.
                graphics[entity.uid].anchor = entity.c.graphic.anchor;
                proxy(entity.c.graphic, 'anchor', graphics[entity.uid], 'anchor');
            },

            text: function (entity) {
                // Create the appropriate graphic.
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

                // Proxy text properties.
                proxy(entity.c.text, 'copy', graphics[entity.uid], 'text');
                proxy(entity.c.text, 'style', graphics[entity.uid], 'style');

                // Anchor is a Pixi property on text, so is proxied here.
                graphics[entity.uid].anchor = entity.c.graphic.anchor;
                proxy(entity.c.graphic, 'anchor', graphics[entity.uid], 'anchor');
            },

            graphic: function (entity) {
                // Proxy graphic properties.
                // Anchor is handled elsewhere.
                var propertiesToProxy = ['alpha', 'scale', 'tint', 'visible', 'z'];
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
