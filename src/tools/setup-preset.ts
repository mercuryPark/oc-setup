import { tool } from "@opencode-ai/plugin"
import { listPresets, applyPreset } from "../preset/registry"

const { schema } = tool

export const setupPresetList = tool({
  description: "Available presets for OpenCode setup.",
  args: {},
  async execute() {
    return listPresets()
  },
})

export const setupPresetApply: ReturnType<typeof tool> = tool({
  description: "Apply a preset configuration to the project.",
  args: {
    name: schema.string().describe("Preset name (e.g., 'budget', 'balanced', 'frontend-ts', 'backend-go')"),
  },
  async execute(args, context) {
    const result = await applyPreset(args.name, context.directory)

    if (!result.success) {
      return `❌ Failed to apply preset '${args.name}'.\n\n${result.warnings.join("\n")}`
    }

    const filesList = result.files.map((f) => `  • ${f}`).join("\n")
    return `✅ Preset '${args.name}' applied successfully!\n\nGenerated files:\n${filesList}${result.warnings.length > 0 ? `\n\nWarnings:\n${result.warnings.join("\n")}` : ""}`
  },
})
