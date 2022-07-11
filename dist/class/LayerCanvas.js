export default class LayerCanvas {
    constructor(layerNames, canvas) {
        this.canvas = canvas;
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Your borwser doesn't supports canvas!");
        }
        this.ctx = ctx;
        this.layers = [];
        this.layerNames = layerNames;
        for (let i = 0; i < layerNames.length; i++) {
            this.createLayer();
        }
    }
    createLayer() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const layer = {
            canvas,
            ctx
        };
        Object.freeze(layer);
        this.layers.push(layer);
    }
    initCtx(width, height) {
        for (let i = 0; i < this.layers.length; i++) {
            const { canvas } = this.layers[i];
            canvas.width = width;
            canvas.height = height;
        }
    }
    getAllLayers() {
        return [...this.layers];
    }
    getLayer(name) {
        return this.layers[this.layerNames.findIndex(n => n === name)];
    }
    mergeLayers(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const { canvas } = this.layers[i];
            this.ctx.drawImage(canvas, 0, 0);
        }
    }
}
