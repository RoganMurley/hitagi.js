(function () {
    'use strict';

    var _ = require('lodash');

    var Entity = function () {
        var that = this;

        // Each entity had a unique ID.
        this.uid = _.uniqueId();

        // Each entity has a number of components.
        this.c = {};
        Object.seal(this.c);

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
            var newC = _.clone(that.c);
            newC[component.$id] = component;
            Object.seal(newC);
            this.c = newC;

            // If the entity has already been added to a world, rebuild it.
            if (this.world) {
                this.world.rebuild(this, component.$id);
            }

            return this;
        };

        // Remove a component from the entity.
        this.detach = function (componentID) {
            // Check that the component was not a dependency.
            _.each(
                that.c,
                function (component) {
                    var dependencyExists = _.any(
                        component.$deps,
                        function (dep) {
                            return dep === componentID;
                        }
                    );
                    if (dependencyExists) {
                        console.error(component.$id + ' depends on ' + componentID);
                        throw new Error('ComponentDependencyMissing');
                    }
                }
            );

            // Detach the component.
            var newC = _.clone(that.c);
            delete newC[componentID];
            Object.seal(newC);
            this.c = newC;

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
