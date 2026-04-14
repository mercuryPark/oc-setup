import { detectTool } from "./common.js"
import { migrateClaudeCode } from "./claude-code.js"
import { migrateCursor } from "./cursor.js"
import { migrateAider } from "./aider.js"

export type MigrationTool = "claude-code" | "cursor" | "aider"

export async function runMigration(
  tool: MigrationTool,
  rootPath: string
): Promise<string> {
  switch (tool) {
    case "claude-code":
      return migrateClaudeCode(rootPath)
    case "cursor":
      return migrateCursor(rootPath)
    case "aider":
      return migrateAider(rootPath)
    default:
      return `❌ 지원하지 않는 도구입니다: ${tool}\n\n지원: claude-code, cursor, aider`
  }
}

export function autoMigrate(rootPath: string): string {
  const detected = detectTool(rootPath)
  if (!detected) {
    return `❌ 마이그레이션할 도구를 찾을 수 없습니다.\n\n감지 가능한 도구:\n- Claude Code: .claude/, CLAUDE.md\n- Cursor: .cursorrules\n- Aider: .aider.conf.yml\n\n수동으로 지정: opencode-setup migrate <tool-name>`
  }

  switch (detected) {
    case "claude-code":
      return migrateClaudeCode(rootPath)
    case "cursor":
      return migrateCursor(rootPath)
    case "aider":
      return migrateAider(rootPath)
    default:
      return `❌ 알 수 없는 도구: ${detected}`
  }
}
