import Base from './base.js';
import Collision from '../components/collision.js';


export default function Body(params) {
  return new Base(params)
    .attach(new Collision(params));
};
