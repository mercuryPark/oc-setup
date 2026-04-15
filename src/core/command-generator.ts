import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { backupFile } from "../utils/fs.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "templates/commands")

const DEFAULT_COMMANDS = ["test.md", "lint.md", "review.md", "plan.md"]

export function generateCommands(): Record<string, string> {
  const commands: Record<string, string> = {}

  for (const cmd of DEFAULT_COMMANDS) {
    const cmdPath = join(TEMPLATES_DIR, cmd)
    if (existsSync(cmdPath)) {
      commands[cmd] = readFileSync(cmdPath, "utf-8")
    }
  }

  return commands
}

export function writeCommands(commands: Record<string, string>, dir: string): void {
  const commandsDir = join(dir, ".opencode", "commands")

  if (!existsSync(commandsDir)) {
    mkdirSync(commandsDir, { recursive: true })
  }

  for (const [filename, content] of Object.entries(commands)) {
    const filePath = join(commandsDir, filename)
    backupFile(filePath)
    writeFileSync(filePath, content, "utf-8")
  }
}
