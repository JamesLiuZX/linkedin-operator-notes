// The synthesis template's boot script: read the JSON in the page, draw the document.
import { mountSynthesis } from "../artifacts/synthesis.js";

const data = JSON.parse(document.getElementById("synthesis-data").textContent);
mountSynthesis(document.getElementById("root"), data);
if (data.title) document.title = data.title;
