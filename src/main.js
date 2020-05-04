import Entity from './entity.js';
import World from './world.js';
import * as utils from './utils.js';
import prefabs from './prefabs/prefabs.js';
import systems from './systems/systems.js';
import components from './components/components.js';


const hitagi = {
  Entity,
  World,
  utils,
  prefabs,
  components,
  systems,
};
export default hitagi;
