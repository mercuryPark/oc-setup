import { existsSync, readdirSync, readFileSync } from "fs"
import { join, basename } from "path"
import { writeFileSafe, backupFile } from "./common.js"

/**
 * Claude Code Hook을 OpenCode Command로 변환
 */
export interface HookConversionResult {
  commands: Record<string, string>
  warnings: string[]
  converted: string[]
  skipped: string[]
}

interface ClaudeHook {
  event: string
  conditions?: string[]
  actions: Array<{
    type: "bash" | "command"
    command?: string
    args?: string[]
  }>
}

/**
 * Claude Code hook 파일 파싱
 * YAML 형식과 JSON 형식 모두 지원
 */
function parseHookFile(content: string): ClaudeHook[] {
  const hooks: ClaudeHook[] = []

  // YAML 형식 파싱 시도 (hooks: 으로 시작)
  if (content.includes("hooks:") || content.trim().startsWith("-")) {
    try {
      // 간단한 YAML 파싱
      const lines = content.split("\n")
      let currentHook: Partial<ClaudeHook> = {}

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith("- event:")) {
          if (currentHook.event) {
            hooks.push(currentHook as ClaudeHook)
          }
          currentHook = {
            event: trimmed.replace("- event:", "").trim(),
            actions: [],
          }
        } else if (trimmed.startsWith("command:") && currentHook.actions) {
          currentHook.actions.push({
            type: "command",
            command: trimmed.replace("command:", "").trim(),
          })
        } else if (trimmed.startsWith("bash:") && currentHook.actions) {
          currentHook.actions.push({
            type: "bash",
            command: trimmed.replace("bash:", "").trim(),
          })
        }
      }

      if (currentHook.event) {
        hooks.push(currentHook as ClaudeHook)
      }
    } catch {
      // 파싱 실패
    }
  }

  // JSON 형식 파싱 시도
  if (hooks.length === 0) {
    try {
      const json = JSON.parse(content)
      if (Array.isArray(json.hooks)) {
        return json.hooks
      }
    } catch {
      // JSON 파싱 실패
    }
  }

  return hooks
}

/**
 * Hook event 이름을 Command 이름으로 변환
 */
function convertEventToCommandName(event: string): string {
  const eventMap: Record<string, string> = {
    "session.idle": "on-idle",
    "session.created": "on-session-start",
    "session.ended": "on-session-end",
    "file.beforeWrite": "before-save",
    "file.afterWrite": "after-save",
    "tool.beforeExecute": "before-tool",
    "tool.afterExecute": "after-tool",
  }

  return eventMap[event] || event.replace(/\./g, "-")
}

/**
 * Hook action을 Command content로 변환
 */
function convertActionToCommand(hook: ClaudeHook): string | null {
  const lines: string[] = []

  // Hook 설명 추가
  lines.push(`# ${hook.event} hook에서 변환됨`)
  lines.push("")

  // Actions 변환
  for (const action of hook.actions) {
    if (action.type === "bash" && action.command) {
      // Bash 명령어는 그대로 사용
      lines.push(`Run the following bash command:`)
      lines.push("```bash")
      lines.push(action.command)
      lines.push("```")
      lines.push("")
    } else if (action.type === "command" && action.command) {
      // 다른 OpenCode command 호출
      lines.push(`Execute the /${action.command} command.`)
      lines.push("")
    }
  }

  return lines.join("\n")
}

/**
 * 변환 불가능한 hook인지 확인
 */
function isUnsupportedHook(hook: ClaudeHook): boolean {
  // 일부 이벤트는 OpenCode에서 지원하지 않음
  const unsupportedEvents = [
    "session.notification", // OpenCode notification 시스템 없음
  ]

  return unsupportedEvents.includes(hook.event)
}

/**
 * Claude Code hooks 디렉토리를 OpenCode commands로 변환
 */
export function convertHooksToCommands(
  hooksDir: string,
  outputDir: string
): HookConversionResult {
  const result: HookConversionResult = {
    commands: {},
    warnings: [],
    converted: [],
    skipped: [],
  }

  if (!existsSync(hooksDir)) {
    return result
  }

  const files = readdirSync(hooksDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml") || f.endsWith(".json"))

  for (const file of files) {
    const filePath = join(hooksDir, file)
    const content = readFileSync(filePath, "utf-8")
    const hooks = parseHookFile(content)

    for (const hook of hooks) {
      if (isUnsupportedHook(hook)) {
        result.skipped.push(`${file}:${hook.event}`)
        result.warnings.push(`지원하지 않는 hook 이벤트: ${hook.event}`)
        continue
      }

      const commandName = convertEventToCommandName(hook.event)
      const commandContent = convertActionToCommand(hook)

      if (commandContent) {
        result.commands[commandName] = commandContent
        result.converted.push(hook.event)
      } else {
        result.skipped.push(hook.event)
      }
    }
  }

  // oh-my-claude-code 특수 처리
  const omccPath = join(hooksDir, "oh-my-claude-code")
  if (existsSync(omccPath)) {
    result.warnings.push(
      "oh-my-claude-code 감지됨. oh-my-opencode로 마이그레이션하려면 'npm install -g oh-my-opencode'를 실행하세요."
    )
  }

  return result
}

/**
 * 변환된 commands를 .opencode/commands/에 저장
 */
export function writeConvertedCommands(
  result: HookConversionResult,
  outputDir: string
): void {
  if (Object.keys(result.commands).length === 0) {
    return
  }

  const commandsDir = join(outputDir, ".opencode", "commands")

  for (const [name, content] of Object.entries(result.commands)) {
    const filePath = join(commandsDir, `${name}.md`)
    backupFile(filePath)
    writeFileSafe(filePath, content)
  }
}

/**
 * Hook 변환 마이그레이션 실행
 */
export function migrateHooks(rootPath: string): HookConversionResult {
  const hooksDir = join(rootPath, ".claude", "hooks")
  const result = convertHooksToCommands(hooksDir, rootPath)

  if (Object.keys(result.commands).length > 0) {
    writeConvertedCommands(result, rootPath)
  }

  return result
}
