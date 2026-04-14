import { tool } from "@opencode-ai/plugin"
import { runAllChecks } from "../doctor/checks.js"
import { formatReport } from "../doctor/reporter.js"

export const setupDoctor = tool({
  description: "Diagnose OpenCode environment. Checks installation, API keys, authentication, config files, LSP servers, and plugins.",
  args: {},
  async execute(_args, context) {
    const results = await runAllChecks(context.directory)
    return formatReport(results)
  },
})
