import _ from 'lodash';
import Entity from './entity.js';


export default class World {
  constructor() {
    this._entities = {};
    this._systems = {};
  }

  // Update the game by one tick.
  tick(dt) {
    this.tickStart(dt);
    this.update(dt);
    this.tickEnd(dt);
  }

  // Add an entity to the world.
  add(entity) {
    entity.world = this;
    this._entities[entity.uid] = entity;

    this.build(entity);
    this.track(entity);

    return entity;
  }

  // Remove an entity from the world.
  remove(entity) {
    this.destroy(entity);
    this.untrack(entity);

    delete this._entities[entity.uid];
  }

  // Register a system to the world.
  register(system) {
    system.$uid = _.uniqueId();
    this._systems[system.$uid] = system;

    this.setupTracking(system);
    _.each(this._entities, entity => this.rebuild(entity));

    return system;
  }

  // Deregister a system from the world.
  deregister(system) {
    if (system.deregister) {
      system.deregister();
    }
    delete this._systems[system.$uid];
  }

  // Rebuild an entity with all registered systems.
  rebuild(entity, just) {
    this.destroy(entity, just);
    this.untrack(entity);

    this.build(entity, just);
    this.track(entity);
  }

  // Clear all entities from the world and systems.
  clear() {
    _.each(this._entities, entity => {
      this.destroy(entity);
      this.untrack(entity);
    });
    this._entities = {};
  }

  // Save the world's entities as JSON.
  save() {
      const saved = [];
      _.each(this._entities, entity => {
        const copy = {};
        _.each(entity.c, component => {
          copy[component.$id] = _.clone(component);
        });
        saved.push(copy);
      });
      return saved;
  }

  // Load entities from JSON into the world.
  load(componentBatches) {
    _.each(componentBatches, componentBatch => {
      const newEntity = new Entity();
      const newC = {};
      _.each(componentBatch, component => {
        newC[component.$id] = {...component};
      });

      newEntity.c = newC;
      this.add(newEntity);
    });
  }

  // Call all registered system's tick start function.
  tickStart(dt) {
    _.each(this._systems, system => {
      if (system.tickStart) {
        system.tickStart(dt);
      }
    });
  }

  // Call all registered system's update function, passing a timestep.
  update(dt) {
    _.each(this._systems, system => {
      if (system.update) {
        _.each(this._entities, entity => {
          if (!_.isUndefined(entity)) {
            _.each(system.update, (func, id) => {
              if (entity.has(id)){
                func(entity, dt);
              }
            });
          }
        });
      }
    });
  }

  // Call all registered system's tick end function.
  tickEnd(dt) {
    _.each(this._systems, system => {
      if (system.tickEnd){
        system.tickEnd(dt);
      }
    });
  }

  // Build an entity in all registered systems.
  // If 'just' is given, just systems that deal with that
  // component build the entity rather than all.
  build(entity, just) {
    _.each(this._systems, system => {
      if (system.build) {
        _.each(system.build, (func, id) => {
          if (entity.has(id)){
            // Only build in tracking systems.
            if (!_.isUndefined(just)) {
                if (id !== just) {
                    return;
                }
            }
            // Perform build.
            func(entity);
          }
        });
      }
    });
  }

  // Destroys an entity in all registered systems.
  // If 'just' is given, just systems that deal with that
  // component destroy the entity rather than all.
  destroy(entity, just) {
    _.each(this._systems, system => {
      if (system.destroy) {
        _.each(system.destroy, (func, id) => {
          if (entity.has(id)){
            // Only remove from tracking systems.
            if (!_.isUndefined(just)) {
              if (id !== just) {
                return;
              }
            }
            // Perform the remove.
            func(entity);
          }
        });
      }
    });
  }

  // Setup tracking on a system.
  // Creates the appropriate data structure on the $tracked object.
  setupTracking(system) {
    if (_.has(system, '$tracking')) {
      system.$tracked = {};
      _.each(system.$tracking, (trackingType, id) => {
        switch (trackingType) {
          case 'many':
            system.$tracked[id] = {};
            break;
          case 'single':
            system.$tracked[id] = null;
            break;
          default:
            throw new Error('UnknownTrackingType');
        }
      });
    }
  }

  // Make systems track a given entity.
  // The entity will be referenced by the $tracked object.
  track(entity) {
    _.each(this._systems, system => {
      if (_.has(system, '$tracking')) {
        _.each(system.$tracking, (trackingType, id) => {
          if (entity.has(id)) {
            switch (trackingType) {
              case 'many':
                system.$tracked[id][entity.uid] = entity;
                break;
              case 'single':
                if (system.$tracked[id] === null) {
                    system.$tracked[id] = entity;
                } else {
                    throw new Error('ExpectedSingleEntity');
                }
                break;
              default:
                throw new Error('UnknownTrackingType');
            }
          }
        });
      }
    });
  }

  // Stop systems from tracking a given entity.
  // The entity will no longer be referenced by the $tracked object
  // until it is tracked again.
  untrack(entity) {
    _.each(this._systems, system => {
      if (_.has(system, '$tracking')) {
        _.each(system.$tracking, (trackingType, id) => {
          if (entity.has(id)) {
            switch (trackingType) {
              case 'many':
                delete system.$tracked[id][entity.uid];
                break;
              case 'single':
                system.$tracked[id] = null;
                break;
              default:
                throw new Error('UnknownTrackingType');
            }
          }
        });
      }
    });
  }
}
