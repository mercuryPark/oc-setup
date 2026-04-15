import { describe, test, expect, vi, beforeEach } from "vitest"
import { runAllChecks } from "../../src/doctor/checks"
import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"

describe("runAllChecks", () => {
  test("should return array of check results", async () => {
    const results = await runAllChecks("/tmp")
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  test("each result should have required fields", async () => {
    const results = await runAllChecks("/tmp")
    for (const result of results) {
      expect(result).toHaveProperty("name")
      expect(result).toHaveProperty("status")
      expect(["pass", "warn", "fail"]).toContain(result.status)
      expect(result).toHaveProperty("message")
    }
  })

  test("should include all expected check names", async () => {
    const results = await runAllChecks("/tmp")
    const checkNames = results.map((r) => r.name)

    expect(checkNames).toContain("OpenCode")
    expect(checkNames).toContain("Bun")
    expect(checkNames).toContain("API Keys")
    expect(checkNames).toContain("Auth File")
    expect(checkNames).toContain("Global Config")
    expect(checkNames).toContain("Project Config")
    expect(checkNames).toContain("AGENTS.md")
    expect(checkNames).toContain("LSP")
    expect(checkNames).toContain("Plugins")
  })

  test("should handle missing project directory gracefully", async () => {
    const nonExistentDir = "/this/path/does/not/exist/at/all"
    const results = await runAllChecks(nonExistentDir)

    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(9)

    const projectConfigResult = results.find((r) => r.name === "Project Config")
    const agentsResult = results.find((r) => r.name === "AGENTS.md")

    expect(projectConfigResult).toBeDefined()
    expect(agentsResult).toBeDefined()
    expect(["warn", "fail"]).toContain(projectConfigResult!.status)
    expect(["warn", "fail"]).toContain(agentsResult!.status)
  })

  test("should return exactly 9 check results", async () => {
    const results = await runAllChecks("/tmp")
    expect(results.length).toBe(9)
  })

  test("status field should only allow pass, warn, or fail", async () => {
    const results = await runAllChecks("/tmp")
    const validStatuses = ["pass", "warn", "fail"]

    for (const result of results) {
      expect(validStatuses).toContain(result.status)
    }
  })

  test("message field should be a non-empty string", async () => {
    const results = await runAllChecks("/tmp")

    for (const result of results) {
      expect(typeof result.message).toBe("string")
      expect(result.message.length).toBeGreaterThan(0)
    }
  })

  test("check results should have consistent ordering", async () => {
    const results1 = await runAllChecks("/tmp")
    const results2 = await runAllChecks("/tmp")

    const names1 = results1.map((r) => r.name)
    const names2 = results2.map((r) => r.name)

    expect(names1).toEqual(names2)
  })

  test("API Keys check should handle missing environment variables", async () => {
    const results = await runAllChecks("/tmp")
    const apiKeysResult = results.find((r) => r.name === "API Keys")

    expect(apiKeysResult).toBeDefined()
    expect(["pass", "warn", "fail"]).toContain(apiKeysResult!.status)
  })

  test("LSP check should return pass if any LSP server is found", async () => {
    const results = await runAllChecks("/tmp")
    const lspResult = results.find((r) => r.name === "LSP")

    expect(lspResult).toBeDefined()
    expect(["pass", "warn"]).toContain(lspResult!.status)
  })
})

describe("CheckResult interface", () => {
  test("should match CheckResult interface structure", async () => {
    const results = await runAllChecks("/tmp")
    const sampleResult = results[0]

    expect("name" in sampleResult).toBe(true)
    expect("status" in sampleResult).toBe(true)
    expect("message" in sampleResult).toBe(true)

    expect(typeof sampleResult.name).toBe("string")
    expect(typeof sampleResult.status).toBe("string")
    expect(typeof sampleResult.message).toBe("string")
  })
})
