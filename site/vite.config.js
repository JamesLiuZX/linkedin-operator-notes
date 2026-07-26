import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  root: ".",
  server: {
    port: 5173,
    open: true,
    allowedHosts: [".trycloudflare.com", "localhost"],
    fs: { allow: [".."] },
  },
  resolve: {
    alias: {
      "@articles": resolve(__dirname, "../articles"),
      "@lib": resolve(__dirname, "../scripts/lib"),
    },
  },
});
