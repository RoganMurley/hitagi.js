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
            that.tickStart(dt);
            that.update(dt);
            that.tickEnd(dt);
        };

        // Add an entity to the world.
        this.add = function (entity) {
            entity.world = this;
            entities[entity.uid] = entity;
            this.build(entity);
            return entity;
        };

        // Remove an entity from the world.
        this.remove = function (entity) {
            this.destroy(entity);
            delete entities[entity.uid];
        };

        // Call all system's tick start callback.
        this.tickStart = function () {
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
        this.update = function (dt) {
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
        this.tickEnd = function () {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'tickEnd')) {
                        system.tickEnd();
                    }
                }
            );
        };

        // Register a system to the world.
        // Systems with higher priority will be updated first.
        this.register = function (system) {
            // No priority is the lowest priority.
            if (!_.has(system, 'priority')) {
                system.priority = -Infinity;
            }

            systems.push(system);
            systems = _.sortByOrder(systems, ['priority'], [false]);

            return system;
        };

        // Build an entity into systems.
        // If trackID is given, only systems tracking
        // that ID build the entity, otherwise all systems do.
        this.build = function (entity, trackID) {
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
        this.destroy = function (entity, trackID) {
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

        // Rebuild an entity with all registered systems.
        this.rebuild = function (entity, trackID) {
            that.destroy(entity, trackID);
            that.build(entity, trackID);
        };

        // Clear all entities from the world and systems.
        this.clear = function () {
            _.each(
                entities,
                function (entity) {
                    that.destroy(entity);
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
                            copy[component.id] = _.clone(component);
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
                            newEntity.c[component.id] = _.clone(component);
                        }
                    );

                    that.add(newEntity);
                }
            );
        };
    };

    module.exports = World;
} ());
