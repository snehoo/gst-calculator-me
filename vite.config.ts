import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Clean config — no prerender plugin needed.
// Pre-rendering is handled by scripts/prerender-routes.mjs which runs
// after vite build via: "vite build && node scripts/prerender-routes.mjs"
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
});
