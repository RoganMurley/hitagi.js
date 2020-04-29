export default class Text {
    constructor(params) {
        this.$id = 'text';
        this.$deps = ['graphic'];

        params = {bitmapFont: false, rotation: 0, style: {}, ...params};
        params.style = {font: '32px monospace', fill: 0xffffff, ...params.style};

        this.bitmapFont = params.bitmapFont;
        this.copy = params.copy;
        this.rotation = params.rotation;
        this.style = params.style;
    }
}
