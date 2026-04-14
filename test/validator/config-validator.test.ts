import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { runValidation } from "../../src/validator/config-validator"
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs"
import { join } from "path"

const testDir = "/tmp/oc-setup-test-validator"

describe("runValidation", () => {
  beforeAll(() => {
    // Clean up in case previous test run failed
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  test("should pass with valid config", async () => {
    const config = {
      $schema: "https://opencode.ai/config.json",
      model: "anthropic/claude-sonnet-4-5",
      permission: { edit: "allow" }
    }
    writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config))

    // Create AGENTS.md with proper sections
    const agentsContent = `# AGENTS.md

## Core Protocol
Some content here.
`
    writeFileSync(join(testDir, "AGENTS.md"), agentsContent)

    const result = await runValidation(testDir)
    expect(result).toContain("All checks passed")
    expect(result).toContain("✓")
  })

  test("should produce error with invalid JSON", async () => {
    // Write invalid JSON
    writeFileSync(join(testDir, "opencode.json"), '{ invalid json content }')

    // Create AGENTS.md
    writeFileSync(join(testDir, "AGENTS.md"), "# AGENTS\n\n## Section\n")

    const result = await runValidation(testDir)
    expect(result).toContain("Invalid JSON")
    expect(result).toContain("✗")
  })

  test("should accept config without $schema (project config)", async () => {
    const config = {
      model: "anthropic/claude-sonnet-4-5",
      permission: { edit: "allow" }
    }
    writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config))

    // Create AGENTS.md with proper section header (## followed by space)
    writeFileSync(join(testDir, "AGENTS.md"), "# AGENTS\n\n## Core\ncontent\n")

    const result = await runValidation(testDir)
    expect(result).toContain("All checks passed")
  })

  test("should produce error for invalid permission values", async () => {
    const config = {
      $schema: "https://opencode.ai/config.json",
      permission: { edit: "invalid-value" }
    }
    writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config))

    // Create AGENTS.md
    writeFileSync(join(testDir, "AGENTS.md"), "# AGENTS\n\n## Section\n")

    const result = await runValidation(testDir)
    expect(result).toContain("Invalid permission.edit value")
    expect(result).toContain("✗")
  })

  test("should handle non-existent config files gracefully", async () => {
    // Clean directory
    rmSync(join(testDir, "opencode.json"), { force: true })
    rmSync(join(testDir, "AGENTS.md"), { force: true })

    const result = await runValidation(testDir)
    // Should still produce warning about missing AGENTS.md
    expect(result).toContain("AGENTS.md not found")
    expect(result).toContain("Summary")
    expect(result).toContain("warnings")
  })

  test("should produce error for empty AGENTS.md", async () => {
    const config = {
      $schema: "https://opencode.ai/config.json",
      permission: { edit: "allow" }
    }
    writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config))

    // Create empty AGENTS.md
    writeFileSync(join(testDir, "AGENTS.md"), "")

    const result = await runValidation(testDir)
    expect(result).toContain("AGENTS.md is empty")
    expect(result).toContain("✗")
  })

  test("should produce warning for AGENTS.md without section headers", async () => {
    const config = {
      $schema: "https://opencode.ai/config.json",
      permission: { edit: "allow" }
    }
    writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config))

    // AGENTS.md without ## headers
    writeFileSync(join(testDir, "AGENTS.md"), "Some content without headers")

    const result = await runValidation(testDir)
    expect(result).toContain("no section headers")
    expect(result).toContain("⚠")
  })

  test("should accept all valid permission values", async () => {
    const config = {
      $schema: "https://opencode.ai/config.json",
      permission: {
        edit: "allow",
        webfetch: "ask"
      }
    }
    writeFileSync(join(testDir, "opencode.json"), JSON.stringify(config))
    writeFileSync(join(testDir, "AGENTS.md"), "# AGENTS\n\n## Core\ncontent\n")

    const result = await runValidation(testDir)
    expect(result).toContain("All checks passed")
  })
})