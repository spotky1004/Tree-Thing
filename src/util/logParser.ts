import keyToNodeDatas, { NodeDatas } from "./keyToNodeDatas.js";

interface RawNode {
  isUsedBy: string[];
  dependsOn: string[];
}
type LogJson = { [fileName: string]: RawNode };

export interface ParsedNode {
  nodeKey: string;
  fileName: string;
  assemblyName: string;
  isUsedBy: ParsedNode[];
  dependsOn: ParsedNode[];
}
export type ParsedLog = { [typeName: string]: ParsedNode };

function nodeDatasToNodeKey(nodeDatas: NodeDatas) {
  return nodeDatas.fileName + "_" + nodeDatas.assemblyName;
}

export default function logParser(logJson: LogJson): ParsedLog {
  const parsed: ParsedLog = {};

  // Init nodes
  for (const key in logJson) {
    const nodeDatas = keyToNodeDatas(key);
    const nodeKey = nodeDatasToNodeKey(nodeDatas);
    parsed[nodeKey] = {
      nodeKey: nodeKey,
      fileName: nodeDatas.fileName,
      assemblyName: nodeDatas.assemblyName,
      isUsedBy: [],
      dependsOn: []
    };
  }

  // Add isUsedBy & dependsOn
  for (const key in logJson) {
    const nodeDatas = keyToNodeDatas(key);
    const nodeKey = nodeDatasToNodeKey(nodeDatas);
    const node = parsed[nodeKey];
    const { isUsedBy, dependsOn } = logJson[key];

    for (let i = 0; i < isUsedBy.length; i++) {
      const _nodeDatas = keyToNodeDatas(isUsedBy[i]);
      const _nodeKey = nodeDatasToNodeKey(_nodeDatas);
      node.isUsedBy.push(parsed[_nodeKey]);
    }
    for (let i = 0; i < dependsOn.length; i++) {
      const _nodeDatas = keyToNodeDatas(dependsOn[i]);
      const _nodeKey = nodeDatasToNodeKey(_nodeDatas);
      node.dependsOn.push(parsed[_nodeKey]);
    }

    Object.freeze(node);
    Object.freeze(isUsedBy);
    Object.freeze(dependsOn);
  }

  Object.freeze(parsed);
  return parsed;
}
