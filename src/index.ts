import type { Plugin } from "@opencode-ai/plugin"
import { setupInit } from "./tools/setup-init.js"
import { setupPresetList, setupPresetApply } from "./tools/setup-preset.js"
import { setupMigrate } from "./tools/setup-migrate.js"
import { setupValidate } from "./tools/setup-validate.js"
import { setupDoctor } from "./tools/setup-doctor.js"

export const OcSetupPlugin: Plugin = async (ctx) => {
  // ctx.directory - current project directory
  // ctx.$ - BunShell for shell commands
  // ctx.client - OpenCode SDK client
  // ctx.worktree - git worktree path
  void ctx // suppress unused warning
  return {
    tool: {
      setup_init: setupInit,
      setup_preset_list: setupPresetList,
      setup_preset_apply: setupPresetApply,
      setup_migrate: setupMigrate,
      setup_validate: setupValidate,
      setup_doctor: setupDoctor,
    },
  }
}
