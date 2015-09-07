(function () {
    'use strict';

    var _ = require('lodash');

    var Entity = function () {
        var that = this;

        // Each entity had a unique ID.
        this.uid = _.uniqueId();

        // Each entity has a number of components.
        this.c = {};

        // World this entity has been added to.
        this.world = null;

        // Attach a component to the entity.
        this.attach = function (component) {
            // Check component's dependencies are met.
            _.each(
                component.$deps,
                function (dependencyID) {
                    if (!that.has(dependencyID)) {
                        console.error(dependencyID + ' component missing.');
                        throw new Error('ComponentDependencyMissing');
                    }
                }
            );

            // Check component is not already attached.
            if (this.has(component.$id)) {
                throw new Error('ComponentAlreadyAttached');
            }

            // Attach component.
            this.c[component.$id] = component;

            // If the entity has already been added to a world, rebuild it.
            if (this.world) {
                this.world.rebuild(this, component.$id);
            }

            return this;
        };

        // Remove a component from the entity.
        this.detach = function (componentID){
            delete this.c[componentID];

            if (this.world) {
                this.world.rebuild(this);
            }
        };

        // Check if the entity has a given component.
        this.has = function (componentID) {
            return _.has(this.c, componentID);
        };
    };

    module.exports = Entity;
} ());
