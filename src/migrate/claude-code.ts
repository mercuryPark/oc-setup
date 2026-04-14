import { existsSync } from "fs"
import { join } from "path"
import { readFileSafe, writeFileSafe, backupFile, copyDirectory, formatMigrationResult } from "./common.js"

interface ClaudeCodeConfig {
  model?: string
  "skip-search"?: boolean
  "skip-read"?: boolean
  "dangerously-skip-permissions"?: boolean
  "no-input-detection"?: boolean
}

export function migrateClaudeCode(rootPath: string): string {
  const files: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const claudeMD = readFileSafe(join(rootPath, "CLAUDE.md"))
  if (claudeMD) {
    const destPath = join(rootPath, "AGENTS.md")
    backupFile(destPath)
    writeFileSafe(destPath, claudeMD)
    files.push("AGENTS.md (기존 CLAUDE.md)")
  }

  const skillsSrc = join(rootPath, ".claude", "skills")
  const skillsDest = join(rootPath, ".opencode", "skills")
  if (existsSync(skillsSrc)) {
    const copied = copyDirectory(skillsSrc, skillsDest)
    files.push(...copied.map((f) => f.replace(rootPath + "/", "")))
  }

  const rulesSrc = join(rootPath, ".claude", "rules")
  const rulesDest = join(rootPath, ".opencode", "rules")
  if (existsSync(rulesSrc)) {
    const copied = copyDirectory(rulesSrc, rulesDest)
    files.push(...copied.map((f) => f.replace(rootPath + "/", "")))
    suggestions.push(".claude/rules/ → .opencode/rules/ 마이그레이션됨")
  }

  const mcpConfig = readFileSafe(join(rootPath, ".mcp.json")) || readFileSafe(join(rootPath, "claude_desktop_config.json"))
  if (mcpConfig) {
    suggestions.push("MCP 설정 감지됨 - opencode.json의 mcp 섹션에 수동으로 추가 필요")
  }

  const settings = readFileSafe(join(rootPath, ".claude", "settings.json"))
  if (settings) {
    const parsed = JSON.parse(settings) as ClaudeCodeConfig
    if (parsed.model) {
      suggestions.push(`모델 설정 감지됨: ${parsed.model} - opencode.json에 수동으로 추가 필요`)
    }
    if (parsed["dangerously-skip-permissions"]) {
      warnings.push("dangerously-skip-permissions는 OpenCode에서 지원되지 않습니다")
    }
  }

  const omccPath = join(rootPath, ".claude", "hooks", "oh-my-claude-code")
  if (existsSync(omccPath)) {
    suggestions.push("oh-my-claude-code 감지됨 - oh-my-opencode 설치 권장: npm install -g oh-my-opencode")
  }

  const opencodeConfig: Record<string, unknown> = {
    $schema: "https://opencode.ai/config.json",
    theme: "opencode",
    autoupdate: true,
  }

  const settingsData = readFileSafe(join(rootPath, ".claude", "settings.json"))
  if (settingsData) {
    try {
      const settingsObj = JSON.parse(settingsData) as ClaudeCodeConfig
      if (settingsObj.model) opencodeConfig.model = settingsObj.model
    } catch {
      // skip
    }
  }

  const configPath = join(rootPath, "opencode.json")
  backupFile(configPath)
  writeFileSafe(configPath, JSON.stringify(opencodeConfig, null, 2) + "\n")
  files.push("opencode.json")

  return formatMigrationResult("Claude Code", files, warnings, suggestions)
}
