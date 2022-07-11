import NodeManager from "./NodeManager.js";
import AppCanvas from "./AppCanvas.js";
import AppEventsManager from "./AppEventsManager.js";
import type Node from "./Node";
import type { ParsedLog } from "../util/logParser";

interface AppOptions {
  canvas: HTMLCanvasElement;
  searchInput: HTMLInputElement;
  fileSelect: HTMLInputElement;
  changeLayoutBtn: HTMLDivElement;
  nodeListEl: HTMLDivElement;
}

export default class App {
  readonly canvas: AppCanvas;
  readonly eventsManager: AppEventsManager;
  readonly nodeManager: NodeManager;
  readonly searchBox: HTMLInputElement;
  readonly fileSelect: HTMLInputElement;
  readonly changeLayoutBtn: HTMLDivElement;
  readonly nodeListEl: HTMLDivElement;

  constructor(options: AppOptions) {
    this.searchBox = options.searchInput;
    this.fileSelect = options.fileSelect;
    this.changeLayoutBtn = options.changeLayoutBtn;
    this.nodeListEl = options.nodeListEl;
    this.nodeManager = new NodeManager(this, options.nodeListEl);
    this.eventsManager = new AppEventsManager(this, options.canvas);
    this.canvas = new AppCanvas(this, options.canvas);
  }

  readParsedLog(parsedLog: ParsedLog) {
    this.nodeManager.init(parsedLog);
    this.render();
  }

  render() {
    const highlightNodes: Node[] = [];
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
