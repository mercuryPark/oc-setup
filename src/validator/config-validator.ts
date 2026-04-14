import { join } from "path"
import { existsSync, readFileSync } from "fs"

interface ValidationError {
  type: "error" | "warning"
  file: string
  message: string
}

export async function runValidation(directory: string): Promise<string> {
  const errors: ValidationError[] = []

  const globalConfigPath = join(process.env.HOME || "~", ".config/opencode/opencode.json")
  const expandedGlobalPath = globalConfigPath.replace("~", process.env.HOME || "")

  if (existsSync(expandedGlobalPath)) {
    try {
      const content = readFileSync(expandedGlobalPath, "utf-8")
      const config = JSON.parse(content)

      if (!config.$schema) {
        errors.push({ type: "warning", file: "~/.config/opencode/opencode.json", message: "Missing $schema field" })
      }

      if (config.model) {
        // Allow provider/model format with letters, numbers, dots, underscores, hyphens
        const modelPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
        if (!modelPattern.test(config.model)) {
          errors.push({ type: "error", file: "~/.config/opencode/opencode.json", message: `Invalid model format: '${config.model}'. Expected 'provider/model'` })
        }
      }

      if (config.permission) {
        const validValues = ["allow", "ask", "deny"]
        if (config.permission.edit && !validValues.includes(config.permission.edit)) {
          errors.push({ type: "error", file: "~/.config/opencode/opencode.json", message: `Invalid permission.edit value: '${config.permission.edit}'` })
        }
        if (config.permission.webfetch && !validValues.includes(config.permission.webfetch)) {
          errors.push({ type: "error", file: "~/.config/opencode/opencode.json", message: `Invalid permission.webfetch value: '${config.permission.webfetch}'` })
        }
      }

      if (config.plugin) {
        if (!Array.isArray(config.plugin)) {
          errors.push({ type: "error", file: "~/.config/opencode/opencode.json", message: "plugin must be an array" })
        } else if (!config.plugin.every((p: unknown) => typeof p === "string" || (Array.isArray(p) && typeof (p as string[])[0] === "string"))) {
          errors.push({ type: "error", file: "~/.config/opencode/opencode.json", message: "plugin array must contain strings or [string, options] tuples" })
        }
      }
    } catch (e) {
      errors.push({ type: "error", file: "~/.config/opencode/opencode.json", message: `Invalid JSON: ${e instanceof Error ? e.message : "Unknown error"}` })
    }
  }

  const projectConfigPath = join(directory, "opencode.json")
  if (existsSync(projectConfigPath)) {
    try {
      const content = readFileSync(projectConfigPath, "utf-8")
      const config = JSON.parse(content)

      if (config.permission) {
        const validValues = ["allow", "ask", "deny"]
        if (config.permission.edit && !validValues.includes(config.permission.edit)) {
          errors.push({ type: "error", file: "opencode.json", message: `Invalid permission.edit value: '${config.permission.edit}'` })
        }
      }

      if (config.plugin && !Array.isArray(config.plugin)) {
        errors.push({ type: "error", file: "opencode.json", message: "plugin must be an array" })
      }
    } catch (e) {
      errors.push({ type: "error", file: "opencode.json", message: `Invalid JSON: ${e instanceof Error ? e.message : "Unknown error"}` })
    }
  }

  const agentsPath = join(directory, "AGENTS.md")
  if (!existsSync(agentsPath)) {
    errors.push({ type: "warning", file: "AGENTS.md", message: "AGENTS.md not found in project root" })
  } else {
    const content = readFileSync(agentsPath, "utf-8")

    if (content.trim().length === 0) {
      errors.push({ type: "error", file: "AGENTS.md", message: "AGENTS.md is empty" })
    }

    if (!content.includes("## ")) {
      errors.push({ type: "warning", file: "AGENTS.md", message: "AGENTS.md has no section headers (##)" })
    }
  }

  const errorCount = errors.filter((e) => e.type === "error").length
  const warningCount = errors.filter((e) => e.type === "warning").length

  const lines: string[] = ["📋 Configuration Validation\n"]

  if (errors.length === 0) {
    lines.push("\x1b[32m✓ All checks passed!\x1b[0m")
  } else {
    for (const error of errors) {
      const icon = error.type === "error" ? "✗" : "⚠"
      const color = error.type === "error" ? "31" : "33"
      lines.push(`\x1b[${color}m${icon} ${error.file}\x1b[0m ${error.message}`)
    }
  }

  lines.push("")
  lines.push("---")
  lines.push(`Summary: ${errorCount} errors, ${warningCount} warnings`)

  return lines.join("\n")
}
