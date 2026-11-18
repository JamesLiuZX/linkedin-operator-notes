// The prototype template's runtime, exposed as Prototype.create(root, spec, options).
import { createPrototype } from "../artifacts/prototype.js";

window.Prototype = { create: createPrototype };
