/**
 * Preset Registry
 * Manages model presets and stack presets
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "templates")

// ============================================================
// Types
// ============================================================

export interface ModelPreset {
  name: string
  description: string
  monthlyCost: string
  config: Record<string, unknown>
}

export interface StackPreset {
  name: string
  description: string
  modelPreset: string
  includes: {
    agentsMD: string
    commands: string[]
    agents: string[]
    skills: string[]
  }
}

export interface ApplyResult {
  success: boolean
  files: string[]
  warnings: string[]
}

// ============================================================
// Model Presets (from templates/configs/)
// ============================================================

export const MODEL_PRESETS: ModelPreset[] = [
  {
    name: "budget",
    description: "Big Pickle 무료 조합",
    monthlyCost: "무료 ~ $10",
    config: JSON.parse(readFileSync(join(TEMPLATES_DIR, "configs/budget.json"), "utf-8")),
  },
  {
    name: "balanced",
    description: "Sonnet + Flash",
    monthlyCost: "$20 ~ $40",
    config: JSON.parse(readFileSync(join(TEMPLATES_DIR, "configs/balanced.json"), "utf-8")),
  },
  {
    name: "power",
    description: "Sonnet + Opus",
    monthlyCost: "$50+",
    config: JSON.parse(readFileSync(join(TEMPLATES_DIR, "configs/power.json"), "utf-8")),
  },
  {
    name: "minimax",
    description: "M2.5 + Big Pickle",
    monthlyCost: "$5 ~ $15",
    config: JSON.parse(readFileSync(join(TEMPLATES_DIR, "configs/minimax.json"), "utf-8")),
  },
  {
    name: "google-only",
    description: "Gemini Pro + Flash",
    monthlyCost: "$15 ~ $30",
    config: JSON.parse(readFileSync(join(TEMPLATES_DIR, "configs/google-only.json"), "utf-8")),
  },
]

// ============================================================
// Stack Presets
// ============================================================

export const STACK_PRESETS: StackPreset[] = [
  {
    name: "frontend-ts",
    description: "TypeScript 프론트엔드 최적화 (Next.js/React)",
    modelPreset: "balanced",
    includes: {
      agentsMD: "frontend-ts.md",
      commands: ["test.md", "lint.md", "review.md", "plan.md"],
      agents: ["reviewer.md", "tester.md", "planner.md"],
      skills: ["code-review", "testing", "frontend-design"],
    },
  },
  {
    name: "backend-go",
    description: "Go 백엔드 최적화",
    modelPreset: "balanced",
    includes: {
      agentsMD: "backend-go.md",
      commands: ["test.md", "lint.md", "review.md", "plan.md"],
      agents: ["reviewer.md", "tester.md", "planner.md"],
      skills: ["code-review", "testing"],
    },
  },
  {
    name: "backend-python",
    description: "Python 백엔드 최적화 (FastAPI)",
    modelPreset: "balanced",
    includes: {
      agentsMD: "backend-python.md",
      commands: ["test.md", "lint.md", "review.md", "plan.md"],
      agents: ["reviewer.md", "tester.md", "planner.md"],
      skills: ["code-review", "testing"],
    },
  },
  {
    name: "fullstack",
    description: "풀스택 프로젝트 최적화",
    modelPreset: "balanced",
    includes: {
      agentsMD: "fullstack.md",
      commands: ["test.md", "lint.md", "review.md", "plan.md"],
      agents: ["reviewer.md", "tester.md", "planner.md"],
      skills: ["code-review", "testing"],
    },
  },
]

// ============================================================
// Registry Functions
// ============================================================

/**
 * List all presets (model + stack) in table format
 */
export function listPresets(): string {
  const lines: string[] = ["# Available Presets\n"]

  // Model Presets
  lines.push("## Model Presets")
  lines.push("")
  lines.push("| Name | Description | Monthly Cost |")
  lines.push("|------|-------------|--------------|")
  for (const preset of MODEL_PRESETS) {
    lines.push(`| \`${preset.name}\` | ${preset.description} | ${preset.monthlyCost} |`)
  }

  // Stack Presets
  lines.push("")
  lines.push("## Stack Presets")
  lines.push("")
  lines.push("| Name | Description |")
  lines.push("|------|-------------|")
  for (const preset of STACK_PRESETS) {
    lines.push(`| \`${preset.name}\` | ${preset.description} |`)
  }

  return lines.join("\n")
}

/**
 * Get model preset by name
 */
export function getModelPreset(name: string): ModelPreset | undefined {
  return MODEL_PRESETS.find((p) => p.name === name)
}

/**
 * Get stack preset by name
 */
export function getStackPreset(name: string): StackPreset | undefined {
  return STACK_PRESETS.find((p) => p.name === name)
}

/**
 * Apply a preset to the project directory
 */
export async function applyPreset(
  name: string,
  projectDir: string,
  options: { projectName?: string; testRunner?: string; linter?: string } = {}
): Promise<ApplyResult> {
  const files: string[] = []
  const warnings: string[] = []

  // Check if it's a model preset
  const modelPreset = getModelPreset(name)
  if (modelPreset) {
    const configPath = join(projectDir, "opencode.json")
    const configDir = dirname(configPath)

    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }

    // Merge with existing config if exists
    let existingConfig: Record<string, unknown> = {}
    if (existsSync(configPath)) {
      try {
        existingConfig = JSON.parse(readFileSync(configPath, "utf-8"))
      } catch {
        warnings.push(`Could not parse existing opencode.json at ${configPath}`)
      }
    }

    // Merge configs
    const newConfig = {
      ...existingConfig,
      ...modelPreset.config,
    }

    writeFileSync(configPath, JSON.stringify(newConfig, null, 2) + "\n")
    files.push(configPath)

    return { success: true, files, warnings }
  }

  // Check if it's a stack preset
  const stackPreset = getStackPreset(name)
  if (stackPreset) {
    const { includes } = stackPreset

    // Create .opencode directories
    const opencodeDir = join(projectDir, ".opencode")
    const agentsDir = join(opencodeDir, "agents")
    const commandsDir = join(opencodeDir, "commands")
    const skillsDir = join(opencodeDir, "skills")

    mkdirSync(agentsDir, { recursive: true })
    mkdirSync(commandsDir, { recursive: true })
    mkdirSync(skillsDir, { recursive: true })

    // Copy agents-md
    const agentsMDSource = join(TEMPLATES_DIR, "agents-md", includes.agentsMD)
    const agentsMDDest = join(projectDir, "AGENTS.md")
    if (existsSync(agentsMDSource)) {
      let content = readFileSync(agentsMDSource, "utf-8")
      // Replace placeholders
      content = content.replace(/\{\{projectName\}\}/g, options.projectName || "My Project")
      content = content.replace(/\{\{testRunner\}\}/g, options.testRunner || "vitest")
      content = content.replace(/\{\{linter\}\}/g, options.linter || "biome")
      writeFileSync(agentsMDDest, content)
      files.push(agentsMDDest)
    }

    // Copy commands
    for (const cmd of includes.commands) {
      const src = join(TEMPLATES_DIR, "commands", cmd)
      const dest = join(commandsDir, cmd.replace(".md", ".md"))
      if (existsSync(src)) {
        cpSync(src, dest)
        files.push(dest)
      }
    }

    // Copy agents
    for (const agent of includes.agents) {
      const src = join(TEMPLATES_DIR, "agents", agent)
      const dest = join(agentsDir, agent)
      if (existsSync(src)) {
        cpSync(src, dest)
        files.push(dest)
      }
    }

    // Copy skills
    for (const skill of includes.skills) {
      const src = join(TEMPLATES_DIR, "skills", skill)
      const dest = join(skillsDir, skill)
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true })
        files.push(dest)
      }
    }

    // Also apply the model preset
    const modelResult = await applyPreset(stackPreset.modelPreset, projectDir, options)
    files.push(...modelResult.files)
    warnings.push(...modelResult.warnings)

    return { success: true, files, warnings }
  }

  // Unknown preset
  return {
    success: false,
    files: [],
    warnings: [`Unknown preset: ${name}. Use 'preset list' to see available presets.`],
  }
}
