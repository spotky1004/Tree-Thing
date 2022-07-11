export default function keyToNodeDatas(key) {
    const datas = key.split(", ");
    return {
        fileName: datas[0],
        assemblyName: datas[1]
    };
}
