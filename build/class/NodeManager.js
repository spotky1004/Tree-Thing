import Node from "./Node.js";
import NodeList from "./NodeList.js";
const layoutOrder = [
    "circle", "grid"
];
const isNodeLayout = (layout) => layoutOrder.includes(layout);
export default class NodeManager {
    constructor(app, nodeListEl) {
        this.app = app;
        this.nodes = [];
        this.layout = "circle";
        this.nodeList = new NodeList(this, nodeListEl);
        this.assemblyColors = new Map();
        this.stats = {
            totalDependsOn: 0,
            totalIsUsedBy: 0,
            typeCount: 0,
            assemblyCount: 0,
            dependencyComplexity: 0,
            isUsedByComplexity: 0
        };
    }
    init(parsedLog) {
        this.nodes = [];
        this.layout = "circle";
        this.assemblyColors = new Map();
        this.assemblyColors.set("Assembly-CSharp", "#fff");
        const nodePairs = {};
        // Init nodes
        for (const key in parsedLog) {
            const nodeData = parsedLog[key];
            const assemblyName = nodeData.assemblyName;
            if (!this.assemblyColors.has(assemblyName)) {
                const colIdx = this.assemblyColors.size;
                this.assemblyColors.set(assemblyName, `hsl(${colIdx * 30} , 100%, 85%)`);
            }
            const color = this.assemblyColors.get(assemblyName);
            const node = new Node(nodeData, color ?? "#f00");
            this.nodes.push(node);
            nodePairs[nodeData.nodeKey] = node;
        }
        // Add isUsedBy & dependsOn
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const { isUsedBy, dependsOn } = parsedLog[node.nodeKey];
            for (let i = 0; i < isUsedBy.length; i++) {
                const data = isUsedBy[i];
                node.addLine("isUsedBy", nodePairs[data.nodeKey]);
            }
            for (let i = 0; i < dependsOn.length; i++) {
                const data = dependsOn[i];
                node.addLine("dependsOn", nodePairs[data.nodeKey]);
            }
        }
        this.changeLayout("circle");
        const maxEdgeCount = this.nodes.length * (this.nodes.length - 1) / 2;
        const totalDependsOn = this.nodes.reduce((a, node) => a + node.dependsOn.length, 0);
        const totalIsUsedBy = this.nodes.reduce((a, node) => a + node.isUsedBy.length, 0);
        this.stats = {
            totalDependsOn,
            totalIsUsedBy,
            typeCount: this.nodes.length,
            assemblyCount: this.assemblyColors.size,
            dependencyComplexity: totalDependsOn / maxEdgeCount,
            isUsedByComplexity: totalIsUsedBy / maxEdgeCount
        };
        this.nodeList.init();
    }
    getNodeByPosition(x, y) {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            if (node.isSpotInNode(x, y)) {
                return node;
            }
        }
        return undefined;
    }
    changeLayout(type = undefined) {
        if (typeof type === "undefined") {
            const curIdx = layoutOrder.findIndex(o => o === this.layout);
            if (curIdx === -1)
                return;
            const newLayout = layoutOrder[(curIdx + 1) % layoutOrder.length];
            if (!isNodeLayout(newLayout))
                return;
            type = newLayout;
        }
        let size = 1;
        if (type === "circle") {
            size = Math.max(500, this.nodes.length * 50);
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                node.attr.x = Math.sin(Math.PI * 2 * i / this.nodes.length) * size / 2 + size / 2;
                node.attr.y = Math.cos(Math.PI * 2 * i / this.nodes.length) * size / 2 + size / 2;
            }
        }
        else if (type === "grid") {
            size = Math.max(500, this.nodes.length * 10);
            const gridSize = Math.ceil(Math.sqrt(this.nodes.length));
            for (let i = 0; i < this.nodes.length; i++) {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                const node = this.nodes[i];
                node.attr.x = x * size / gridSize;
                node.attr.y = y * size / gridSize;
            }
        }
        this.layout = type;
        if (!this.app.canvas)
            return;
        const camera = this.app.canvas.camera;
        camera.x = 0;
        camera.y = 0;
        camera.zoom = 1 / size;
        this.app.canvas.render();
    }
}
