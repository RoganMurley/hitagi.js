(function () {
    'use strict';

    var hitagi = {
        'Entity': require('./entity.js'),
        'World': require('./world.js'),
        'Controls': require('./controls.js'),
        'Rooms': require('./rooms.js'),
        'utils': require('./utils.js'),
        'components': {
            'Collision': require('./components/collision.js'),
            'Body': require('./components/body.js'),
            'Graphic': require('./components/graphic.js'),
            'Position': require('./components/position.js'),
            'Velocity': require('./components/velocity.js')
        },
        'systems': {
            'CollisionSystem': require('./systems/collisionSystem.js'),
            'MatterPhysicsSystem': require('./systems/matterPhysicsSystem.js'),
            'PixiRenderSystem': require('./systems/pixiRenderSystem.js'),
            'SoundSystem': require('./systems/soundSystem.js'),
            'VelocitySystem': require('./systems/velocitySystem.js')
        }
    };

    module.exports = hitagi;
} ());
