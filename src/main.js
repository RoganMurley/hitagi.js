(function () {
    'use strict';

    var Hitagi = {
        'Entity': require('./entity.js'),
        'World': require('./world.js'),
        'Controls': require('./controls.js'),
        'Utils': require('./utils.js'),
        'components': {
            'Position': require('./components/position.js'),
            'Velocity': require('./components/velocity.js'),
            'Collision': require('./components/collision.js'),
            'Sprite': require('./components/sprite.js'),
            'Text': require('./components/text.js'),
            'Line': require('./components/line.js')
        },
        'systems': {
            'VelocitySystem': require('./systems/velocitySystem.js'),
            'CollisionSystem': require('./systems/collisionSystem.js'),
            'SoundSystem': require('./systems/soundSystem.js'),
            'PixiRenderSystem': require('./systems/pixiRenderSystem.js')
        }
    };

    module.exports = Hitagi;
} ());
