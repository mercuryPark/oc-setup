import { describe, it, expect, beforeEach } from "vitest"
import { migrateClaudeCode } from "../../src/migrate/claude-code.js"
import { migrateCursor } from "../../src/migrate/cursor.js"
import { migrateAider } from "../../src/migrate/aider.js"
import { join } from "path"
import { rmSync, existsSync } from "fs"

const TEST_DIR = join(process.cwd(), "test-temp")

describe("migrate/claude-code", () => {
  it("migrates CLAUDE.md to AGENTS.md", () => {
    const result = migrateClaudeCode(join(process.cwd(), "test/fixtures"))
    expect(result).toContain("Claude Code → OpenCode 마이그레이션 완료")
    expect(result).toContain("AGENTS.md")
  })

  it("generates opencode.json", () => {
    const result = migrateClaudeCode(join(process.cwd(), "test/fixtures"))
    expect(result).toContain("opencode.json")
  })
})

describe("migrate/cursor", () => {
  it("migrates .cursorrules to AGENTS.md", () => {
    const result = migrateCursor(join(process.cwd(), "test/fixtures"))
    expect(result).toContain("Cursor → OpenCode 마이그레이션 완료")
  })

  it("generates opencode.json", () => {
    const result = migrateCursor(join(process.cwd(), "test/fixtures"))
    expect(result).toContain("opencode.json")
  })
})

describe("migrate/aider", () => {
  it("migrates .aider.conf.yml", () => {
    const result = migrateAider(join(process.cwd(), "test/fixtures"))
    expect(result).toContain("Aider → OpenCode 마이그레이션 완료")
    expect(result).toContain("opencode.json")
  })
})
