export interface BaseAttrs {
  x: number;
  y: number;
  color?: string;
}
export interface ObjectAttrs extends BaseAttrs {
}
export interface ObjectAttrsWithSize extends BaseAttrs {
  size: number;
}
export interface GlobalAttrs extends BaseAttrs {
  width: number;
  height: number;
  zoom: number;
}

export default function localAttrToGlobalAttr<T extends ObjectAttrs | ObjectAttrsWithSize>(localPos: T, cameraAttr: GlobalAttrs): T {
  const { x: localX, y: localY, size } = localPos as ObjectAttrsWithSize;
  const { x: cameraX, y: cameraY, zoom, width, height } = cameraAttr;

  const globalAttr: ObjectAttrsWithSize = {
    x: (localX-cameraX)*zoom*Math.min(width, height),
    y: (localY-cameraY)*zoom*Math.min(width, height),
    size: size*zoom*Math.min(width, height)
  };
  if (width > height) {
    globalAttr.x += (width-height)/2;
  } else {
    globalAttr.y += (height-width)/2;
  }
  return globalAttr as any;
}
