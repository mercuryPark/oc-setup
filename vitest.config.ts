import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html", "json", "lcov"],
      exclude: ["node_modules/", "dist/"],
    },
  },
})
