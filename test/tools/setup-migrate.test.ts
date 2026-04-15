import { describe, it, expect } from "vitest"
import { setupMigrate } from "../../src/tools/setup-migrate"
import type { ToolContext } from "@opencode-ai/plugin"

function createMockContext(directory: string): ToolContext {
  return {
    sessionID: "test-session",
    messageID: "test-message",
    agent: "test-agent",
    directory,
    worktree: directory,
    abort: new AbortController().signal,
    metadata: () => {},
    ask: async () => {},
  }
}

describe("setupMigrate", () => {
  describe("path traversal defense", () => {
    it("should reject absolute path outside project", async () => {
      const result = await setupMigrate.execute(
        { sourcePath: "/etc" },
        createMockContext("/tmp/test-project")
      )
      expect(result).toContain("프로젝트 디렉토리 하위여야 합니다")
    })

    it("should reject path traversal with ..", async () => {
      const result = await setupMigrate.execute(
        { sourcePath: "../../../etc" },
        createMockContext("/tmp/test-project")
      )
      expect(result).toContain("프로젝트 디렉토리 하위여야 합니다")
    })

    it("should accept valid relative path within project", async () => {
      const result = await setupMigrate.execute(
        { sourcePath: "subdir" },
        createMockContext("/tmp/test-project")
      )
      expect(result).not.toContain("프로젝트 디렉토리 하위여야 합니다")
    })

    it("should accept no sourcePath (uses project directory)", async () => {
      const result = await setupMigrate.execute(
        {},
        createMockContext("/tmp/test-project")
      )
      expect(result).not.toContain("프로젝트 디렉토리 하위여야 합니다")
    })
  })
})
