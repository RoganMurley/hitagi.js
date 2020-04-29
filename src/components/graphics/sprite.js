export default class Sprite {
    constructor(params) {
        this.$id = 'sprite';
        this.$deps = ['graphic'];

        params = {animationSpeed: 1, currentFrame: 1, loop: true, rotation: 0, ...params};

        this.animationSpeed = params.animationSpeed;
        this.currentFrame = params.currentFrame;
        this.loop = params.loop;
        this.path = params.path;
        this.rotation = params.rotation;
    }
}
