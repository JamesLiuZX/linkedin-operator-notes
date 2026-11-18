// The readout template's boot script: read the JSON in the page, draw the document.
import { mountReadout } from "../artifacts/readout.js";

const data = JSON.parse(document.getElementById("readout-data").textContent);
mountReadout(document.getElementById("root"), data);
if (data.title) document.title = data.title;
