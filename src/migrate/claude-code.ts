import { existsSync, readdirSync, readFileSync } from "fs"
import { join } from "path"
import { readFileSafe, writeFileSafe, backupFile, copyDirectory, formatMigrationResult } from "./common.js"
import { migrateHooks } from "./hook-converter.js"

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

  const hasClaude = [
    join(rootPath, "CLAUDE.md"),
    join(rootPath, ".claude"),
    join(rootPath, ".mcp.json"),
    join(rootPath, "claude_desktop_config.json"),
  ].some(existsSync)

  if (!hasClaude) {
    return `❌ Claude Code 설정을 찾을 수 없습니다.\n\n확인한 경로:\n  • ${rootPath}/CLAUDE.md\n  • ${rootPath}/.claude/\n  • ${rootPath}/.mcp.json\n\n수동 지정: opencode-setup migrate claude-code --sourcePath <path>`
  }

  const skillsSrc = join(rootPath, ".claude", "skills")
  const skillsDest = join(rootPath, ".opencode", "skills")
  if (existsSync(skillsSrc)) {
    const copied = copyDirectory(skillsSrc, skillsDest)
    files.push(...copied.map((f) => f.replace(rootPath + "/", "")))
  }

  const rulesSrc = join(rootPath, ".claude", "rules")
  const rulesContent: string[] = []
  if (existsSync(rulesSrc)) {
    const ruleFiles = readdirSync(rulesSrc).filter((f) => f.endsWith(".md"))
    for (const ruleFile of ruleFiles) {
      const rulePath = join(rulesSrc, ruleFile)
      const ruleContent = readFileSync(rulePath, "utf-8")
      rulesContent.push(`### ${ruleFile.replace(".md", "")}\n\n${ruleContent}`)
    }
    if (rulesContent.length > 0) {
      suggestions.push(`${rulesContent.length}개 rule을 AGENTS.md에 병합함`)
    }
  }

  const claudeMD = readFileSafe(join(rootPath, "CLAUDE.md"))
  if (claudeMD) {
    const destPath = join(rootPath, "AGENTS.md")
    let finalContent = claudeMD
    
    if (rulesContent.length > 0 && !finalContent.includes("## Rules")) {
      finalContent += "\n\n## Rules\n\n" + rulesContent.join("\n\n")
    }
    
    backupFile(destPath)
    writeFileSafe(destPath, finalContent)
    files.push("AGENTS.md (기존 CLAUDE.md + rules 병합)")
  }

  const mcpConfig = readFileSafe(join(rootPath, ".mcp.json")) || readFileSafe(join(rootPath, "claude_desktop_config.json"))
  if (mcpConfig) {
    suggestions.push("MCP 설정 감지됨 - opencode.json의 mcp 섹션에 수동으로 추가 필요")
  }

  const settings = readFileSafe(join(rootPath, ".claude", "settings.json"))
  if (settings) {
    try {
      const parsed = JSON.parse(settings) as ClaudeCodeConfig
      if (parsed.model) {
        suggestions.push(`모델 설정 감지됨: ${parsed.model} - opencode.json에 수동으로 추가 필요`)
      }
      if (parsed["dangerously-skip-permissions"]) {
        warnings.push("dangerously-skip-permissions는 OpenCode에서 지원되지 않습니다")
      }
    } catch {
      warnings.push(".claude/settings.json 파싱 실패 - 설정이 손상되었을 수 있습니다")
    }
  }

  const hookResult = migrateHooks(rootPath)
  if (hookResult.converted.length > 0) {
    files.push(`.opencode/commands/ (${hookResult.converted.length}개 hook 변환됨)`)
  }
  if (hookResult.warnings.length > 0) {
    warnings.push(...hookResult.warnings)
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
      warnings.push(".claude/settings.json 파싱 실패 - 설정이 손상되었을 수 있습니다")
    }
  }

  const configPath = join(rootPath, "opencode.json")
  backupFile(configPath)
  writeFileSafe(configPath, JSON.stringify(opencodeConfig, null, 2) + "\n")
  files.push("opencode.json")

  return formatMigrationResult("Claude Code", files, warnings, suggestions)
}
