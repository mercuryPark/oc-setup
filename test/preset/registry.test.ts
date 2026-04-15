import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { 
  listPresets, 
  getModelPreset, 
  getStackPreset, 
  applyPreset,
  MODEL_PRESETS, 
  STACK_PRESETS
} from "../../src/preset/registry"
import { mkdirSync, rmSync, existsSync } from "fs"
import { join } from "path"

const TEST_MODEL_PRESETS = ["budget", "balanced", "power", "minimax", "google-only"]
const TEST_STACK_PRESETS = ["frontend-ts", "backend-go", "backend-python", "fullstack"]

let tempDir: string

beforeEach(() => {
  tempDir = join("/tmp", `oc-setup-test-${Date.now()}`)
  mkdirSync(tempDir, { recursive: true })
})

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true })
  }
})

describe("MODEL_PRESETS", () => {
  test("should have 5 presets", () => {
    expect(MODEL_PRESETS).toHaveLength(5)
  })

  test("should contain budget preset", () => {
    const preset = MODEL_PRESETS.find(p => p.name === "budget")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("budget")
  })

  test("should contain balanced preset", () => {
    const preset = MODEL_PRESETS.find(p => p.name === "balanced")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("balanced")
  })

  test("should contain power preset", () => {
    const preset = MODEL_PRESETS.find(p => p.name === "power")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("power")
  })

  test("should contain minimax preset", () => {
    const preset = MODEL_PRESETS.find(p => p.name === "minimax")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("minimax")
  })

  test("should contain google-only preset", () => {
    const preset = MODEL_PRESETS.find(p => p.name === "google-only")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("google-only")
  })
})

describe("STACK_PRESETS", () => {
  test("should have 4 presets", () => {
    expect(STACK_PRESETS).toHaveLength(4)
  })

  test("should contain frontend-ts preset", () => {
    const preset = STACK_PRESETS.find(p => p.name === "frontend-ts")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("frontend-ts")
  })

  test("should contain backend-go preset", () => {
    const preset = STACK_PRESETS.find(p => p.name === "backend-go")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("backend-go")
  })

  test("should contain backend-python preset", () => {
    const preset = STACK_PRESETS.find(p => p.name === "backend-python")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("backend-python")
  })

  test("should contain fullstack preset", () => {
    const preset = STACK_PRESETS.find(p => p.name === "fullstack")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("fullstack")
  })
})

describe("getModelPreset", () => {
  test("should find budget preset", () => {
    const preset = getModelPreset("budget")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("budget")
  })

  test("should find balanced preset", () => {
    const preset = getModelPreset("balanced")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("balanced")
  })

  test("should find power preset", () => {
    const preset = getModelPreset("power")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("power")
  })

  test("should find minimax preset", () => {
    const preset = getModelPreset("minimax")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("minimax")
  })

  test("should find google-only preset", () => {
    const preset = getModelPreset("google-only")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("google-only")
  })

  test("should return undefined for unknown preset", () => {
    const preset = getModelPreset("unknown")
    expect(preset).toBeUndefined()
  })

  test("should return undefined for empty string", () => {
    const preset = getModelPreset("")
    expect(preset).toBeUndefined()
  })
})

describe("getStackPreset", () => {
  test("should find frontend-ts preset", () => {
    const preset = getStackPreset("frontend-ts")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("frontend-ts")
  })

  test("should find backend-go preset", () => {
    const preset = getStackPreset("backend-go")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("backend-go")
  })

  test("should find backend-python preset", () => {
    const preset = getStackPreset("backend-python")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("backend-python")
  })

  test("should find fullstack preset", () => {
    const preset = getStackPreset("fullstack")
    expect(preset).toBeDefined()
    expect(preset?.name).toBe("fullstack")
  })

  test("should return undefined for unknown preset", () => {
    const preset = getStackPreset("unknown")
    expect(preset).toBeUndefined()
  })

  test("should return undefined for empty string", () => {
    const preset = getStackPreset("")
    expect(preset).toBeUndefined()
  })
})

describe("listPresets", () => {
  test("should return string containing preset names", () => {
    const result = listPresets()
    expect(typeof result).toBe("string")
    
    for (const name of TEST_MODEL_PRESETS) {
      expect(result).toContain(name)
    }
  })

  test("should contain model presets section", () => {
    const result = listPresets()
    expect(result).toContain("## Model Presets")
  })

  test("should contain stack presets section", () => {
    const result = listPresets()
    expect(result).toContain("## Stack Presets")
  })

  test("should return non-empty string", () => {
    const result = listPresets()
    expect(result.length).toBeGreaterThan(0)
  })

  test("should contain markdown table format", () => {
    const result = listPresets()
    expect(result).toContain("|")
  })
})

describe("applyPreset", () => {
  test("should apply budget model preset", async () => {
    const result = await applyPreset("budget", tempDir)
    
    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
    
    const configPath = join(tempDir, "opencode.json")
    expect(existsSync(configPath)).toBe(true)
  })

  test("should apply balanced model preset", async () => {
    const result = await applyPreset("balanced", tempDir)
    
    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
  })

  test("should apply power model preset", async () => {
    const result = await applyPreset("power", tempDir)
    
    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
  })

  test("should apply minimax model preset", async () => {
    const result = await applyPreset("minimax", tempDir)
    
    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
  })

  test("should apply google-only model preset", async () => {
    const result = await applyPreset("google-only", tempDir)
    
    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
  })

  test("should fail for unknown preset", async () => {
    const result = await applyPreset("nonexistent", tempDir)
    
    expect(result.success).toBe(false)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain("Unknown preset")
  })

  test("should merge with existing config", async () => {
    await applyPreset("budget", tempDir)
    const result = await applyPreset("power", tempDir)
    
    expect(result.success).toBe(true)
  })

  test("should apply stack preset", async () => {
    const result = await applyPreset("frontend-ts", tempDir, {
      projectName: "Test Project",
      testRunner: "vitest",
      linter: "biome"
    })
    
    expect(result.success).toBe(true)
    expect(existsSync(join(tempDir, ".opencode"))).toBe(true)
  })

  test("should apply stack preset with custom options", async () => {
    const result = await applyPreset("backend-go", tempDir, {
      projectName: "Go Backend",
      testRunner: "go test",
      linter: "golangci-lint"
    })
    
    expect(result.success).toBe(true)
  })

  test("should fail with empty preset name", async () => {
    const result = await applyPreset("", tempDir)
    
    expect(result.success).toBe(false)
  })

  test("should apply backend-go preset", async () => {
    const result = await applyPreset("backend-go", tempDir)
    
    expect(result.success).toBe(true)
  })

  test("should apply backend-python preset", async () => {
    const result = await applyPreset("backend-python", tempDir)
    
    expect(result.success).toBe(true)
  })

  test("should apply fullstack preset", async () => {
    const result = await applyPreset("fullstack", tempDir)
    
    expect(result.success).toBe(true)
  })
})
