export default class Velocity {
  // Represents an entity's velocity in 2D space.
  constructor(params) {
    this.$id = 'velocity';
    this.$deps = ['position'];

    this.xspeed = params.xspeed;
    this.yspeed = params.yspeed;
  }
}
