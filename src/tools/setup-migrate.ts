import { tool } from "@opencode-ai/plugin"

const { schema } = tool

export const setupMigrate: ReturnType<typeof tool> = tool({
  description: "Migrate configuration from existing tools (Claude Code, Cursor, Aider) to OpenCode.",
  args: {
    tool: schema.string().describe("Source tool: 'claude-code', 'cursor', or 'aider'"),
    sourcePath: schema.string().optional().describe("Path to source config (default: auto-detect)"),
  },
  async execute(args) {
    return `마이그레이션 기능은 준비 중입니다: ${args.tool}
    
현재 지원 예정:
- claude-code: CLAUDE.md, skills, rules, hooks, MCP
- cursor: .cursorrules, Cursor Settings
- aider: .aider.conf.yml, conventions

자세한 내용은 DESIGN.md 섹션 3을 참고하세요.`
  },
})
