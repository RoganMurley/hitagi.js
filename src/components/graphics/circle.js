export default class Circle {
    constructor(params) {
        this.$id = 'circle';
        this.$deps = ['graphic'];

        this.color = params.color;
        this.radius = params.radius;
    }
}
