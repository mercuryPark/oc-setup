import { join } from "path"
import { existsSync, readdirSync, readFileSync } from "fs"
import { readFileSafe, writeFileSafe, backupFile, parseYAML, formatMigrationResult } from "./common.js"

interface AiderConfig {
  model?: string
  "completion-model"?: string
  "no-fast-subattempts"?: boolean
  "auto-commits"?: boolean
  "dirty-commits"?: boolean
  "edit-format"?: string
  "lint-cmd"?: string
  "test-cmd"?: string
  "map-tokens"?: number
  "map-refresh"?: string
}

export function migrateAider(rootPath: string): string {
  const files: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const aiderConfig = readFileSafe(join(rootPath, ".aider.conf.yml")) || readFileSafe(join(rootPath, ".aider.conf.yaml"))
  const parsed: AiderConfig = aiderConfig ? parseYAML(aiderConfig) : {}
  
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
    suggestions.push(`완료 모델: ${parsed["completion-model"]} - OpenCode에서는 build/plan 에이전트 모델로 설정`)
  }

  if (parsed["edit-format"]) {
    suggestions.push(`편집 형식: ${parsed["edit-format"]}`)
  }

  if (parsed["lint-cmd"]) {
    suggestions.push(`린트 명령: ${parsed["lint-cmd"]} - .opencode/commands/lint.md로 변환됨`)
  }

  if (parsed["test-cmd"]) {
    suggestions.push(`테스트 명령: ${parsed["test-cmd"]} - .opencode/commands/test.md로 변환됨`)
  }

  if (parsed["no-fast-subattempts"]) {
    warnings.push("no-fast-subattempts 설정은 OpenCode에서 지원되지 않음")
  }

  if (parsed["auto-commits"] === false) {
    warnings.push("auto-commits: false - OpenCode에서는 수동 커밋 권장")
  }

  const configPath = join(rootPath, "opencode.json")
  backupFile(configPath)
  writeFileSafe(configPath, JSON.stringify(opencodeConfig, null, 2) + "\n")
  files.push("opencode.json")

  const conventions = readFileSafe(join(rootPath, ".aider.conventions"))
  if (conventions) {
    const agentsMDPath = join(rootPath, "AGENTS.md")
    let existingContent = ""
    
    const existing = readFileSafe(agentsMDPath)
    if (existing) {
      existingContent = existing
    }
    
    const conventionsSection = `## Project Conventions (from Aider)\n\n${conventions}\n`
    
    backupFile(agentsMDPath)
    writeFileSafe(agentsMDPath, existingContent + "\n\n" + conventionsSection)
    files.push("AGENTS.md (.aider.conventions 병합)")
  }

  const aiderignore = readFileSafe(join(rootPath, ".aiderignore"))
  if (aiderignore) {
    suggestions.push(".aiderignore 감지됨 - .opencodeignore로 복사 권장")
  }

  const chatHistory = readFileSafe(join(rootPath, ".aider.chat.history.md"))
  if (chatHistory) {
    warnings.push(".aider.chat.history.md는 마이그레이션 불가 - 수동 백업 권장")
  }

  return formatMigrationResult("Aider", files, warnings, suggestions)
}
