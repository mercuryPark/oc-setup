import { tool } from "@opencode-ai/plugin"
import { runMigration, autoMigrate } from "../migrate/index.js"

const { schema } = tool

export const setupMigrate: ReturnType<typeof tool> = tool({
  description: "Migrate configuration from existing tools (Claude Code, Cursor, Aider) to OpenCode.",
  args: {
    tool: schema.string().optional().describe("Source tool: 'claude-code', 'cursor', or 'aider'. If omitted, auto-detects."),
    sourcePath: schema.string().optional().describe("Path to source config (default: current directory)"),
  },
  async execute(args, context) {
    const rootPath = args.sourcePath || context.directory
    try {
      if (!args.tool) {
        return autoMigrate(rootPath)
      }
      return runMigration(args.tool as "claude-code" | "cursor" | "aider", rootPath)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return `Migration failed: ${message}`
    }
  },
})
