export default class StaticSprite {
  constructor(params) {
    this.$id = 'staticSprite';
    this.$deps = ['graphic'];

    params = {rotation: 0, ...params};

    this.path = params.path;
    this.rotation = params.rotation;
  }
}
