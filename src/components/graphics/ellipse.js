export default class Ellipse {
    constructor(params) {
        this.$id = 'ellipse';
        this.$deps = ['graphic'];

        this.color = params.color;
        this.width = params.width;
        this.height = params.height;
    }
}
