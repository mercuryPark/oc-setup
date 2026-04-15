import { join } from "path"
import { existsSync, readdirSync, readFileSync } from "fs"
import { readFileSafe, writeFileSafe, backupFile, formatMigrationResult } from "./common.js"
import { createMCPConfig } from "../core/mcp-templates.js"

interface CursorMCPConfig {
  mcpServers?: Record<string, {
    command?: string
    args?: string[]
    env?: Record<string, string>
  }>
}

interface CursorSettings {
  models?: {
    default?: string
    agent?: string
  }
  context?: {
    include?: string[]
    exclude?: string[]
  }
}

export function migrateCursor(rootPath: string): string {
  const files: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  const mcpServers: Record<string, unknown> = {}

  const cursorRules = readFileSafe(join(rootPath, ".cursorrules"))
  if (cursorRules) {
    const destPath = join(rootPath, "AGENTS.md")
    backupFile(destPath)
    writeFileSafe(destPath, cursorRules)
    files.push("AGENTS.md (기존 .cursorrules)")
  }

  const cursorRulesDir = join(rootPath, ".cursor", "rules")
  const rulesContent: string[] = []
  if (existsSync(cursorRulesDir)) {
    const ruleFiles = readdirSync(cursorRulesDir).filter((f) => f.endsWith(".md"))
    for (const ruleFile of ruleFiles) {
      const rulePath = join(cursorRulesDir, ruleFile)
      const ruleContent = readFileSync(rulePath, "utf-8")
      rulesContent.push(`### ${ruleFile.replace(".md", "")}\n\n${ruleContent}`)
    }
    if (rulesContent.length > 0) {
      suggestions.push(`${rulesContent.length}개 Cursor rule을 AGENTS.md에 병합함`)
    }
  }

  const mcpConfig = readFileSafe(join(rootPath, ".cursor", "mcp.json"))
  if (mcpConfig) {
    try {
      const mcpData = JSON.parse(mcpConfig) as CursorMCPConfig
      if (mcpData.mcpServers) {
        for (const [name, config] of Object.entries(mcpData.mcpServers)) {
          const templateConfig = createMCPConfig(name)
          if (templateConfig) {
            mcpServers[name] = templateConfig
          } else {
            mcpServers[name] = {
              type: "stdio",
              command: config.command,
              args: config.args,
              env: config.env,
            }
          }
        }
        files.push("MCP 설정 (Cursor → OpenCode)")
      }
    } catch {
      warnings.push("MCP 설정 파싱 실패 - JSON 형식 오류")
    }
  }

  const cursorSettings = readFileSafe(join(rootPath, ".cursor", "settings.json"))
  let detectedModel: string | undefined
  if (cursorSettings) {
    try {
      const settings = JSON.parse(cursorSettings) as CursorSettings
      if (settings.models?.default) {
        detectedModel = settings.models.default
        suggestions.push(`기본 모델: ${detectedModel}`)
      }
      if (settings.context?.include) {
        suggestions.push(`컨텍스트 포함: ${settings.context.include.join(", ")}`)
      }
      if (settings.context?.exclude) {
        suggestions.push(`컨텍스트 제외: ${settings.context.exclude.join(", ")}`)
      }
    } catch {
      warnings.push("Cursor settings.json 파싱 실패")
    }
  }

  const opencodeConfig: Record<string, unknown> = {
    $schema: "https://opencode.ai/config.json",
    theme: "opencode",
    autoupdate: true,
  }

  if (detectedModel) {
    opencodeConfig.model = detectedModel
  }

  if (Object.keys(mcpServers).length > 0) {
    opencodeConfig.mcp = mcpServers
  }

  const configPath = join(rootPath, "opencode.json")
  backupFile(configPath)
  writeFileSafe(configPath, JSON.stringify(opencodeConfig, null, 2) + "\n")
  files.push("opencode.json")

  return formatMigrationResult("Cursor", files, warnings, suggestions)
}
