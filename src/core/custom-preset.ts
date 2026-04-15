import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { homedir } from "os"
import type { UserProfile } from "../types"

const CUSTOM_PRESETS_DIR = join(homedir(), ".config/opencode/presets")

export interface CustomPreset {
  name: string
  description: string
  profile: Partial<UserProfile>
  createdAt: string
  updatedAt: string
}

export function saveCustomPreset(name: string, description: string, profile: Partial<UserProfile>): void {
  if (!existsSync(CUSTOM_PRESETS_DIR)) {
    mkdirSync(CUSTOM_PRESETS_DIR, { recursive: true })
  }

  const now = new Date().toISOString()
  const preset: CustomPreset = {
    name,
    description,
    profile,
    createdAt: now,
    updatedAt: now,
  }

  const presetPath = join(CUSTOM_PRESETS_DIR, `${name}.json`)
  writeFileSync(presetPath, JSON.stringify(preset, null, 2) + "\n")
}

export function loadCustomPreset(name: string): CustomPreset | undefined {
  const presetPath = join(CUSTOM_PRESETS_DIR, `${name}.json`)
  
  if (!existsSync(presetPath)) {
    return undefined
  }

  try {
    const content = readFileSync(presetPath, "utf-8")
    return JSON.parse(content) as CustomPreset
  } catch {
    return undefined
  }
}

export function listCustomPresets(): CustomPreset[] {
  if (!existsSync(CUSTOM_PRESETS_DIR)) {
    return []
  }

  const { readdirSync } = require("fs")
  const presets: CustomPreset[] = []
  
  try {
    const files = readdirSync(CUSTOM_PRESETS_DIR).filter((f: string) => f.endsWith(".json"))
    
    for (const file of files) {
      try {
        const content = readFileSync(join(CUSTOM_PRESETS_DIR, file), "utf-8")
        const preset = JSON.parse(content) as CustomPreset
        presets.push(preset)
      } catch {
      }
    }
  } catch {
    return []
  }

  return presets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function deleteCustomPreset(name: string): boolean {
  const presetPath = join(CUSTOM_PRESETS_DIR, `${name}.json`)
  
  if (!existsSync(presetPath)) {
    return false
  }

  try {
    import("fs").then(({ unlinkSync }) => {
      unlinkSync(presetPath)
    })
    return true
  } catch {
    return false
  }
}

export function saveCurrentAsPreset(name: string, description: string, profile: UserProfile): void {
  const presetProfile: Partial<UserProfile> = {
    providers: profile.providers,
    budget: profile.budget,
    projectLanguage: profile.projectLanguage,
    projectFramework: profile.projectFramework,
    testRunner: profile.testRunner,
    linter: profile.linter,
    permissionLevel: profile.permissionLevel,
    mcpServers: profile.mcpServers,
    plugins: profile.plugins,
  }

  saveCustomPreset(name, description, presetProfile)
}

export function applyCustomPresetToProfile(presetName: string, baseProfile: UserProfile): UserProfile | undefined {
  const preset = loadCustomPreset(presetName)
  if (!preset) {
    return undefined
  }

  return {
    ...baseProfile,
    ...preset.profile,
  }
}
