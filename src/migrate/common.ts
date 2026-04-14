import { readFileSync, writeFileSync, existsSync, cpSync, mkdirSync, readdirSync } from "fs"
import { join, dirname } from "path"

export function readFileSafe(filePath: string): string | null {
  try {
    if (existsSync(filePath)) return readFileSync(filePath, "utf-8")
    return null
  } catch {
    return null
  }
}

export function writeFileSafe(filePath: string, content: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, content, "utf-8")
}

export function backupFile(filePath: string): void {
  if (existsSync(filePath)) cpSync(filePath, `${filePath}.bak`)
}

export function copyDirectory(src: string, dest: string): string[] {
  const copied: string[] = []
  if (!existsSync(src)) return copied
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      copied.push(...copyDirectory(srcPath, destPath))
    } else {
      try {
        cpSync(srcPath, destPath)
        copied.push(destPath)
      } catch {
        // skip
      }
    }
  }
  return copied
}

export function detectTool(rootPath: string): string | null {
  const checks = [
    { file: join(rootPath, ".claude"), name: "claude-code" },
    { file: join(rootPath, ".cursorrules"), name: "cursor" },
    { file: join(rootPath, ".aider.conf.yml"), name: "aider" },
    { file: join(rootPath, "CLAUDE.md"), name: "claude-code" },
    { file: join(rootPath, "claude_desktop_config.json"), name: "claude-code" },
  ]
  for (const check of checks) {
    if (existsSync(check.file)) return check.name
  }
  return null
}

export function parseJSON<T = unknown>(content: string): T | null {
  try {
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

export function parseYAML(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const colonIndex = trimmed.indexOf(":")
    if (colonIndex > 0) {
      const key = trimmed.slice(0, colonIndex).trim()
      const value = trimmed.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, "")
      if (value) result[key] = value
    }
  }
  return result
}

export function formatMigrationResult(
  toolName: string,
  files: string[],
  warnings: string[],
  suggestions: string[]
): string {
  const lines = [
    `✅ ${toolName} → OpenCode 마이그레이션 완료!`,
    "",
    "생성된 파일:",
    ...files.map((f) => `  • ${f}`),
  ]
  if (warnings.length > 0) {
    lines.push("", "경고:", ...warnings.map((w) => `  ⚠️ ${w}`))
  }
  if (suggestions.length > 0) {
    lines.push("", "권장 사항:", ...suggestions.map((s) => `  → ${s}`))
  }
  lines.push("", "다음 단계:", "1. 생성된 파일들을 확인하세요", "2. opencode.json의 API 키를 설정하세요", "3. 'opencode doctor'로 환경을 확인하세요")
  return lines.join("\n")
}
