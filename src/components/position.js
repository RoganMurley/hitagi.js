export default class Position {
    // Represents an entity's position in 2D space.
    constructor(params) {
        this.$id = 'position';
        this.$deps = [];

        this.x = params.x;
        this.y = params.y;
    }
}
