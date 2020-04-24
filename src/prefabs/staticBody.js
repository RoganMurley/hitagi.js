import Static from './static.js';
import Collision from '../components/collision.js';


export default function StaticBody(params) {
  return new Static(params)
    .attach(new Collision(params));
};
