import Entity from './entity.js';
import World from './world.js';
import * as utils from './utils.js';

import Collision from './components/collision.js';
import Position from './components/position.js';
import Velocity from './components/velocity.js';

import Circle from './components/graphics/circle.js';
import Ellipse from './components/graphics/ellipse.js';
import Graphic from './components/graphics/graphic.js';
import Line from './components/graphics/line.js';
import Polygon from './components/graphics/polygon.js';
import Rectangle from './components/graphics/rectangle.js';
import StaticSprite from './components/graphics/staticSprite.js';
import Sprite from './components/graphics/sprite.js';
import Text from './components/graphics/text.js';

import Base from './prefabs/base.js';
import Body from './prefabs/body.js';
import Static from './prefabs/static.js';
import StaticBody from './prefabs/staticBody.js';

import CollisionSystem from './systems/collisionSystem.js';
import ControlsSystem from './systems/controlsSystem.js';
import PixiRenderSystem from './systems/pixiRenderSystem.js';
import RoomSystem from './systems/roomSystem.js';
import SoundSystem from './systems/soundSystem.js';
import VelocitySystem from './systems/velocitySystem.js';


const hitagi = {
    Entity,
    World,
    utils,
    components: {
        Collision,
        Position,
        Velocity,
        graphics: {
            Circle,
            Ellipse,
            Graphic,
            Line,
            Polygon,
            Rectangle,
            StaticSprite,
            Sprite,
            Text,
        }
    },
    prefabs: {
        Base,
        Body,
        Static,
        StaticBody,
    },
    systems: {
        CollisionSystem,
        ControlsSystem,
        PixiRenderSystem,
        RoomSystem,
        SoundSystem,
        VelocitySystem,
    },
};
export default hitagi;
