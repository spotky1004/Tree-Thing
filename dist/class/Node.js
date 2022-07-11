export default class Node {
    constructor(data, color) {
        this.nodeKey = data.nodeKey;
        this.fileName = data.fileName;
        this.assemblyName = data.assemblyName;
        this.isUsedBy = [];
        this.dependsOn = [];
        this.attr = { x: 0, y: 0, size: 60, color };
    }
    addLine(type, node) {
        this[type].push(node);
    }
    isSpotInNode(x, y) {
        return Math.sqrt((this.attr.x - x) ** 2 + (this.attr.y - y) ** 2) < this.attr.size;
    }
    isNodeInRect(x1, y1, x2, y2) {
        const { x, y } = this.attr;
        const xIn = x1 < x && x < x2;
        const yIn = y1 < y && y < y2;
        return xIn && yIn;
    }
}
