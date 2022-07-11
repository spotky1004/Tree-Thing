import NodeManager from "./NodeManager.js";
import AppCanvas from "./AppCanvas.js";
import AppEventsManager from "./AppEventsManager.js";
export default class App {
    constructor(options) {
        this.searchBox = options.searchInput;
        this.fileSelect = options.fileSelect;
        this.changeLayoutBtn = options.changeLayoutBtn;
        this.nodeListEl = options.nodeListEl;
        this.nodeManager = new NodeManager(this, options.nodeListEl);
        this.eventsManager = new AppEventsManager(this, options.canvas);
        this.canvas = new AppCanvas(this, options.canvas);
    }
    readParsedLog(parsedLog) {
        this.nodeManager.init(parsedLog);
        this.render();
    }
    render() {
        const highlightNodes = [];
        const searchQuery = this.searchBox.value;
        if (searchQuery.length > 0) {
            highlightNodes.push(...this.nodeManager.nodes.filter(node => node.fileName.toLowerCase().includes(searchQuery.toLowerCase())));
        }
        if (this.eventsManager.selectedNodes) {
            highlightNodes.push(...this.eventsManager.selectedNodes);
        }
        this.canvas.render(highlightNodes);
    }
}
