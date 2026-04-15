import { tool } from "@opencode-ai/plugin"
import { resolve, relative, isAbsolute } from "path"
import { runMigration, autoMigrate } from "../migrate/index.js"

const { schema } = tool

export const setupMigrate: ReturnType<typeof tool> = tool({
  description: "Migrate configuration from existing tools (Claude Code, Cursor, Aider) to OpenCode.",
  args: {
    tool: schema.string().optional().describe("Source tool: 'claude-code', 'cursor', or 'aider'. If omitted, auto-detects."),
    sourcePath: schema.string().optional().describe("Path to source config (must be within project directory; default: current directory)"),
  },
  async execute(args, context) {
    const projectDir = resolve(context.directory)
    const rawSource = args.sourcePath ?? context.directory
    const rootPath = resolve(projectDir, rawSource)

    const rel = relative(projectDir, rootPath)
    if (rel.startsWith("..") || isAbsolute(rel)) {
      return `❌ sourcePath 는 프로젝트 디렉토리 하위여야 합니다. (받은 값: ${rawSource})`
    }

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
