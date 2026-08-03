import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true,
    // The desk imports the shared analyzer from outside its own root.
    fs: { allow: ["../.."] },
  },
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "../../scripts/lib"),
    },
  },
});
