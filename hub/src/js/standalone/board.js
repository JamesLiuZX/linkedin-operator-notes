// The teardown board template's boot script: read the JSON in the page, draw the board.
import { mountBoard } from "../artifacts/board.js";

const data = JSON.parse(document.getElementById("teardown-data").textContent);
const board = mountBoard(document.getElementById("root"), data);
board.setInteractive(true);
if (data.title) document.title = data.title;
addEventListener("resize", () => board.set(board.cameraFor("start")));
