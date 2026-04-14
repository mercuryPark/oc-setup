import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import type { UserProfile } from "../types"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "templates/agents-md")

const FRAMEWORK_TEMPLATE_MAP: Record<string, string> = {
  nextjs: "frontend-ts.md",
  react: "frontend-ts.md",
  svelte: "frontend-ts.md",
  vue: "frontend-ts.md",
  go: "backend-go.md",
  gin: "backend-go.md",
  fastapi: "backend-python.md",
  python: "backend-python.md",
  django: "backend-python.md",
  flask: "backend-python.md",
}

const DEFAULT_TEMPLATE = "base.md"

function getTemplateForFramework(framework: string): string {
  const lowerFramework = framework.toLowerCase()
  for (const [key, template] of Object.entries(FRAMEWORK_TEMPLATE_MAP)) {
    if (lowerFramework.includes(key)) {
      return template
    }
  }
  return DEFAULT_TEMPLATE
}

function replaceVariables(content: string, profile: UserProfile): string {
  const projectName = "My Project"
  const testRunner = profile.testRunner || "vitest"
  const linter = profile.linter || "biome"

  let result = content.replace(/\{\{projectName\}\}/g, projectName)
  result = result.replace(/\{\{testRunner\}\}/g, testRunner)
  result = result.replace(/\{\{linter\}\}/g, linter)
  result = result.replace(/\{\{projectDescription\}\}/g, "This project...")
  result = result.replace(/\{\{structure\}\}/g, "See project structure")
  result = result.replace(/\{\{codeStandards\}\}/g, "Follow TypeScript best practices")
  result = result.replace(/\{\{testingGuidelines\}\}/g, "Run tests with " + testRunner)

  if (profile.migrationSource?.rules && profile.migrationSource.rules.length > 0) {
    const rulesContent = profile.migrationSource.rules.join("\n")
    if (!result.includes("## Rules")) {
      result += "\n\n## Rules\n\n" + rulesContent
    }
  }

  return result
}

export function generateAgentsMD(profile: UserProfile): string {
  const templateName = getTemplateForFramework(profile.projectFramework)
  const templatePath = join(TEMPLATES_DIR, templateName)

  if (!existsSync(templatePath)) {
    const fallbackPath = join(TEMPLATES_DIR, DEFAULT_TEMPLATE)
    if (!existsSync(fallbackPath)) {
      return "# " + (profile.projectFramework || "My Project") + "\n\nProject configuration."
    }
    const fallbackContent = readFileSync(fallbackPath, "utf-8")
    return replaceVariables(fallbackContent, profile)
  }

  const content = readFileSync(templatePath, "utf-8")
  return replaceVariables(content, profile)
}

function backupFile(path: string): void {
  if (existsSync(path)) {
    const backupPath = `${path}.bak`
    cpSync(path, backupPath)
  }
}

export function writeAgentsMD(content: string, dir: string): void {
  const filePath = join(dir, "AGENTS.md")
  const dirPath = dirname(filePath)

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }

  backupFile(filePath)
  writeFileSync(filePath, content, "utf-8")
}
