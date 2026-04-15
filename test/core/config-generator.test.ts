import { describe, test, expect, beforeEach, afterEach } from "vitest"
import { mkdirSync, rmSync, existsSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  generateGlobalConfig,
  generateProjectConfig,
  writeConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from "../../src/core/config-generator"
import type { UserProfile, OpenCodeConfig } from "../../src/types"

// Test temp directory
const testDir = join(dirname(fileURLToPath(import.meta.url)), "test-temp")

beforeEach(() => {
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true })
  }
})

afterEach(() => {
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true })
  }
})

// Test profiles for different budget tiers
const freeProfile: UserProfile = {
  experienceLevel: "beginner",
  previousTool: "none",
  providers: ["anthropic"],
  budget: "free",
  projectLanguage: "typescript",
  projectFramework: "nextjs",
  testRunner: "vitest",
  linter: "biome",
  projectScale: "single",
  mcpServers: [],
  plugins: ["oh-my-opencode"],
  permissionLevel: "safe",
}

const lowProfile: UserProfile = {
  ...freeProfile,
  budget: "low",
}

const midProfile: UserProfile = {
  ...freeProfile,
  budget: "mid",
  providers: ["anthropic", "google"],
}

const highProfile: UserProfile = {
  ...freeProfile,
  budget: "high",
  providers: ["anthropic"],
  permissionLevel: "auto",
}

// Test profile for permission levels
const safeProfile: UserProfile = {
  ...freeProfile,
  permissionLevel: "safe",
}

const balancedProfile: UserProfile = {
  ...freeProfile,
  permissionLevel: "balanced",
}

const autoProfile: UserProfile = {
  ...freeProfile,
  permissionLevel: "auto",
}

// Test profile with MCP servers
const mcpProfile: UserProfile = {
  ...freeProfile,
  mcpServers: [
    { name: "filesystem", config: { url: "http://localhost:3000" } },
    { name: "puppeteer", config: {} },
  ],
}

// Test profile for monorepo
const monorepoProfile: UserProfile = {
  ...freeProfile,
  projectScale: "monorepo",
}

describe("generateGlobalConfig", () => {
  test("should include $schema", () => {
    const config = generateGlobalConfig(freeProfile)
    expect(config.$schema).toBe("https://opencode.ai/config.json")
  })

  test("should include theme and autoupdate", () => {
    const config = generateGlobalConfig(freeProfile)
    expect(config.theme).toBe("opencode")
    expect(config.autoupdate).toBe(true)
  })

  test("should include plugins from profile", () => {
    const config = generateGlobalConfig(freeProfile)
    expect(config.plugin).toEqual(["oh-my-opencode"])
  })

  test("should include provider with apiKey for free budget", () => {
    const config = generateGlobalConfig(freeProfile)
    expect(config.provider).toBeDefined()
    expect(config.provider?.anthropic).toBeDefined()
    expect(config.provider?.anthropic?.options?.apiKey).toBe("{env:ANTHROPIC_API_KEY}")
  })

  test("should include multiple providers for mid budget", () => {
    const config = generateGlobalConfig(midProfile)
    expect(config.provider?.anthropic).toBeDefined()
    expect(config.provider?.google).toBeDefined()
  })

  test("should use big-pickle for free budget", () => {
    const config = generateGlobalConfig(freeProfile)
    expect(config.model).toBe("opencode/big-pickle")
  })

  test("should use minimax for low budget", () => {
    const config = generateGlobalConfig(lowProfile)
    expect(config.model).toBe("minimax/minimax-m2.5")
  })

  test("should use sonnet + flash for mid budget", () => {
    const config = generateGlobalConfig(midProfile)
    expect(config.model).toBe("anthropic/claude-sonnet-4-5")
  })

  test("should use sonnet + opus for high budget", () => {
    const config = generateGlobalConfig(highProfile)
    expect(config.model).toBe("anthropic/claude-sonnet-4-5")
  })
})

describe("generateProjectConfig", () => {
  test("should include $schema", () => {
    const config = generateProjectConfig(freeProfile)
    expect(config.$schema).toBe("https://opencode.ai/config.json")
  })

  test("should include permission for safe level", () => {
    const config = generateProjectConfig(safeProfile)
    expect(config.permission).toBeDefined()
    expect(config.permission?.edit).toBe("ask")
    expect(config.permission?.bash).toEqual({ "*": "ask" })
  })

  test("should include permission for balanced level", () => {
    const config = generateProjectConfig(balancedProfile)
    expect(config.permission).toBeDefined()
    expect(config.permission?.edit).toBe("allow")
    expect(config.permission?.bash?.["npm *"]).toBe("allow")
    expect(config.permission?.bash?.["git *"]).toBe("allow")
  })

  test("should include permission for auto level", () => {
    const config = generateProjectConfig(autoProfile)
    expect(config.permission).toBeDefined()
    expect(config.permission?.edit).toBe("allow")
    expect(config.permission?.bash).toEqual({ "*": "allow" })
  })

  test("should include agent config with model for build", () => {
    const config = generateProjectConfig(midProfile)
    expect(config.agent).toBeDefined()
    expect(config.agent?.build?.model).toBe("anthropic/claude-sonnet-4-5")
    expect(config.agent?.plan?.model).toBe("google/gemini-2.5-flash")
  })

  test("should include mcp servers when provided", () => {
    const config = generateProjectConfig(mcpProfile)
    expect(config.mcp).toBeDefined()
    expect(config.mcp?.filesystem).toBeDefined()
    expect(config.mcp?.filesystem?.type).toBe("stdio")
    expect(config.mcp?.puppeteer).toBeDefined()
  })

  test("should include lsp config for typescript", () => {
    const config = generateProjectConfig(freeProfile)
    expect(config.lsp).toBeDefined()
    expect(config.lsp?.typescript?.command).toBe("typescript-language-server")
  })

  test("should include lsp config for go", () => {
    const config = generateProjectConfig({ ...freeProfile, projectLanguage: "go" })
    expect(config.lsp?.go?.command).toBe("gopls")
  })

  test("should include lsp config for python", () => {
    const config = generateProjectConfig({ ...freeProfile, projectLanguage: "python" })
    expect(config.lsp?.python?.command).toBe("pyright")
  })

  test("should not include lsp for unknown language", () => {
    const config = generateProjectConfig({ ...freeProfile, projectLanguage: "unknown-lang" })
    expect(config.lsp).toBeUndefined()
  })

  test("should include instructions for monorepo scale", () => {
    const config = generateProjectConfig(monorepoProfile)
    expect(config.instructions).toBeDefined()
    expect(config.instructions).toContain("packages/*/AGENTS.md")
  })

  test("should not include instructions for single scale", () => {
    const config = generateProjectConfig(freeProfile)
    expect(config.instructions).toBeUndefined()
  })
})

describe("writeConfig", () => {
  test("should create directory if not exists", () => {
    const config = generateGlobalConfig(freeProfile)
    const filePath = join(testDir, "nested", "dir", "opencode.json")

    writeConfig(config, filePath)

    expect(existsSync(filePath)).toBe(true)
  })

  test("should write valid JSON to file", () => {
    const config = generateGlobalConfig(freeProfile)
    const filePath = join(testDir, "opencode.json")

    writeConfig(config, filePath)

    const content = require("fs").readFileSync(filePath, "utf-8")
    const parsed = JSON.parse(content)
    expect(parsed.$schema).toBe("https://opencode.ai/config.json")
  })

  test("should create backup when file exists", () => {
    const config1 = generateGlobalConfig(freeProfile)
    const config2 = generateProjectConfig(freeProfile)
    const filePath = join(testDir, "opencode.json")

    // Write first time
    writeConfig(config1, filePath)
    expect(existsSync(filePath)).toBe(true)

    // Write second time - should create backup with timestamp
    writeConfig(config2, filePath)
    const files = readdirSync(testDir)
    const hasBackup = files.some(f => f.startsWith("opencode.json.bak."))
    expect(hasBackup).toBe(true)
  })
})

describe("writeGlobalConfig", () => {
  test("should write to correct global path", () => {
    writeGlobalConfig(freeProfile, testDir)

    const expectedPath = join(testDir, ".config", "opencode", "opencode.json")
    expect(existsSync(expectedPath)).toBe(true)
  })

  test("should contain model in global config", () => {
    writeGlobalConfig(midProfile, testDir)

    const expectedPath = join(testDir, ".config", "opencode", "opencode.json")
    const content = require("fs").readFileSync(expectedPath, "utf-8")
    const parsed = JSON.parse(content)
    expect(parsed.model).toBeDefined()
  })
})

describe("writeProjectConfig", () => {
  test("should write to project root", () => {
    writeProjectConfig(freeProfile, testDir)

    const expectedPath = join(testDir, "opencode.json")
    expect(existsSync(expectedPath)).toBe(true)
  })

  test("should contain permission in project config", () => {
    writeProjectConfig(balancedProfile, testDir)

    const expectedPath = join(testDir, "opencode.json")
    const content = require("fs").readFileSync(expectedPath, "utf-8")
    const parsed = JSON.parse(content)
    expect(parsed.permission).toBeDefined()
  })

  test("should contain agent config in project config", () => {
    writeProjectConfig(highProfile, testDir)

    const expectedPath = join(testDir, "opencode.json")
    const content = require("fs").readFileSync(expectedPath, "utf-8")
    const parsed = JSON.parse(content)
    expect(parsed.agent).toBeDefined()
  })
})