import { tool } from "@opencode-ai/plugin"
import { runValidation } from "../validator/config-validator.js"

export const setupValidate = tool({
  description: "Validate OpenCode configuration files. Checks opencode.json schema and AGENTS.md structure.",
  args: {},
  async execute(_args, context) {
    return runValidation(context.directory)
  },
})
