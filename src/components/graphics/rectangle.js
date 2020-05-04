export default class Rectangle {
  constructor(params) {
    this.$id = 'rectangle';
    this.$deps = ['graphic'];

    this.color = params.color;
    this.width = params.width;
    this.height = params.height;
  }
}
