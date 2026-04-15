import { defineConfig } from "tsup"
import { cpSync, chmodSync } from "fs"

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  target: "node20",
  external: ["@opencode-ai/plugin", "zod", "commander", "@inquirer/prompts"],
  clean: true,
  dts: true,
  banner: (ctx) => ({
    js: ctx.format === "esm" ? "#!/usr/bin/env node" : ""
  }),
  onSuccess: async () => {
    cpSync("templates", "dist/templates", { recursive: true })
    chmodSync("dist/cli.js", 0o755)
  },
})
