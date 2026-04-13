import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import type { UserProfile } from "../types"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "../../templates/skills")

const BASE_SKILLS = ["code-review", "testing"]
const FRONTEND_SKILL = "frontend-design"

export function generateSkills(profile: UserProfile): Record<string, string> {
  const skills: Record<string, string> = {}

  const language = profile.projectLanguage?.toLowerCase() || ""
  const isFrontend = ["typescript", "javascript"].includes(language) ||
    profile.projectFramework?.toLowerCase().includes("react") ||
    profile.projectFramework?.toLowerCase().includes("next")

  const skillDirs = [...BASE_SKILLS]
  if (isFrontend) {
    skillDirs.push(FRONTEND_SKILL)
  }

  for (const skill of skillDirs) {
    const skillDir = join(TEMPLATES_DIR, skill)
    if (existsSync(skillDir)) {
      const files = [
        { src: join(skillDir, "SKILL.md"), dest: skill + "/SKILL.md" }
      ]

      for (const file of files) {
        if (existsSync(file.src)) {
          skills[file.dest] = readFileSync(file.src, "utf-8")
        }
      }
    }
  }

  return skills
}

function backupFile(path: string): void {
  if (existsSync(path)) {
    const backupPath = `${path}.bak`
    cpSync(path, backupPath)
  }
}

export function writeSkills(skills: Record<string, string>, dir: string): void {
  const skillsDir = join(dir, ".opencode", "skills")

  if (!existsSync(skillsDir)) {
    mkdirSync(skillsDir, { recursive: true })
  }

  for (const [relativePath, content] of Object.entries(skills)) {
    const skillSubDir = relativePath.split("/")[0]
    const fileName = relativePath.split("/")[1] || "SKILL.md"
    const skillDir = join(skillsDir, skillSubDir)
    const filePath = join(skillDir, fileName)

    if (!existsSync(skillDir)) {
      mkdirSync(skillDir, { recursive: true })
    }

    backupFile(filePath)
    writeFileSync(filePath, content, "utf-8")
  }
}
