import App from "./class/App.js";
import logParser from "./util/logParser.js";

const app = new App({
  canvas: document.getElementById("canvas") as HTMLCanvasElement,
  searchInput: document.getElementById("search-input") as HTMLInputElement,
  fileSelect: document.getElementById("file-select") as HTMLInputElement,
  changeLayoutBtn: document.getElementById("change-layout") as HTMLDivElement,
  nodeListEl: document.getElementById("node-list") as HTMLDivElement,
});
app.render();

window.fetch("./examples/simple.json")
  .then(b => b.json())
  .then(json => app.readParsedLog(logParser(json)))
  .catch(_ => console.error(_));

let prevWindowSize: Position = {
  x: innerWidth,
  y: innerHeight
};
function tick() {
  app.eventsManager.tick();
  if (
    prevWindowSize.x !== innerWidth ||
    prevWindowSize.y !== innerHeight
  ) {
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
