import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    open: true,
    // Cloudflare quick tunnels rotate subdomains; allow them in dev.
    allowedHosts: [".trycloudflare.com", "localhost"],
  },
  resolve: {
    alias: {
      "@articles": resolve(__dirname, "../articles"),
    },
  },
});
