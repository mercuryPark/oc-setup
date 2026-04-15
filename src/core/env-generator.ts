import { writeFileSync } from "fs"
import { join } from "path"
import type { UserProfile } from "../types"
import { getFeatureConfig } from "./feature-presets.js"

const PROVIDER_ENV_VARS: Record<string, { key: string; name: string }> = {
  anthropic: { key: "ANTHROPIC_API_KEY", name: "Anthropic" },
  google: { key: "GEMINI_API_KEY", name: "Google Gemini" },
  openai: { key: "OPENAI_API_KEY", name: "OpenAI" },
  deepseek: { key: "DEEPSEEK_API_KEY", name: "DeepSeek" },
  openrouter: { key: "OPENROUTER_API_KEY", name: "OpenRouter" },
  minimax: { key: "MINIMAX_API_KEY", name: "MiniMax" },
  ollama: { key: "OLLAMA_BASE_URL", name: "Ollama" },
}

export function generateEnvExample(profile: UserProfile): string {
  const lines: string[] = [
    "# OpenCode Environment Variables",
    "# Copy this file to .env and fill in your values",
    "",
  ]

  for (const provider of profile.providers) {
    const envConfig = PROVIDER_ENV_VARS[provider]
    if (envConfig) {
      lines.push(`# ${envConfig.name}`)
      lines.push(`${envConfig.key}=your_key_here`)
      lines.push("")
    }
  }

  const featureConfig = getFeatureConfig(profile.featureType)
  if (featureConfig.envVars.length > 0) {
    lines.push(`# ${featureConfig.name} 관련 설정`)
    for (const envVar of featureConfig.envVars) {
      lines.push(`${envVar}=`)
    }
    lines.push("")
  }

  lines.push("# Optional: Custom OpenCode settings")
  lines.push("# OPENCODE_CONFIG=/path/to/custom/config.json")

  return lines.join("\n")
}

export function writeEnvExample(content: string, dir: string): void {
  const filePath = join(dir, ".env.example")

  writeFileSync(filePath, content, "utf-8")
}
