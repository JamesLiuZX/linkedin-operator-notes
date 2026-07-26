import React from "react";
import { createRoot } from "react-dom/client";
import ContentDesk from "./ContentDesk.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContentDesk />
  </React.StrictMode>
);
