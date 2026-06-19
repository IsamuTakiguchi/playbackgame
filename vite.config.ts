import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages / static host friendly relative paths
  base: "./",
  server: {
    host: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
