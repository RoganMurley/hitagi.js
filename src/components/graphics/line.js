export default class Line {
    constructor(params) {
        this.$id = 'line';
        this.$deps = ['graphic'];

        params = {thickness: 1, ...params};

        this.thickness = params.thickness;
        this.x1 = params.x1;
        this.y1 = params.y1;
        this.x2 = params.x2;
        this.y2 = params.y2;
    }
}
