export default class Collision {
  // Represents the collision boundaries of an entity.
  constructor(params) {
    this.$id = 'collision';
    this.$deps = ['position'];

    params = { anchor: { x: 0.5, y: 0.5 }, ...params };

    this.width = params.width;
    this.height = params.height;
    this.anchor = params.anchor;
  }
}
