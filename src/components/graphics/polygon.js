export default class Polygon {
  constructor(params) {
    this.$id = 'polygon';
    this.$deps = ['graphic'];

    this.color = params.color;
    this.points = params.points;
  }
}
