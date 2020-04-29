import _ from 'lodash';


export default class Entity {
    constructor() {
    // Each entity had a unique ID.
        this.uid = _.uniqueId();

        // Each entity has a number of components.
        this.c = {};
        Object.seal(this.c);

        // World this entity has been added to.
        this.world = null;
    }

    // Attach a component to the entity.
    attach(component) {
    // Check component's dependencies are met.
        _.each(component.$deps, dependencyID => {
            if (!this.has(dependencyID)) {
                console.error(`${dependencyID} component missing.`);
                throw new Error('ComponentDependencyMissing');
            }
        });


        // Check component is not already attached.
        if (this.has(component.$id)) {
            throw new Error('ComponentAlreadyAttached');
        }

        // Attach component.
        const newC = {...this.c};
        newC[component.$id] = component;
        Object.seal(newC);
        this.c = newC;

        // If the entity has already been added to a world, rebuild it.
        if (this.world) {
            this.world.rebuild(this, component.$id);
        }

        return this;
    }

    // Remove a component from the entity.
    detach(componentId) {
    // Check that the component was not a dependency.
        _.each(this.c, component => {
            const dependencyExists = _.any(component.$deps, dep => dep === componentId);
            if (dependencyExists) {
                console.error(`${component.$id} depends on ${componentId}`);
                throw new Error('ComponentDependencyMissing');
            }
        });

        // Detach the component.
        const newC = {...this.c};
        delete newC[componentId];
        Object.seal(newC);
        this.c = newC;

        if (this.world) {
            this.world.rebuild(this);
        }

        return this;
    }

    has(componentId) {
        return _.has(this.c, componentId);
    }
}
