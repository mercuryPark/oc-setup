import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { Command } from "commander"
import { runInitWizard } from "./prompt/wizard.js"
import { listPresets, applyPreset } from "./preset/registry.js"
import { runValidation } from "./validator/config-validator.js"
import { runAllChecks } from "./doctor/checks.js"
import { formatReport } from "./doctor/reporter.js"
import { runMigration, autoMigrate } from "./migrate/index.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
) as { version: string }

const program = new Command()

program
  .name("@hoyeon0722/opencode-setup")
  .description("OpenCode 초기 환경 세팅 도구")
  .version(pkg.version)

program
  .command("init")
  .description("대화형 초기 세팅")
  .action(runInitWizard)

const preset = program.command("preset").description("프리셋 관리")
preset
  .command("list")
  .description("프리셋 목록")
  .action(() => {
    console.log(listPresets())
  })
preset
  .command("apply <name>")
  .description("프리셋 적용")
  .action(async (name: string) => {
    const result = await applyPreset(name, process.cwd())
    if (result.success) {
      console.log(`✅ Preset '${name}' 적용 완료`)
      for (const f of result.files) console.log(`  • ${f}`)
      if (result.warnings.length) {
        console.warn("\n⚠️  Warnings:")
        for (const w of result.warnings) console.warn(`  • ${w}`)
      }
    } else {
      console.error(`❌ Preset '${name}' 적용 실패`)
      for (const w of result.warnings) console.error(`  • ${w}`)
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
      console.log("🔍 자동 감지 중...")
      result = autoMigrate(projectDir)
    } else {
      result = await runMigration(tool as "claude-code" | "cursor" | "aider", projectDir)
    }
    console.log(result)
    if (result.startsWith("❌") || result.includes("찾을 수 없습니다")) {
      process.exit(1)
    }
  })

program
  .command("validate")
  .description("설정 검증")
  .action(async () => {
    const result = await runValidation(process.cwd())
    console.log(result)
  })

program
  .command("doctor")
  .description("환경 진단")
  .action(async () => {
    const results = await runAllChecks(process.cwd())
    console.log(formatReport(results))
  })

program.parse()

// Exit code handling
process.on('SIGINT', () => {
  console.log('\nCancelled by user')
  process.exit(130)
})

process.on('uncaughtException', (error) => {
  console.error(`Fatal error: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error && reason.name === "ExitPromptError") {
    console.log('\n❌ 세팅이 취소되었습니다.')
    process.exit(130)
  }
  console.error(`Unhandled rejection: ${reason}`)
  process.exit(1)
})
