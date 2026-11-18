// The PRD template's boot script: read the JSON in the page, draw the document.
import { mountPrd } from "../artifacts/prd.js";

const data = JSON.parse(document.getElementById("prd-data").textContent);
mountPrd(document.getElementById("root"), data);
if (data.doc && data.doc.title) document.title = data.doc.title;
