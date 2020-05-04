import Entity from '../entity.js';
import Position from '../components/position.js';
import Graphic from '../components/graphics/graphic.js';


export default function Static(params) {
  params = {x: 0, y: 0, ...params};
  return new Entity()
    .attach(new Position(params))
    .attach(new Graphic(params));
}
