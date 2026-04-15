import type { MigrationSource } from "./migration"

export type ExperienceLevel = "new" | "beginner" | "intermediate" | "advanced"
export type PreviousTool = "none" | "claude-code" | "cursor" | "aider" | "other"
export type BudgetTier = "free" | "low" | "mid" | "high"
export type PermissionLevel = "safe" | "balanced" | "auto"
export type ProjectScale = "single" | "monorepo"
export type FeatureType = "general" | "chat" | "ecommerce" | "content" | "dashboard" | "api"

export interface MCPServerChoice {
  name: string
  config: Record<string, unknown>
}

/**
 * OMO (oh-my-opencode) 에이전트 설정
 */
export interface OMOAgentConfig {
  model: string
  variant?: "low" | "medium" | "high" | "xhigh"
}

/**
 * OMO (oh-my-opencode) 카테고리 설정
 */
export interface OMOCategoryConfig {
  model: string
  variant?: "low" | "medium" | "high" | "xhigh"
}

/**
 * OMO (oh-my-opencode) 전체 설정
 * 키는 kebab-case로 저장됨 (e.g., "frontend-ui-ux-engineer")
 */
export interface OMOConfig {
  agents: Record<string, OMOAgentConfig | undefined>
  categories: Record<string, OMOCategoryConfig | undefined>
}

/**
 * OMO 사용 여부 및 설정 선택
 */
export interface OMOProfile {
  enabled: boolean
  config?: OMOConfig
}

export interface AdvancedSettings {
  temperature?: number
  reasoningEffort?: "low" | "medium" | "high"
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
  featureType: FeatureType
  migrationSource?: MigrationSource
  omo?: OMOProfile
  advancedSettings?: AdvancedSettings
}
