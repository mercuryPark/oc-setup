import type { Plugin } from "@opencode-ai/plugin"
import { setupInit } from "./tools/setup-init"
import { setupPresetList, setupPresetApply } from "./tools/setup-preset"
import { setupMigrate } from "./tools/setup-migrate"
import { setupValidate } from "./tools/setup-validate"
import { setupDoctor } from "./tools/setup-doctor"

export const OcSetupPlugin: Plugin = async () => {
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