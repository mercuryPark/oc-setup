import { describe, it, expect, beforeEach } from "vitest"
import { readFileSafe, writeFileSafe, backupFile, copyDirectory, detectTool, parseJSON, parseYAML } from "../../src/migrate/common.js"
import { join } from "path"
import { existsSync, mkdirSync, writeFileSync, rmSync } from "fs"

const TEST_DIR = join(process.cwd(), "test-temp")

describe("migrate/common", () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true })
  })

  it("readFileSafe returns null for non-existent file", () => {
    const result = readFileSafe("/non/existent/path.txt")
    expect(result).toBeNull()
  })

  it("readFileSafe returns content for existing file", () => {
    const testPath = join(TEST_DIR, "read-test.txt")
    writeFileSync(testPath, "test content")
    const result = readFileSafe(testPath)
    expect(result).toBe("test content")
    rmSync(testPath)
  })

  it("parseJSON parses valid JSON", () => {
    const result = parseJSON<{ key: string }>('{"key": "value"}')
    expect(result).toEqual({ key: "value" })
  })

  it("parseJSON returns null for invalid JSON", () => {
    const result = parseJSON("not json")
    expect(result).toBeNull()
  })

  it("parseYAML parses simple YAML", () => {
    const yaml = "key: value\nanother: test"
    const result = parseYAML(yaml)
    expect(result.key).toBe("value")
    expect(result.another).toBe("test")
  })

  it("parseYAML ignores comments and empty lines", () => {
    const yaml = "# comment\nkey: value\n\n# another\n"
    const result = parseYAML(yaml)
    expect(result.key).toBe("value")
  })

  it("detectTool returns claude-code for CLAUDE.md", () => {
    const result = detectTool(join(process.cwd(), "test/fixtures"))
    expect(result).toBe("claude-code")
  })

  it("detectTool returns null for empty directory", () => {
    const emptyDir = join(TEST_DIR, "empty")
    const result = detectTool(emptyDir)
    expect(result).toBeNull()
  })
})
