import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      "@articles": resolve(__dirname, "../articles"),
    },
  },
});
