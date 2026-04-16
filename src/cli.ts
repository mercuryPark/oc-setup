import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { Option } from "commander"
import { Command } from "commander"
import { runInitWizard } from "./prompt/wizard.js"
import { listPresets, applyPreset } from "./preset/registry.js"
import { runValidation } from "./validator/config-validator.js"
import { runAllChecks } from "./doctor/checks.js"
import { formatReport } from "./doctor/reporter.js"
import { runMigration, autoMigrate } from "./migrate/index.js"
import { setLogLevel, setJsonMode, LogLevel, log, error, warn, json, isJsonMode } from "./utils/logger.js"
import { printError } from "./utils/error.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
) as { version: string }

const program = new Command()

program
  .name("@hoyeon0722/opencode-setup")
  .description("OpenCode 초기 환경 세팅 도구")
  .version(pkg.version)
  .addOption(new Option("-q, --quiet", "Suppress informational output").implies({ verbose: false }))
  .addOption(new Option("-v, --verbose", "Show detailed output"))
  .addOption(new Option("--json", "Output machine-readable JSON").implies({ quiet: false }))

program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.opts()
  if (opts.quiet) {
    setLogLevel(LogLevel.SILENT)
  } else if (opts.verbose) {
    setLogLevel(LogLevel.VERBOSE)
  }
  if (opts.json) {
    setJsonMode(true)
  }
})

program
  .command("init")
  .description("대화형 초기 세팅")
  .action(runInitWizard)

const preset = program.command("preset").description("프리셋 관리")
preset
  .command("list")
  .description("프리셋 목록")
  .action(() => {
    const presets = listPresets()
    if (isJsonMode()) {
      json(presets)
    } else {
      log(presets)
    }
  })
preset
  .command("apply <name>")
  .description("프리셋 적용")
  .action(async (name: string) => {
    const result = await applyPreset(name, process.cwd())
    if (isJsonMode()) {
      json(result)
    } else if (result.success) {
      log(`✅ Preset '${name}' 적용 완료`)
      for (const f of result.files) log(`  • ${f}`)
      if (result.warnings.length) {
        warn("\n⚠️  Warnings:")
        for (const w of result.warnings) warn(`  • ${w}`)
      }
    } else {
      const warning = result.warnings[0] || "알 수 없는 오류가 발생했습니다."
      printError(
        `Preset '${name}' 적용 실패`,
        warning,
        "'preset list'로 사용 가능한 프리셋을 확인하세요."
      )
      process.exit(1)
    }
  })

program
  .command("migrate [tool]")
  .description("기존 도구 마이그레이션 (claude-code, cursor, aider). 도구 미지정 시 자동 감지")
  .action(async (tool: string | undefined) => {
    const projectDir = process.cwd()
    let result: string
    if (!tool) {
      log("🔍 자동 감지 중...")
      result = autoMigrate(projectDir)
    } else {
      result = await runMigration(tool as "claude-code" | "cursor" | "aider", projectDir)
    }
    log(result)
    if (result.startsWith("❌") || result.includes("찾을 수 없습니다")) {
      printError(
        "마이그레이션 실패",
        result.replace("❌ ", "").split("\n")[0] || "마이그레이션 중 오류가 발생했습니다.",
        "마이그레이션 대상 도구(claude-code, cursor, aider)가 올바르게 설치되어 있는지 확인하세요."
      )
      process.exit(1)
    }
  })

program
  .command("validate")
  .description("설정 검증")
  .action(async () => {
    const result = await runValidation(process.cwd())
    if (isJsonMode()) {
      json({ output: result })
    } else {
      log(result)
    }
  })

program
  .command("doctor")
  .description("환경 진단")
  .action(async () => {
    const results = await runAllChecks(process.cwd())
    const report = formatReport(results)
    if (isJsonMode()) {
      json(results)
    } else {
      log(report)
    }
  })

program.parse()

process.on("SIGINT", () => {
  log("\nCancelled by user")
  process.exit(130)
})

process.on("uncaughtException", (err) => {
  printError(
    `치명적 오류: ${err.message}`,
    "예상치 못한 오류가 발생했습니다.",
    "문제 지속 시 GitHub Issues에 보고해주세요."
  )
  process.exit(1)
})

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error && reason.name === "ExitPromptError") {
    log("\n❌ 세팅이 취소되었습니다.")
    process.exit(130)
  }
  const msg = reason instanceof Error ? reason.message : String(reason)
  printError(
    `처리되지 않은 오류: ${msg}`,
    "비동기 작업 중 오류가 발생했습니다.",
    "문제 지속 시 GitHub Issues에 보고해주세요."
  )
  process.exit(1)
})
