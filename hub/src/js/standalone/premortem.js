// The premortem template's boot script: read the JSON in the page, draw the document.
import { mountPremortem } from "../artifacts/premortem.js";

const data = JSON.parse(document.getElementById("premortem-data").textContent);
mountPremortem(document.getElementById("root"), data);
if (data.title) document.title = data.title;
