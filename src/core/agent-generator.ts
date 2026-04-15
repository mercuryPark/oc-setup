import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { backupFile } from "../utils/fs.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "templates/agents")

const DEFAULT_AGENTS = ["reviewer.md", "tester.md", "planner.md"]

export function generateAgents(): Record<string, string> {
  const agents: Record<string, string> = {}

  for (const agent of DEFAULT_AGENTS) {
    const agentPath = join(TEMPLATES_DIR, agent)
    if (existsSync(agentPath)) {
      agents[agent] = readFileSync(agentPath, "utf-8")
    }
  }

  return agents
}

export function writeAgents(agents: Record<string, string>, dir: string): void {
  const agentsDir = join(dir, ".opencode", "agents")

  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true })
  }

  for (const [filename, content] of Object.entries(agents)) {
    const filePath = join(agentsDir, filename)
    backupFile(filePath)
    writeFileSync(filePath, content, "utf-8")
  }
}
