import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import type { UserProfile } from "../types"
import { getFeatureConfig } from "./feature-presets.js"

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

  let content: string
  if (!existsSync(templatePath)) {
    const fallbackPath = join(TEMPLATES_DIR, DEFAULT_TEMPLATE)
    if (!existsSync(fallbackPath)) {
      content = "# " + (profile.projectFramework || "My Project") + "\n\nProject configuration."
    } else {
      const fallbackContent = readFileSync(fallbackPath, "utf-8")
      content = replaceVariables(fallbackContent, profile)
    }
  } else {
    const templateContent = readFileSync(templatePath, "utf-8")
    content = replaceVariables(templateContent, profile)
  }

  const featureConfig = getFeatureConfig(profile.featureType)
  if (featureConfig.agnetsMDSections.length > 0) {
    content += "\n\n## 기능별 가이드: " + featureConfig.name + "\n\n"
    content += featureConfig.agnetsMDSections.join("\n")
    content += "\n\n### 아키텍처 팁\n\n"
    for (const tip of featureConfig.architectureTips) {
      content += "- " + tip + "\n"
    }
  }

  return content
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
