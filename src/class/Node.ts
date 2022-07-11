import type { ParsedNode } from "../util/logParser";

export type LineTypes = "isUsedBy" | "dependsOn";

export default class Node {
  readonly nodeKey: string;
  readonly fileName: string;
  readonly assemblyName: string;
  readonly isUsedBy: Node[];
  readonly dependsOn: Node[];
  readonly attr: { x: number; y: number, size: number, color: string };

  constructor(data: ParsedNode, color: string) {
    this.nodeKey = data.nodeKey;
    this.fileName = data.fileName;
    this.assemblyName = data.assemblyName;
    this.isUsedBy = [];
    this.dependsOn = [];
    this.attr = { x: 0, y: 0, size: 60, color };
  }

  addLine(type: LineTypes, node: Node) {
    this[type].push(node);
  }

  isSpotInNode(x: number, y: number): boolean {
    return Math.sqrt((this.attr.x-x)**2 + (this.attr.y-y)**2) < this.attr.size;
  }

  isNodeInRect(x1: number, y1: number, x2: number, y2: number) {
    const { x, y } = this.attr;

    const xIn = x1 < x && x < x2;
    const yIn = y1 < y && y < y2;
    
    return xIn && yIn;
  }
}
