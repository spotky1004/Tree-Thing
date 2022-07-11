import App from "./class/App.js";
import logParser from "./util/logParser.js";
const app = new App({
    canvas: document.getElementById("canvas"),
    searchInput: document.getElementById("search-input"),
    fileSelect: document.getElementById("file-select"),
    changeLayoutBtn: document.getElementById("change-layout"),
    nodeListEl: document.getElementById("node-list"),
});
app.render();
window.fetch("./examples/simple.json")
    .then(b => b.json())
    .then(json => app.readParsedLog(logParser(json)))
    .catch(_ => console.error(_));
let prevWindowSize = {
    x: innerWidth,
    y: innerHeight
};
function tick() {
    app.eventsManager.tick();
    if (prevWindowSize.x !== innerWidth ||
        prevWindowSize.y !== innerHeight) {
        prevWindowSize = {
            x: innerWidth,
            y: innerHeight
        };
        app.render();
    }
    requestAnimationFrame(tick);
}
tick();
console.log(app);
// @ts-ignore
window.app = app;
