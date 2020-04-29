import { delta } from '../utils.js';

export default class VelocitySystem {
    constructor() {
        this.update = {
            velocity: (entity, dt) => {
                const {position, velocity} = entity.c;
                position.x += delta(velocity.xspeed, dt);
                position.y += delta(velocity.yspeed, dt);
            }
        };
    }
}
