import { mkdirSync, existsSync, writeFileSync, renameSync } from "fs"
import { join, dirname } from "path"
import type { UserProfile, OpenCodeConfig, PermissionConfig, AgentConfig, MCPConfig, LSPConfig } from "../types"
import { createMCPConfig } from "./mcp-templates.js"
import { addTUIConfigToGlobal } from "./tui-generator.js"
import { backupFile } from "../utils/fs.js"

/**
 * Write file atomically using temp file + rename pattern
 */
function atomicWrite(filePath: string, content: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const tempPath = `${filePath}.tmp.${Date.now()}`
  writeFileSync(tempPath, content, "utf-8")
  renameSync(tempPath, filePath)
}

const PROVIDER_API_KEYS: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  google: "GEMINI_API_KEY",
  openai: "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  minimax: "MINIMAX_API_KEY",
}

const BUDGET_MODELS: Record<string, { build: string; plan: string }> = {
  free: { build: "opencode/big-pickle", plan: "opencode/big-pickle" },
  low: { build: "minimax/minimax-m2.5", plan: "opencode/big-pickle" },
  mid: { build: "anthropic/claude-sonnet-4-5", plan: "google/gemini-2.5-flash" },
  high: { build: "anthropic/claude-sonnet-4-5", plan: "anthropic/claude-opus-4-6" },
}

const LSP_BY_LANGUAGE: Record<string, string> = {
  typescript: "typescript-language-server",
  javascript: "typescript-language-server",
  go: "gopls",
  python: "pyright",
  rust: "rust-analyzer",
}

function getPermissionConfig(level: UserProfile["permissionLevel"]): PermissionConfig {
  switch (level) {
    case "safe":
      return { edit: "ask", bash: { "*": "ask" } }
    case "balanced":
      return {
        edit: "allow",
        bash: { "npm *": "allow", "git *": "allow", "rm *": "ask", "*": "ask" },
      }
    case "auto":
      return { edit: "allow", bash: { "*": "allow" } }
  }
}

function getAgentConfig(budget: UserProfile["budget"], advancedSettings?: UserProfile["advancedSettings"]): Record<string, AgentConfig> {
  const models = BUDGET_MODELS[budget] || BUDGET_MODELS.mid
  const config: Record<string, AgentConfig> = {
    build: { model: models.build },
    plan: { model: models.plan },
  }

  if (advancedSettings) {
    if (advancedSettings.temperature !== undefined) {
      config.build.temperature = advancedSettings.temperature
      config.plan.temperature = advancedSettings.temperature
    }

    if (advancedSettings.reasoningEffort !== undefined) {
      config.build.reasoningEffort = advancedSettings.reasoningEffort
      config.plan.reasoningEffort = advancedSettings.reasoningEffort
    }
  }

  return config
}

function getMCPConfig(mcpServers: UserProfile["mcpServers"]): Record<string, MCPConfig> {
  const result: Record<string, MCPConfig> = {}

  for (const mcp of mcpServers) {
    const templateConfig = createMCPConfig(mcp.name, mcp.config as Partial<MCPConfig>)
    if (templateConfig) {
      result[mcp.name] = templateConfig
    } else {
      result[mcp.name] = {
        type: "sse",
        ...mcp.config,
      } as MCPConfig
    }
  }

  return result
}

function getLSPConfig(language: string): Record<string, LSPConfig> {
  const lspCommand = LSP_BY_LANGUAGE[language]
  if (!lspCommand) return {}

  return {
    [language]: {
      command: lspCommand,
    },
  }
}

export function generateGlobalConfig(profile: UserProfile): OpenCodeConfig {
  const config: OpenCodeConfig = {
    $schema: "https://opencode.ai/config.json",
    theme: "opencode",
    autoupdate: true,
    plugin: profile.plugins,
    default_agent: "build",
  }

  addTUIConfigToGlobal(config as unknown as Record<string, unknown>, profile)

  if (profile.providers.length > 0) {
    config.provider = {}
    for (const provider of profile.providers) {
      const apiKey = PROVIDER_API_KEYS[provider]
      if (apiKey) {
        config.provider[provider] = {
          options: { apiKey: `{env:${apiKey}}` },
        }
      }
    }
  }

  const models = BUDGET_MODELS[profile.budget] || BUDGET_MODELS.mid
  config.model = models.build

  return config
}

export function generateProjectConfig(profile: UserProfile): OpenCodeConfig {
  const config: OpenCodeConfig = {
    $schema: "https://opencode.ai/config.json",
    permission: getPermissionConfig(profile.permissionLevel),
    agent: getAgentConfig(profile.budget),
  }

  if (profile.mcpServers.length > 0) {
    config.mcp = getMCPConfig(profile.mcpServers)
  }

  const lspConfig = getLSPConfig(profile.projectLanguage)
  if (Object.keys(lspConfig).length > 0) {
    config.lsp = lspConfig
  }

  if (profile.projectScale === "monorepo") {
    config.instructions = ["packages/*/AGENTS.md"]
  }

  return config
}

export function writeConfig(config: OpenCodeConfig, filePath: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  backupFile(filePath)

  const content = JSON.stringify(config, null, 2) + "\n"
  atomicWrite(filePath, content)
}

export function writeGlobalConfig(profile: UserProfile, homeDir: string): void {
  const config = generateGlobalConfig(profile)
  const path = join(homeDir, ".config/opencode/opencode.json")
  writeConfig(config, path)
}

export function writeProjectConfig(profile: UserProfile, projectDir: string): void {
  const config = generateProjectConfig(profile)
  const path = join(projectDir, "opencode.json")
  writeConfig(config, path)
}
