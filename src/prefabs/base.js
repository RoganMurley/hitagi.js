import Static from './static.js';
import Velocity from '../components/velocity.js';


export default function Basic(params) {
    params = {xspeed: 0, yspeed: 0, ...params};
    return new Static(params)
        .attach(new Velocity(params));
}
