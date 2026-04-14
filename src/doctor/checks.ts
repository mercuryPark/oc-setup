import { join } from "path"
import { existsSync, readFileSync } from "fs"
import { execSync } from "child_process"

export interface CheckResult {
  name: string
  status: "pass" | "warn" | "fail"
  message: string
  fix?: string
}

function execCommand(cmd: string[]): { exitCode: number; stdout: string } {
  try {
    const stdout = execSync(cmd.join(" "), { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] })
    return { exitCode: 0, stdout: stdout.trim() }
  } catch (e) {
    const err = e as { status?: number }
    return { exitCode: err.status || 1, stdout: "" }
  }
}

function checkOpenCode(): CheckResult {
  const whichResult = execCommand(["which", "opencode"])
  if (whichResult.exitCode === 0) {
    const versionResult = execCommand(["opencode", "--version"])
    const version = versionResult.stdout || "unknown"
    return { name: "OpenCode", status: "pass", message: `v${version}` }
  }

  const npmResult = execCommand(["npm", "list", "-g", "opencode-ai"])
  if (npmResult.exitCode === 0) {
    return { name: "OpenCode", status: "warn", message: "OpenCode is installed via npm", fix: "Install OpenCode from https://opencode.ai or use npm install -g opencode-ai" }
  }

  return { name: "OpenCode", status: "fail", message: "OpenCode not found", fix: "Install OpenCode from https://opencode.ai" }
}

function checkBun(): CheckResult {
  const result = execCommand(["bun", "--version"])
  if (result.exitCode === 0) {
    const version = result.stdout || "unknown"
    return { name: "Bun", status: "pass", message: `v${version}` }
  }

  const nodeResult = execCommand(["node", "--version"])
  if (nodeResult.exitCode === 0) {
    return { name: "Bun", status: "warn", message: "Bun not found, Node.js detected", fix: "Install Bun: https://bun.sh" }
  }

  return { name: "Bun", status: "fail", message: "Bun not found", fix: "Install Bun: https://bun.sh" }
}

function checkApiKeys(): CheckResult {
  const keys = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY"]
  const found: string[] = []
  const missing: string[] = []

  for (const key of keys) {
    if (process.env[key]) {
      found.push(key)
    } else {
      missing.push(key)
    }
  }

  if (found.length === 0) {
    return { name: "API Keys", status: "fail", message: "No API keys configured", fix: "Set at least one API key: ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY" }
  }

  return { name: "API Keys", status: "pass", message: `Configured: ${found.join(", ")}` }
}

function checkAuthFile(): CheckResult {
  const authPath = join(process.env.HOME || "~", ".local/share/opencode/auth.json")
  const expandedPath = authPath.replace("~", process.env.HOME || "")

  if (existsSync(expandedPath)) {
    return { name: "Auth File", status: "pass", message: "auth.json exists" }
  }

  return { name: "Auth File", status: "warn", message: "auth.json not found", fix: "Run /connect in OpenCode to authenticate with providers" }
}

function checkConfig(): CheckResult {
  const configPath = join(process.env.HOME || "~", ".config/opencode/opencode.json")
  const expandedPath = configPath.replace("~", process.env.HOME || "")

  if (!existsSync(expandedPath)) {
    return { name: "Global Config", status: "warn", message: "Global opencode.json not found", fix: "Run 'opencode-setup init' or configure OpenCode manually" }
  }

  try {
    const content = readFileSync(expandedPath, "utf-8")
    JSON.parse(content)
    return { name: "Global Config", status: "pass", message: "Valid JSON configuration" }
  } catch {
    return { name: "Global Config", status: "fail", message: "Invalid JSON in opencode.json", fix: "Check ~/.config/opencode/opencode.json for syntax errors" }
  }
}

function checkProjectConfig(directory: string): CheckResult {
  const configPath = join(directory, "opencode.json")

  if (!existsSync(configPath)) {
    return { name: "Project Config", status: "warn", message: "No project opencode.json", fix: "Run 'opencode-setup init' or create opencode.json in project root" }
  }

  try {
    const content = readFileSync(configPath, "utf-8")
    JSON.parse(content)
    return { name: "Project Config", status: "pass", message: "Valid project configuration" }
  } catch {
    return { name: "Project Config", status: "fail", message: "Invalid JSON in project opencode.json", fix: "Check opencode.json for syntax errors" }
  }
}

function checkAgentsMD(directory: string): CheckResult {
  const agentsPath = join(directory, "AGENTS.md")

  if (!existsSync(agentsPath)) {
    return { name: "AGENTS.md", status: "warn", message: "AGENTS.md not found", fix: "Run 'opencode-setup init' or create AGENTS.md with project guidelines" }
  }

  const content = readFileSync(agentsPath, "utf-8")
  if (content.trim().length === 0) {
    return { name: "AGENTS.md", status: "warn", message: "AGENTS.md is empty", fix: "Add project-specific guidelines to AGENTS.md" }
  }

  return { name: "AGENTS.md", status: "pass", message: "AGENTS.md exists" }
}

function checkLSP(): CheckResult {
  const lspServers = ["typescript-language-server", "gopls", "rust-analyzer", "pyright"]

  for (const lsp of lspServers) {
    const result = execCommand(["which", lsp])
    if (result.exitCode === 0) {
      return { name: "LSP", status: "pass", message: `${lsp} found` }
    }
  }

  return { name: "LSP", status: "warn", message: "No LSP servers found", fix: "Install LSP servers: typescript-language-server, gopls, rust-analyzer, or pyright" }
}

function checkPlugins(): CheckResult {
  const configPath = join(process.env.HOME || "~", ".config/opencode/opencode.json")
  const expandedPath = configPath.replace("~", process.env.HOME || "")

  if (!existsSync(expandedPath)) {
    return { name: "Plugins", status: "warn", message: "Cannot check plugins - no global config" }
  }

  try {
    const content = readFileSync(expandedPath, "utf-8")
    const config = JSON.parse(content)
    const plugins = config.plugin || []

    if (plugins.length === 0) {
      return { name: "Plugins", status: "warn", message: "No plugins configured", fix: "Consider installing oh-my-opencode for enhanced multi-agent orchestration" }
    }

    return { name: "Plugins", status: "pass", message: `Configured: ${plugins.join(", ")}` }
  } catch {
    return { name: "Plugins", status: "warn", message: "Could not read plugin config" }
  }
}

export async function runAllChecks(directory: string): Promise<CheckResult[]> {
  return [
    checkOpenCode(),
    checkBun(),
    checkApiKeys(),
    checkAuthFile(),
    checkConfig(),
    checkProjectConfig(directory),
    checkAgentsMD(directory),
    checkLSP(),
    checkPlugins(),
  ]
}
