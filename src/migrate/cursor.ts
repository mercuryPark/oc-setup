import { join } from "path"
import { readFileSafe, writeFileSafe, backupFile, formatMigrationResult } from "./common.js"

export function migrateCursor(rootPath: string): string {
  const files: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const cursorRules = readFileSafe(join(rootPath, ".cursorrules"))
  if (cursorRules) {
    const destPath = join(rootPath, "AGENTS.md")
    backupFile(destPath)
    writeFileSafe(destPath, cursorRules)
    files.push("AGENTS.md (기존 .cursorrules)")
  }

  const mcpConfig = readFileSafe(join(rootPath, ".cursor", "mcp.json"))
  if (mcpConfig) {
    try {
      const mcpData = JSON.parse(mcpConfig)
      if (mcpData.mcpServers) {
        suggestions.push("MCP 서버 설정 감지됨 - opencode.json의 mcp 섹션에 추가 필요")
      }
    } catch {
      warnings.push("MCP 설정 파싱 실패 - JSON 형식 오류")
    }
  }

  const cursorSettings = readFileSafe(join(rootPath, ".cursor", "settings.json"))
  if (cursorSettings) {
    suggestions.push("Cursor 설정 감지됨 - 수동으로 OpenCode 설정에 반영 필요")
  }

  const cursorRulesContents = readFileSafe(join(rootPath, ".cursor", "rules"))
  if (cursorRulesContents) {
    warnings.push("Cursor Rules 감지됨 - AGENTS.md에 병합 필요")
  }

  const opencodeConfig: Record<string, unknown> = {
    $schema: "https://opencode.ai/config.json",
    theme: "opencode",
    autoupdate: true,
  }

  const configPath = join(rootPath, "opencode.json")
  backupFile(configPath)
  writeFileSafe(configPath, JSON.stringify(opencodeConfig, null, 2) + "\n")
  files.push("opencode.json")

  return formatMigrationResult("Cursor", files, warnings, suggestions)
}
