import logParser from "../util/logParser.js";
import parseMouseButtons from "../util/parseMouseButtons.js";
export default class AppEventsManager {
    constructor(app, canvas) {
        this.app = app;
        this.canvas = canvas;
        this.selectedNodes = [];
        this.flags = {
            lmb: false,
            wheel: false,
            spaceKey: false
        };
        this.positions = {
            absMouse: { x: 0, y: 0 },
            mouse: { x: 0, y: 0 },
            holdMouseStart: null,
            holdMouseEnd: null,
            rmbHold: null
        };
        this.screenMovingSpeed = { x: 0, y: 0 };
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
        document.addEventListener("mouseleave", () => {
            this.resetEventDatas();
            this.app.render();
        });
        this.canvas.addEventListener("mousedown", (e) => {
            const buttons = parseMouseButtons(e, "buttons");
            if (!buttons)
                return;
            const globalPos = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, e.offsetX, e.offsetY);
            if (buttons.leftClick) {
                this.flags.lmb = true;
                this.positions.holdMouseStart = { ...globalPos };
                this.positions.holdMouseEnd = { ...globalPos };
                const selectedNode = this.app.nodeManager.getNodeByPosition(globalPos.x, globalPos.y);
                if (selectedNode) {
                    this.selectedNodes.splice(0, this.selectedNodes.length);
                    this.selectedNodes.push(selectedNode);
                    this.app.nodeManager.nodeList.openNodeInfo(selectedNode);
                    this.app.nodeManager.nodeList.scrollToNode(selectedNode);
                }
            }
            if (buttons.rightClick) {
                this.positions.rmbHold = { ...globalPos };
                this.rmbHold(globalPos);
            }
            if (buttons.wheelClick) {
                this.flags.wheel = true;
            }
            this.app.render();
        });
        this.canvas.addEventListener("mouseup", (e) => {
            const buttons = parseMouseButtons(e, "button");
            if (!buttons)
                return;
            const mousePos = this.positions.mouse;
            if (buttons.leftClick) {
                this.flags.lmb = false;
                const { holdMouseStart, holdMouseEnd } = this.positions;
                const isNotDragged = holdMouseStart && holdMouseEnd &&
                    (holdMouseStart.x === holdMouseEnd.x ||
                        holdMouseStart.y === holdMouseEnd.y);
                if (isNotDragged) {
                    const selectedNodes = this.selectedNodes;
                    const mousePosNode = this.app.nodeManager.getNodeByPosition(mousePos.x, mousePos.y);
                    if (!mousePosNode ||
                        (mousePosNode && !selectedNodes.includes(mousePosNode))) {
                        this.positions.holdMouseStart = null;
                        this.positions.holdMouseEnd = null;
                        selectedNodes.splice(0, this.selectedNodes.length);
                        this.app.nodeManager.nodeList.applyFilter(_ => true);
                    }
                }
            }
            if (buttons.rightClick) {
                this.positions.rmbHold = null;
            }
            if (buttons.wheelClick) {
                this.flags.wheel = false;
            }
            this.app.render();
        });
        this.canvas.addEventListener("mousemove", (e) => {
            const buttons = parseMouseButtons(e, "buttons");
            if (!buttons)
                return;
            const from = { ...this.positions.mouse };
            const to = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, e.offsetX, e.offsetY);
            this.positions.mouse = { ...to };
            this.positions.absMouse = { x: e.offsetX, y: e.offsetY };
            if (buttons.leftClick || buttons.wheelClick) {
                this.mousemove(from);
            }
            if (buttons.rightClick) {
                this.rmbHold(to);
            }
            this.app.render();
        });
        this.canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.wheel(e.deltaY);
            this.app.render();
        }, {
            passive: false
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
            if (e.key === " " && !this.flags.spaceKey) {
                this.flags.spaceKey = true;
            }
            this.app.render();
        });
        window.addEventListener("keyup", (e) => {
            if (e.key === " " && this.flags.spaceKey) {
                this.flags.spaceKey = false;
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
        const startPos = this.positions.holdMouseStart;
        const endPos = this.positions.holdMouseEnd;
        if (startPos && endPos) {
            return {
                x1: Math.min(startPos.x, endPos.x),
                y1: Math.min(startPos.y, endPos.y),
                x2: Math.max(startPos.x, endPos.x),
                y2: Math.max(startPos.y, endPos.y)
            };
        }
        else {
            return null;
        }
    }
    mousemove(from) {
        const to = this.positions.mouse;
        const dl = {
            x: to.x - from.x,
            y: to.y - from.y
        };
        const spaceKey = this.flags.spaceKey;
        if (this.flags.lmb) {
            this.positions.holdMouseEnd = { ...to };
        }
        if (!spaceKey) {
            const selectedRect = this.getSelectRect();
            if (this.flags.lmb && selectedRect) {
                const { x1, y1, x2, y2 } = selectedRect;
                const selectedNodes = this.app.nodeManager.nodes.filter(node => node.isNodeInRect(x1, y1, x2, y2));
                this.selectedNodes.splice(0, this.selectedNodes.length);
                this.selectedNodes.push(...selectedNodes);
                if (this.selectedNodes.length >= 2) {
                    this.app.nodeManager.nodeList.applyFilter((node) => this.selectedNodes.includes(node));
                }
                else {
                    this.app.nodeManager.nodeList.applyFilter(_ => true);
                }
            }
        }
        else {
            if (this.selectedNodes.length > 0) {
                for (const node of this.selectedNodes) {
                    node.attr.x += dl.x;
                    node.attr.y += dl.y;
                }
            }
        }
        if (this.flags.wheel) {
            this.screenMovingSpeed.x -= dl.x / 10;
            this.screenMovingSpeed.y -= dl.y / 10;
        }
    }
    lmbClick() {
        const mousePos = this.positions.mouse;
        const selectedNode = this.app.nodeManager.getNodeByPosition(mousePos.x, mousePos.y);
        if (selectedNode) {
            this.selectedNodes.push(selectedNode);
            const nodeList = this.app.nodeManager.nodeList;
            nodeList.scrollToNode(this.selectedNodes[0]);
            nodeList.openNodeInfo(this.selectedNodes[0]);
        }
    }
    rmbHold(to) {
        const rmbHoldPos = this.positions.rmbHold;
        if (!rmbHoldPos)
            return;
        const dx = to.x - rmbHoldPos.x;
        const dy = to.y - rmbHoldPos.y;
        const dl = Math.sqrt(dx * dx + dy * dy);
        for (const node of this.selectedNodes) {
            node.attr.size += dl * -Math.sign(dy);
            node.attr.size = Math.max(node.attr.size, (1 / this.app.canvas.camera.zoom) / 100);
        }
        this.positions.rmbHold = to;
    }
    wheel(dy) {
        const absMousePos = this.positions.absMouse;
        const camera = this.app.canvas.camera;
        const prevPos = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, absMousePos.x, absMousePos.y);
        camera.zoom *= 1.01 ** (-dy / 8);
        const curPos = this.pixelPosToGlobalPos(this.canvas.width, this.canvas.height, absMousePos.x, absMousePos.y);
        const xOffset = curPos.x - prevPos.x;
        const yOffset = curPos.y - prevPos.y;
        camera.x -= xOffset;
        camera.y -= yOffset;
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
        }
    }
    resetEventDatas() {
        // reset flags
        this.flags.lmb = false;
        this.flags.wheel = false;
        this.flags.spaceKey = false;
        // reset positions
        if (this.flags.lmb) {
            this.positions.holdMouseStart = null;
            this.positions.holdMouseEnd = null;
        }
        this.positions.rmbHold = null;
    }
}
