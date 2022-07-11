export default function localAttrToGlobalAttr(localPos, cameraAttr) {
    const { x: localX, y: localY, size } = localPos;
    const { x: cameraX, y: cameraY, zoom, width, height } = cameraAttr;
    const globalAttr = {
        x: (localX - cameraX) * zoom * Math.min(width, height),
        y: (localY - cameraY) * zoom * Math.min(width, height),
        size: size * zoom * Math.min(width, height)
    };
    if (width > height) {
        globalAttr.x += (width - height) / 2;
    }
    else {
        globalAttr.y += (height - width) / 2;
    }
    return globalAttr;
}
