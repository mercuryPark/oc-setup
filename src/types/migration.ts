import type { PreviousTool } from "./user-profile"
import type { OpenCodeConfig } from "./opencode-config"

export interface MigrationSource {
  tool: PreviousTool
  rootPath: string
  claudeMD?: string
  skills?: string[]
  hooks?: string[]
  rules?: string[]
  mcpConfig?: string
  hasOMCC?: boolean
  cursorRules?: string
  aiderConfig?: string
  conventions?: string
}

export interface MigrationResult {
  agentsMD: string
  config: OpenCodeConfig
  copiedSkills: string[]
  customAgents: Record<string, string>
  customCommands: Record<string, string>
  warnings: string[]
  pluginSuggestions: string[]
  envVars: Record<string, string>
}
