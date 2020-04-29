import Entity from './entity.js';
import World from './World.js';
import * as utils from './utils.js';

import Collision from './components/Collision.js';
import Position from './components/Position.js';
import Velocity from './components/Velocity.js';

import Circle from './components/graphics/Circle.js';
import Ellipse from './components/graphics/Ellipse.js';
import Graphic from './components/graphics/Graphic.js';
import Line from './components/graphics/Line.js';
import Polygon from './components/graphics/Polygon.js';
import Rectangle from './components/graphics/Rectangle.js';
import StaticSprite from './components/graphics/StaticSprite.js';
import Sprite from './components/graphics/Sprite.js';
import Text from './components/graphics/Text.js';

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
