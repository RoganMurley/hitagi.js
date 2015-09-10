(function () {
    'use strict';

    var _ = require('lodash');
    var Entity = require('./entity.js');

    var World = function () {

        var that = this;
        var entities = {};
        var systems = [];

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
            // Set up entity tracking.
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

            systems.push(system);

            return system;
        };

        // Rebuild an entity with all registered systems.
        this.rebuild = function (entity, trackID) {
            destroy(entity, trackID);
            untrack(entity);

            build(entity, trackID);
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

        // Call all system's tick start callback.
        var tickStart = function () {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'tickStart')) {
                        system.tickStart();
                    }
                }
            );
        };

        // Called every tick, updates every system.
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

        // Call all system's tick end callback.
        var tickEnd = function () {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'tickEnd')) {
                        system.tickEnd();
                    }
                }
            );
        };

        // Build an entity into systems.
        // If trackID is given, only systems tracking
        // that ID build the entity, otherwise all systems do.
        var build = function (entity, trackID) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'build')) {
                        _.each(system.build, function (func, id) {
                            if (entity.has(id)){
                                // Only build in tracking systems.
                                if (trackID) {
                                    if (id !== trackID) {
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

        // Destroy an entity in systems.
        // If trackID is given, only systems tracking
        // that ID destroy the entity, otherwise all systems do.
        var destroy = function (entity, trackID) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'destroy')) {
                        _.each(system.destroy, function (func, id) {
                            if (entity.has(id)){
                                // Only remove from tracking systems.
                                if (trackID) {
                                    if (id !== trackID) {
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

        // Track entities that systems want to.
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

        // Stop tracking entities that systems want to.
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
