import { join } from "path"
import { readFileSafe, writeFileSafe, backupFile, parseYAML, formatMigrationResult } from "./common.js"

export function migrateAider(rootPath: string): string {
  const files: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const aiderConfig = readFileSafe(join(rootPath, ".aider.conf.yml")) || readFileSafe(join(rootPath, ".aider.conf.yaml"))
  if (aiderConfig) {
    const parsed = parseYAML(aiderConfig)
    const opencodeConfig: Record<string, unknown> = {
      $schema: "https://opencode.ai/config.json",
      theme: "opencode",
      autoupdate: true,
    }

    if (parsed.model) {
      opencodeConfig.model = parsed.model
      suggestions.push(`모델: ${parsed.model}`)
    }

    if (parsed["completion-model"]) {
      suggestions.push(`완료 모델: ${parsed["completion-model"]}`)
    }

    if (parsed["no-fast-subattempts"]) {
      warnings.push("no-fast-subattempts 설정은 OpenCode에서 지원되지 않음")
    }

    const configPath = join(rootPath, "opencode.json")
    backupFile(configPath)
    writeFileSafe(configPath, JSON.stringify(opencodeConfig, null, 2) + "\n")
    files.push("opencode.json")
  }

  const conventions = readFileSafe(join(rootPath, ".aider.conventions"))
  if (conventions) {
    const agentsMDPath = join(rootPath, "AGENTS.md")
    backupFile(agentsMDPath)
    writeFileSafe(agentsMDPath, `# Project Conventions\n\n${conventions}\n`)
    files.push("AGENTS.md (.aider.conventions)")
  }

  const chatHistory = readFileSafe(join(rootPath, ".aider.chat.history.md"))
  if (chatHistory) {
    warnings.push(".aider.chat.history.md는 마이그레이션 불가 - 수동 백업 권장")
  }

  return formatMigrationResult("Aider", files, warnings, suggestions)
}
