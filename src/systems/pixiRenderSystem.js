import _ from 'lodash';
import pixi from 'pixi.js';
import {look, proxy, readOnlyProxy} from '../utils.js';

export default class PixiRenderSystem {
  constructor(params) {
    params = {width: 600, height: 400, ...params};

    this._stage = new pixi.Container();
    this._stage.interactive = true;

    this._renderer = pixi.autoDetectRenderer(params.width, params.height);

    this._sprites = {};
    this._graphics = {};

    this._offset = {x: 0, y: 0};

    // Getter for renderer view.
    Object.defineProperty(this, 'view', { get: () => this._renderer.view });

    // Build the system, called by world on every entity.
    this.build = {
      circle: (entity) => {
        const {circle, graphic} = entity.c;
        const {color, radius} = circle;
        const {anchor} = graphic;

        this._graphics[entity.uid] = new pixi.Graphics();
        this._graphics[entity.uid].beginFill(color);

        this._graphics[entity.uid].drawCircle(
          -radius * anchor.x,
          -radius * anchor.y,
          circle.radius,
        );

        // Look for changes to radius, redrawing if necessary.
        look(circle, 'radius', this._redraw.bind(this), entity);

        proxy(circle, 'color', this._graphics[entity.uid], 'color');
      },

      ellipse : (entity) => {
        const {ellipse, graphic} = entity.c;
        const {color, width, height} = ellipse;
        const {anchor} = graphic;

        this._graphics[entity.uid] = new pixi.Graphics();
        this._graphics[entity.uid].beginFill(color);

        this._graphics[entity.uid].drawEllipse(
          -width * anchor.x,
          -height * anchor.y,
          width,
          height
        );

        // Look for changes to dimensions, redrawing if necessary.
        look(ellipse, 'width', this._redraw.bind(this), entity);
        look(ellipse, 'height', this._redraw.bind(this), entity);

        // Primitives don't have anchors, so we look at the anchor and redraw when it changes.
        look(graphic, 'anchor', this._redraw.bind(this), entity);

        proxy(ellipse, 'color', this._graphics[entity.uid], 'color');
      },

      line : (entity) => {
        const {line} = entity.c;
        const {thickness, color, x1, y1, x2, y2} = line;

        this._graphics[entity.uid] = new pixi.Graphics();
        this._graphics[entity.uid].lineStyle(thickness, color, 1);
        this._graphics[entity.uid].moveTo(x1, y1);
        this._graphics[entity.uid].lineTo(x2, y2);

        // Look for changes to params, redrawing if necessary.
        look(line, 'thickness', this._redraw.bind(this), entity);
        look(line, 'x1', this._redraw.bind(this), entity);
        look(line, 'y1', this._redraw.bind(this), entity);
        look(line, 'x2', this._redraw.bind(this), entity);
        look(line, 'y2', this._redraw.bind(this), entity);

        proxy(line, 'color', this._graphics[entity.uid], 'color');
      },

      polygon: (entity) => {
        const {polygon} = entity.c;
        const {color, points} = polygon;

        this._graphics[entity.uid] = new pixi.Graphics();
        this._graphics[entity.uid].beginFill(color);
        this._graphics[entity.uid].drawPolygon(points);
        this._graphics[entity.uid].endFill();

        // Look for changes to params, redrawing if necessary.
        look(polygon, 'points', this._redraw.bind(this), entity);

        proxy(polygon, 'color', this._graphics[entity.uid], 'color');
      },

      rectangle : (entity) => {
        const {graphic, rectangle} = entity.c;
        const {anchor} = graphic;
        const {width, height} = rectangle;

        this._graphics[entity.uid] = new pixi.Graphics();
        this._graphics[entity.uid].beginFill(entity.c.rectangle.color);

        this._graphics[entity.uid].drawRect(
          -width * anchor.x,
          -height * anchor.y,
          width,
          height
        );

        // Look for changes to params, redrawing if necessary.
        look(rectangle, 'width', this._redraw.bind(this), entity);
        look(rectangle, 'height', this._redraw.bind(this), entity);

        // Primitives don't have anchors, so we look at the anchor and redraw when it changes.
        look(graphic, 'anchor', this._redraw.bind(this), entity);

        proxy(rectangle, 'color', this._graphics[entity.uid], 'color');
      },

      sprite: (entity) => {
        const {graphic, sprite} = entity.c;
        const {anchor} = graphic;
        const {animationSpeed, currentFrame, loop, path, rotation} = sprite;

        let frames;

        // If spritesheet.
        if (_.isArray(path)) {
          frames = _.map(path, (framePath) => pixi.Texture.fromFrame(framePath));
        }
        // If array of frames.
        else {
          frames = _.map(path, (framePath) => pixi.Texture.fromImage(framePath));
        }

        this._graphics[entity.uid] = new pixi.extras.MovieClip(frames);

        // Set and proxy framespeed.
        this._graphics[entity.uid].animationSpeed = animationSpeed;
        proxy(
          sprite, 'animationSpeed',
          this._graphics[entity.uid], 'animationSpeed'
        );

        // Set and proxy loop.
        this._graphics[entity.uid].loop = loop;
        proxy(
          entity.c.sprite, 'loop',
          this._graphics[entity.uid], 'loop'
        );

        this._graphics[entity.uid].gotoAndPlay(currentFrame);

        // Set and proxy rotation.
        this._graphics[entity.uid].rotation = rotation;
        proxy(sprite, 'rotation', this._graphics[entity.uid], 'rotation');

        // Redraw on path change.
        look(sprite, 'path', this._redraw.bind(this), entity);

        // Change animation frame on frame change.
        look(
          sprite,
          'currentFrame',
          (currentFrame, entity) => {
            this._graphics[entity.uid].gotoAndPlay(currentFrame);
          },
          entity
        );

        // Read only framecount property.
        readOnlyProxy(
          sprite,
          'frameCount',
          this._graphics[entity.uid],
          'totalFrames'
        );

        // Anchor is a Pixi property on MovieClip, so is proxied here.
        this._graphics[entity.uid].anchor = anchor;
        proxy(graphic, 'anchor', this._graphics[entity.uid], 'anchor');
      },

      staticSprite: (entity) => {
        const {graphic, staticSprite} = entity.c;
        const {anchor} = graphic;
        const {rotation} = staticSprite;

        const texture = pixi.Texture.fromImage(staticSprite.path);
        this._graphics[entity.uid] = new pixi.Sprite(texture);

        // Set and proxy rotation.
        this._graphics[entity.uid].rotation = rotation;
        proxy(staticSprite, 'rotation', this._graphics[entity.uid], 'rotation');

        // Redraw on path change.
        look(staticSprite, 'path', this._redraw.bind(this), entity);

        // Anchor is a Pixi property on Sprite, so is proxied here.
        this._graphics[entity.uid].anchor = anchor;
        proxy(graphic, 'anchor', this._graphics[entity.uid], 'anchor');
      },

      text: (entity) => {
        const {graphic, text} = entity.c;
        const {anchor} = graphic;
        const {bitmapFont, copy, rotation, style} = text;

        // Create the appropriate graphic.
        if (bitmapFont) {
          this._graphics[entity.uid] = new pixi.extras.BitmapText(copy, style);
        } else {
          this._graphics[entity.uid] = new pixi.Text(copy, style);
        }

        // Proxy text properties.
        proxy(text, 'copy', this._graphics[entity.uid], 'text');
        proxy(text, 'style', this._graphics[entity.uid], 'style');

        // Set and proxy rotation.
        this._graphics[entity.uid].rotation = rotation;
        proxy(text, 'rotation', this._graphics[entity.uid], 'rotation');

        // Anchor is a Pixi property on text, so is proxied here.
        this._graphics[entity.uid].anchor = anchor;
        proxy(graphic, 'anchor', this._graphics[entity.uid], 'anchor');
      },

      graphic: (entity) => {
        const {graphic} = entity.c;

        // Proxy graphic properties.
        // Anchor is handled elsewhere.
        const propertiesToProxy = ['alpha', 'scale', 'tint', 'visible', 'z'];
        _.each(
          propertiesToProxy,
          (property) => {
            this._graphics[entity.uid][property] = graphic[property];
            proxy(graphic, property, this._graphics[entity.uid], property);
          }
        );

        // Add child to stage.
        this._stage.addChild(this._graphics[entity.uid]);

        // Sort stage by depth.
        this._stage.children = _.sortBy(this._stage.children, 'z');

        // Refresh screen.
        this.update.graphic(entity);
      }
    };

    // Destroy an entity from the system.
    this.destroy = {
      graphic: (entity) => {
        const {uid} = entity;

        if (_.has(this._graphics, uid)) {
          this._stage.removeChild(this._graphics[uid]);
        }

        delete this._graphics[uid];
      }
    };

    this.update = {
      graphic: (entity) => {
        const {graphic, position} = entity.c;
        const {translate, relative} = graphic;

        let x = translate.x;
        let y = translate.y;

        if (relative) {
          x += position.x;
          y += position.y;
        }

        this._graphics[entity.uid].position.x = Math.floor(x);
        this._graphics[entity.uid].position.y = Math.floor(y);
      }

    };
  }

  _redraw(newValue, entity) {
    // Remove old sprite.
    this._stage.removeChild(this._graphics[entity.uid]);
    delete this._graphics[entity.uid];

    // Add new sprite.
    _.each(this.build,
      (func, key) => {
        if (key === 'graphic') {
          return;
        }
        if (entity.has(key)) {
          func(entity);
        }
      }
    );
    this.build.graphic(entity);
  }

  // Render stage to a renderer.
  render() {
    this._renderer.render(this._stage);
  }

  // Preload assets.
  load(assets, callback) {
    const loader = new pixi.loaders.Loader();

    if (!_.isArray(assets)) {
      assets = [assets];
    }
    _.each(assets, (asset) => loader.add(asset, asset));
    if (callback) {
      loader.once('complete', callback);
    }
    loader.load();
  }
}
