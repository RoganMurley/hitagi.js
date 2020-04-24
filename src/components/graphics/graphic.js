export default class Graphic {
  constructor(params) {
    this.$id = 'graphic';
    this.$deps = []; // Position dependency added later if relative positioning is true.

    params = {
      alpha: 1,
      anchor: {
          x: 0.5,
          y: 0.5,
      },
      relative: true,
      scale: {
          x: 1,
          y: 1,
      },
      tint: 0xffffff,
      translate: {
          x: 0,
          y: 0,
      },
      visible: true,
      z: 0,
      ...params,
    }

    if (params.relative) {
      this.$deps.push('position');
    }

    this.alpha = params.alpha;
    this.anchor = params.anchor;
    this.relative = params.relative;
    this.scale = params.scale;
    this.tint = params.tint;
    this.translate = params.translate;
    this.visible = params.visible;
    this.z = params.z;
  }
}
