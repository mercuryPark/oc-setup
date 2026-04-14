import { tool } from "@opencode-ai/plugin"
import { homedir } from "os"
import type { UserProfile } from "../types"
import { writeGlobalConfig, writeProjectConfig } from "../core/config-generator.js"
import { generateAgentsMD, writeAgentsMD } from "../core/agents-md-generator.js"
import { generateCommands, writeCommands } from "../core/command-generator.js"
import { generateAgents, writeAgents } from "../core/agent-generator.js"
import { generateSkills, writeSkills } from "../core/skill-generator.js"
import { generateEnvExample, writeEnvExample } from "../core/env-generator.js"

const { schema } = tool

export const setupInit: ReturnType<typeof tool> = tool({
  description: "Initialize OpenCode environment with custom profile. Accepts a UserProfile JSON string.",
  args: {
    profile: schema.string().describe("UserProfile as JSON string"),
  },
  async execute(args, context) {
    let profile: UserProfile

    try {
      profile = JSON.parse(args.profile) as UserProfile
    } catch {
      return "❌ Invalid profile JSON. Please provide a valid UserProfile object."
    }

    const projectDir = context.directory
    const homeDir = homedir()
    const generatedFiles: string[] = []

    try {
      writeGlobalConfig(profile, homeDir)
      generatedFiles.push(`${homeDir}/.config/opencode/opencode.json`)

      writeProjectConfig(profile, projectDir)
      generatedFiles.push(`${projectDir}/opencode.json`)

      const agentsMD = generateAgentsMD(profile)
      writeAgentsMD(agentsMD, projectDir)
      generatedFiles.push(`${projectDir}/AGENTS.md`)

      const commands = generateCommands()
      writeCommands(commands, projectDir)
      generatedFiles.push(`${projectDir}/.opencode/commands/`)

      const agents = generateAgents()
      writeAgents(agents, projectDir)
      generatedFiles.push(`${projectDir}/.opencode/agents/`)

      const skills = generateSkills(profile)
      writeSkills(skills, projectDir)
      generatedFiles.push(`${projectDir}/.opencode/skills/`)

      const envContent = generateEnvExample(profile)
      writeEnvExample(envContent, projectDir)
      generatedFiles.push(`${projectDir}/.env.example`)

      const filesList = generatedFiles.map((f) => `  • ${f}`).join("\n")

      return `✅ OpenCode environment initialized successfully!

Generated files:
${filesList}

Next steps:
1. Copy .env.example to .env and set your API keys
2. Restart OpenCode or run 'opencode --reload'
3. Start using OpenCode in your project!`
    } catch (error) {
      return `❌ Failed to initialize environment:
${error instanceof Error ? error.message : String(error)}

Generated files so far:
${generatedFiles.map((f) => `  • ${f}`).join("\n")}`
    }
  },
})
