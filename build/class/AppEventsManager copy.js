// @ts-nocheck
import logParser from "../util/logParser.js";
export default class AppEventsManager {
    constructor(app, canvas) {
        this.app = app;
        this.canvas = canvas;
        this.holding = false;
        this.selectedNodes = [];
        this.prevAbsMousePos = { x: 0, y: 0 };
        this.prevMousePos = { x: 0, y: 0 };
        this.screenMovingSpeed = { x: 0, y: 0 };
        this.holdSpaceStartPos = null;
        this.holdSpaceEndPos = null;
        this.holdingSpace = false;
        this.rmbHoldPos = null;
        this.init();
    }
    pixelPosToGlobalPos(width, height, x, y) {
        const { x: cameraX, y: cameraY, zoom } = this.app.canvas.camera;
        const offset = {
            x: 0,
            y: 0
        };
        if (width > height) {
            offset.x -= (width - height) / 2;
        }
        else {
            offset.y -= (width - height) / 2;
        }
        const pos = {
            x: (x + offset.x) / Math.min(width, height) / zoom + cameraX,
            y: (y + offset.y) / Math.min(width, height) / zoom + cameraY
        };
        return pos;
    }
    init() {
        document.addEventListener("blur", () => {
            this.resetEventDatas();
            this.app.render();
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.resetEventDatas();
            this.app.render();
        });
        this.canvas.addEventListener("mousedown", (e) => {
            let isRightClick = false;
            if ("witch" in e) {
                isRightClick = e.which === 3;
            }
            else if ("button" in e) {
                isRightClick = e.button === 2;
            }
            const globalPos = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, e.offsetX, e.offsetY);
            if (!isRightClick) {
                this.holding = true;
                const selectedNode = this.app.nodeManager.getNodeByPosition(globalPos.x, globalPos.y);
                if (selectedNode) {
                    this.selectedNodes.push(selectedNode);
                    const nodeList = this.app.nodeManager.nodeList;
                    nodeList.scrollToNode(this.selectedNodes[0]);
                    nodeList.openNodeInfo(this.selectedNodes[0]);
                }
            }
            else {
                this.rmbHoldPos = { x: globalPos.x, y: globalPos.y };
                this.rmbHoldMove(globalPos);
            }
            this.app.render();
        });
        this.canvas.addEventListener("mouseup", (e) => {
            let isRightClick = false;
            if ("witch" in e) {
                isRightClick = e.which === 3;
            }
            else if ("button" in e) {
                isRightClick = e.button === 2;
            }
            if (!isRightClick) {
                this.holding = false;
                this.selectedNodes = [];
                this.holdSpaceStartPos = null;
                this.holdSpaceEndPos = null;
            }
            else {
                this.rmbHoldPos = null;
            }
            this.app.render();
        });
        this.canvas.addEventListener("mousemove", (e) => {
            let isRightClick = false;
            if ("witch" in e) {
                isRightClick = e.which === 3;
            }
            else if ("button" in e) {
                isRightClick = e.buttons === 2 || e.buttons === 3;
            }
            this.prevAbsMousePos = { x: e.offsetX, y: e.offsetY };
            const to = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, e.offsetX, e.offsetY);
            if (!isRightClick) {
                this.mousemove(to);
            }
            else {
                this.rmbHoldMove(to);
            }
        });
        this.canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const to = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, e.offsetX, e.offsetY);
            this.rmbHoldMove(to);
        });
        this.canvas.addEventListener("wheel", (e) => {
            this.wheel(e.deltaY);
        });
        this.app.fileSelect.addEventListener("change", () => {
            const fileList = this.app.fileSelect.files;
            if (!fileList)
                return;
            const file = fileList[0];
            if (!file)
                return;
            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                try {
                    if (typeof fileReader.result === "string") {
                        const parsedLog = logParser(JSON.parse(fileReader.result));
                        this.app.readParsedLog(parsedLog);
                    }
                }
                catch (e) {
                    throw e;
                }
            });
            fileReader.readAsText(file);
        });
        this.app.changeLayoutBtn.addEventListener("click", () => {
            this.app.nodeManager.changeLayout();
        });
        window.addEventListener("keydown", (e) => {
            if (e.key === " " && !this.holdingSpace) {
                this.holdSpaceStartPos = { ...this.prevMousePos };
                this.holdSpaceEndPos = { ...this.prevMousePos };
                this.holdingSpace = true;
            }
            this.app.render();
        });
        window.addEventListener("keyup", (e) => {
            if (e.key === " " && this.holdingSpace) {
                this.holdSpaceStartPos = null;
                this.holdSpaceEndPos = null;
                this.holdingSpace = false;
            }
            this.app.render();
        });
        this.app.searchBox.addEventListener("keydown", () => {
            this.app.nodeManager.nodeList.applySearch(this.app.searchBox.value);
            this.app.render();
        });
        this.app.searchBox.addEventListener("change", () => {
            this.app.nodeManager.nodeList.applySearch(this.app.searchBox.value);
            this.app.render();
        });
    }
    tick() {
        const camera = this.app.canvas.camera;
        if (Math.abs(this.screenMovingSpeed.x) > 0.001 / camera.zoom ||
            Math.abs(this.screenMovingSpeed.y) > 0.001 / camera.zoom) {
            camera.x += this.screenMovingSpeed.x;
            camera.y += this.screenMovingSpeed.y;
            this.screenMovingSpeed.x *= 0.95;
            this.screenMovingSpeed.y *= 0.95;
            this.app.render();
        }
        else {
            this.screenMovingSpeed.x = 0;
            this.screenMovingSpeed.y = 0;
        }
    }
    getSelectRect() {
        if (this.holdSpaceStartPos && this.holdSpaceEndPos) {
            return {
                x1: Math.min(this.holdSpaceStartPos.x, this.holdSpaceEndPos.x),
                y1: Math.min(this.holdSpaceStartPos.y, this.holdSpaceEndPos.y),
                x2: Math.max(this.holdSpaceStartPos.x, this.holdSpaceEndPos.x),
                y2: Math.max(this.holdSpaceStartPos.y, this.holdSpaceEndPos.y),
            };
        }
        else {
            return null;
        }
    }
    mousemove(to) {
        const from = this.prevMousePos;
        const dl = {
            x: to.x - from.x,
            y: to.y - from.y
        };
        this.prevMousePos = { ...to };
        if (this.holdingSpace) {
            this.holdSpaceEndPos = { ...this.prevMousePos };
        }
        const selectedRect = this.getSelectRect();
        if (this.holdingSpace && selectedRect) {
            const { x1, y1, x2, y2 } = selectedRect;
            const selectedNodes = this.app.nodeManager.nodes.filter(node => node.isNodeInRect(x1, y1, x2, y2));
            this.selectedNodes = selectedNodes;
        }
        if (this.selectedNodes.length > 0) {
            if (!this.holdingSpace) {
                for (const node of this.selectedNodes) {
                    node.attr.x += dl.x;
                    node.attr.y += dl.y;
                }
            }
            this.app.render();
        }
        else if (this.holding) {
            this.screenMovingSpeed.x -= dl.x / 10;
            this.screenMovingSpeed.y -= dl.y / 10;
        }
    }
    rmbHoldMove(to) {
        if (!this.rmbHoldPos)
            return;
        const dx = to.x - this.rmbHoldPos.x;
        const dy = to.y - this.rmbHoldPos.y;
        const dl = Math.sqrt(dx * dx + dy * dy);
        for (const node of this.selectedNodes) {
            node.attr.size += dl * -Math.sign(dy);
            node.attr.size = Math.max(node.attr.size, (1 / this.app.canvas.camera.zoom) / 100);
        }
        this.rmbHoldPos = to;
        this.app.render();
    }
    wheel(dy) {
        const absMousePos = this.prevAbsMousePos;
        const camera = this.app.canvas.camera;
        const prevPos = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, absMousePos.x, absMousePos.y);
        camera.zoom *= 1.01 ** (-dy / 8);
        const curPos = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, absMousePos.x, absMousePos.y);
        const xOffset = curPos.x - prevPos.x;
        const yOffset = curPos.y - prevPos.y;
        camera.x -= xOffset;
        camera.y -= yOffset;
        this.app.render();
    }
    keydown(key) {
        if (this.selectedNodes.length > 0) {
            for (const node of this.selectedNodes) {
                let scale = 1;
                if (key === "-" || key === "_") {
                    scale /= 1.05;
                }
                else if (key === "=" || key === "+") {
                    scale *= 1.05;
                }
                if (scale !== 1) {
                    node.attr.size *= scale;
                }
            }
            this.app.render();
        }
    }
    resetEventDatas() {
        this.holding = false;
        this.selectedNodes = [];
        this.holdSpaceStartPos = null;
        this.holdSpaceEndPos = null;
        this.holdingSpace = false;
        this.prevMousePos = { x: 0, y: 0 };
        this.rmbHoldPos = null;
    }
}
