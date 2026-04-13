export interface OpenCodeConfig {
  $schema: string
  model?: string
  provider?: Record<string, ProviderConfig>
  permission?: PermissionConfig
  agent?: Record<string, AgentConfig>
  default_agent?: string
  command?: Record<string, CommandConfig>
  mcp?: Record<string, MCPConfig>
  lsp?: Record<string, LSPConfig>
  plugin?: string[]
  instructions?: string[]
  theme?: string
  autoupdate?: boolean
}

export interface ProviderConfig {
  options?: { apiKey?: string; baseURL?: string }
  models?: Record<string, { id: string; name: string }>
}

export interface AgentConfig {
  description?: string
  model?: string
  prompt?: string
  temperature?: number
  reasoningEffort?: "low" | "medium" | "high"
}

export interface PermissionConfig {
  edit?: "allow" | "ask" | "deny"
  bash?: Record<string, "allow" | "ask" | "deny">
  webfetch?: "allow" | "ask" | "deny"
}

export interface MCPConfig {
  type: "sse" | "stdio"
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
}

export interface LSPConfig {
  disabled?: boolean
  command: string
  args?: string[]
}

export interface CommandConfig {
  template: string
  description?: string
  agent?: string
  model?: string
}
