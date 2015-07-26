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
            entities[entity.uid] = entity;
            this.build(entity);
            return entity;
        };

        // Remove an entity from the world.
        this.remove = function (entity) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'remove')) {
                        system.remove(entity);
                    }
                }
            );

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

        // Build an entity into all registered systems.
        this.build = function (entity) {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'build')) {
                        system.build(entity);
                    }
                }
            );
        };

        // Rebuild an entity with all registered systems.

        // Clear all entities from the world and systems.
        this.clear = function () {
            _.each(
                systems,
                function (system) {
                    if (_.has(system, 'remove')) {
                        _.each(
                            entities,
                            function (entity) {
                                system.remove(entity);
                            }
                        );
                    }
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
