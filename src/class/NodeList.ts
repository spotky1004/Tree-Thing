import type NodeManager from "./NodeManager";
import type Node from "./Node";

interface NodeInfoEls {
  wrapper: HTMLDivElement;
  lineCount: [HTMLSpanElement, HTMLSpanElement];
  dependsOn: HTMLDivElement;
  isUsedBy: HTMLDivElement;
}

export default class NodeList {
  private readonly nodeManager: NodeManager;
  readonly nodeListEl: HTMLDivElement;
  nodeElMap: Map<string, HTMLDivElement>;
  private readonly nodeInfoEls: NodeInfoEls;

  constructor(nodeManager: NodeManager, nodeListEl: HTMLDivElement) {
    this.nodeManager = nodeManager;
    this.nodeListEl = nodeListEl;
    this.nodeElMap = new Map();
    this.nodeInfoEls = {
      wrapper: document.createElement("div"),
      lineCount: [document.createElement("span"), document.createElement("span")],
      dependsOn: document.createElement("div"),
      isUsedBy: document.createElement("div")
    };
    const nodeInfo = this.nodeInfoEls.wrapper;
    nodeInfo.id = "node-info";
    const generalNodeInfo = document.createElement("div");
    generalNodeInfo.id = "node-info__general";
    nodeInfo.appendChild(generalNodeInfo);
    generalNodeInfo.appendChild(this.nodeInfoEls.lineCount[0]);
    generalNodeInfo.appendChild(document.createTextNode("/"));
    generalNodeInfo.appendChild(this.nodeInfoEls.lineCount[1]);
    const dependsOnDivider = document.createElement("div");
    dependsOnDivider.id = "node-info__depends-on-divider";
    dependsOnDivider.innerHTML = "Depends On";
    nodeInfo.appendChild(dependsOnDivider);
    nodeInfo.appendChild(this.nodeInfoEls.dependsOn);
    const isUsedByDivider = document.createElement("div");
    isUsedByDivider.innerHTML = "Is Used By";
    isUsedByDivider.id = "node-info__is-used-by-divider";
    nodeInfo.appendChild(isUsedByDivider);
    nodeInfo.appendChild(this.nodeInfoEls.isUsedBy);
    this.nodeInfoEls.dependsOn.id = "node-info__depends-on";
    this.nodeInfoEls.isUsedBy.id = "node-info__is-used-by";
  }

  init() {
    this.nodeListEl.innerHTML = "";
    this.nodeElMap = new Map();
    const nodes = this.nodeManager.nodes;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const item = document.createElement("div");
      item.classList.add("node-list__item");
      this.nodeListEl.appendChild(item);
      item.style.setProperty("--color", node.attr.color);
      item.setAttribute("name", node.fileName);
      const idx = document.createElement("span");
      idx.classList.add("node-list__item__idx");
      item.appendChild(idx);
      idx.innerText = `#${i+1}`;
      const names = document.createElement("span");
      names.classList.add("node-list__item__names");
      item.appendChild(names);
      const fileName = document.createElement("div");
      fileName.classList.add("node-list__item__file-name");
      names.appendChild(fileName);
      fileName.innerText = node.fileName;
      const assemblyName = document.createElement("div");
      assemblyName.classList.add("node-list__item__assembly-name");
      names.appendChild(assemblyName);
      assemblyName.innerText = node.assemblyName;

      this.nodeElMap.set(node.nodeKey, item);
      item.addEventListener("click", () => {
        this.openNodeInfo(node);
      });
    }
  }

  applyFilter(callback: (node: Node) => boolean) {
    for (const [nodeKey, el] of this.nodeElMap) {
      const node = this.nodeManager.nodes.find(node => node.nodeKey === nodeKey);
      if (!node) continue;
      if (callback(node)) {
        el.style.display = "";
      } else {
        el.style.display = "none";
      }
    }
  }

  applySearch(query: string) {
    this.applyFilter((node) => {
      return query === "" || node.fileName.toLowerCase().includes(query.toLowerCase());
    });
  }

  scrollToNode(node: Node) {
    const nodeItemEl = this.nodeElMap.get(node.nodeKey);
    if (!nodeItemEl || nodeItemEl.style.display === "none") return;

    this.nodeInfoEls.wrapper.style.display = "none";
    nodeItemEl.scrollIntoView();
    window.scrollTo({
      top: 0
    });
    this.nodeInfoEls.wrapper.style.display = "";
  }

  openNodeInfo(node: Node) {
    const nodeItemEl = this.nodeElMap.get(node.nodeKey);
    if (!nodeItemEl || nodeItemEl.style.display === "none") return;

    document.querySelectorAll(".node-list__item.active").forEach(el => {
      el.classList.remove("active");
    });
    nodeItemEl.classList.add("active");

    nodeItemEl.insertAdjacentElement("afterend", this.nodeInfoEls.wrapper);
    this.nodeInfoEls.lineCount[0].innerText = node.dependsOn.length.toString();
    this.nodeInfoEls.lineCount[1].innerText = node.isUsedBy.length.toString();

    this.nodeInfoEls.dependsOn.innerHTML = "";
    for (const _node of node.dependsOn) {
      const el = document.createElement("div");
      el.innerText = _node.fileName;
      this.nodeInfoEls.dependsOn.appendChild(el);
    }
    this.nodeInfoEls.isUsedBy.innerHTML = "";
    for (const _node of node.isUsedBy) {
      const el = document.createElement("div");
      el.innerText = _node.fileName;
      this.nodeInfoEls.isUsedBy.appendChild(el);
    }
  }
}
