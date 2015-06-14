(function () {
    'use strict';

    var hitagi = {
        'Entity': require('./entity.js'),
        'World': require('./world.js'),
        'Controls': require('./controls.js'),
        'Utils': require('./utils.js'),
        'components': {
            'Collision': require('./components/collision.js'),
            'Line': require('./components/line.js'),
            'Position': require('./components/position.js'),
            'Rectangle': require('./components/rectangle.js'),
            'Sprite': require('./components/sprite.js'),
            'Text': require('./components/text.js'),
            'Velocity': require('./components/velocity.js')
        },
        'systems': {
            'CollisionSystem': require('./systems/collisionSystem.js'),
            'PixiRenderSystem': require('./systems/pixiRenderSystem.js'),

            'SoundSystem': require('./systems/soundSystem.js'),
            'VelocitySystem': require('./systems/velocitySystem.js')
        }
    };

    module.exports = hitagi;
} ());
