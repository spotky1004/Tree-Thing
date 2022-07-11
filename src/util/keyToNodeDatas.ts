export interface NodeDatas {
  fileName: string;
  assemblyName: string;
}

export default function keyToNodeDatas(key: string): NodeDatas {
  const datas = key.split(", ");
  return {
    fileName: datas[0],
    assemblyName: datas[1]
  };
}
