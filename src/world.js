(function () {
    'use strict';

    var _ = require('lodash');
    var Entity = require('./entity.js');

    var World = function () {

        var that = this;
        var entities = {};
        var systems = {};

        // Update the game by one tick.
        this.tick = function (dt) {
            tickStart(dt);
            update(dt);
            tickEnd(dt);
        };

        // Add an entity to the world.
        this.add = function (entity) {
            entity.world = this;
            entities[entity.uid] = entity;

            build(entity);
            track(entity);

            return entity;
        };

        // Remove an entity from the world.
        this.remove = function (entity) {
            destroy(entity);
            untrack(entity);

            delete entities[entity.uid];
        };

        // Register a system to the world.
        this.register = function (system) {
            system.$uid = _.uniqueId();
            systems[system.$uid] = system;

            setupTracking(system);
            _.each(entities, that.rebuild);

            return system;
        };

        // Deregister a system from the world.
        this.deregister = function (systemID) {
            if (_.has(system, 'deregister')) {
                system.deregister();
            }

            delete systems[systemID];
        };

        // Rebuild an entity with all registered systems.
        this.rebuild = function (entity, just) {
            destroy(entity, just);
            untrack(entity);

            build(entity, just);
            track(entity);
        };

        // Clear all entities from the world and systems.
        this.clear = function () {
            _.each(
                entities,
                function (entity) {
                    destroy(entity);
                    untrack(entity);
                }
            );
            entities = {};
        };

        // Save the world's entities as JSON.
        this.save = function () {
            var saved = [];

            _.each(
                entities,
                function (entity) {
                    var copy = {};

                    _.each(
                        entity.c,
                        function (component) {
                            copy[component.$id] = _.clone(component);
                        }
                    );

                    saved.push(copy);
                }
            );

            return saved;
        };

        // Load entities from JSON into the world.
        this.load = function (componentBatches) {
            _.each(
                componentBatches,
                function (componentBatch) {
                    var newEntity = new Entity();

                    _.each(
                        componentBatch,
                        function (component) {
                            newEntity.c[component.$id] = _.clone(component);
                        }
                    );

                    that.add(newEntity);
                }
            );
        };

        // Call all registered system's tick start function.
        var tickStart = function (dt) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'tickStart')) {
                        system.tickStart(dt);
                    }
                }
            );
        };

        // Call all registered system's update function, passing a timestep.
        var update = function (dt) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'update')) {
                        _.each(
                            entities,
                            function (entity) {
                                if (!_.isUndefined(entity)) {
                                    _.each(system.update, function (func, id) {
                                        if (entity.has(id)){
                                            func(entity, dt);
                                        }
                                    });
                                }
                            }
                        );
                    }
                }
            );
        };

        // Call all registered system's tick end function.
        var tickEnd = function (dt) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'tickEnd')) {
                        system.tickEnd(dt);
                    }
                }
            );
        };

        // Build an entity in all registered systems.
        // If 'just' is given, just systems that deal with that
        // component build the entity rather than all.
        var build = function (entity, just) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'build')) {
                        _.each(system.build, function (func, id) {
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
                }
            );
        };

        // Destroys an entity in all registered systems.
        // If 'just' is given, just systems that deal with that
        // component destroy the entity rather than all.
        var destroy = function (entity, just) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'destroy')) {
                        _.each(system.destroy, function (func, id) {
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
                }
            );
        };

        // Setup tracking on a system.
        // Creates the appropriate data structure on the $tracked object.
        var setupTracking = function (system) {
            if (_.has(system, '$tracking')) {
                system.$tracked = {};
                _.each(
                    system.$tracking,
                    function (trackingType, id) {
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
                    }
                );
            }
        };

        // Make systems track a given entity.
        // The entity will be referenced by the $tracked object.
        var track = function (entity) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, '$tracking')) {
                        _.each(system.$tracking, function (trackingType, id) {
                            if (entity.has(id)){
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
                }
            );
        };

        // Stop systems from tracking a given entity.
        // The entity will no longer be referenced by the $tracked object
        // until it is tracked again.
        var untrack = function (entity) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, '$tracking')) {
                        _.each(system.$tracking, function (trackingType, id) {
                            if (entity.has(id)){
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
                }
            );
        };

    };

    module.exports = World;
} ());
