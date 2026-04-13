import type { MigrationSource } from "./migration"

export type ExperienceLevel = "new" | "beginner" | "intermediate" | "advanced"
export type PreviousTool = "none" | "claude-code" | "cursor" | "aider" | "other"
export type BudgetTier = "free" | "low" | "mid" | "high"
export type PermissionLevel = "safe" | "balanced" | "auto"
export type ProjectScale = "single" | "monorepo"

export interface MCPServerChoice {
  name: string
  config: Record<string, unknown>
}

export interface UserProfile {
  experienceLevel: ExperienceLevel
  previousTool: PreviousTool
  providers: string[]
  budget: BudgetTier
  projectLanguage: string
  projectFramework: string
  testRunner: string
  linter: string
  projectScale: ProjectScale
  mcpServers: MCPServerChoice[]
  plugins: string[]
  permissionLevel: PermissionLevel
  migrationSource?: MigrationSource
}
