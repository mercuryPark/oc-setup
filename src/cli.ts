import { Command } from "commander"
import { runInitWizard } from "./prompt/wizard.js"
import { listPresets, applyPreset } from "./preset/registry.js"
import { runValidation } from "./validator/config-validator.js"
import { runAllChecks } from "./doctor/checks.js"
import { formatReport } from "./doctor/reporter.js"

const program = new Command()

program
  .name("opencode-setup")
  .description("OpenCode 초기 환경 세팅 도구")
  .version("0.1.0")

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
    console.log(JSON.stringify(result, null, 2))
  })

program
  .command("migrate <tool>")
  .description("기존 도구 마이그레이션 (claude-code, cursor, aider)")
  .action((tool: string) => {
    console.log(`마이그레이션 기능은 준비 중입니다: ${tool}`)
    console.log("현재 지원: claude-code, cursor, aider")
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
  console.error(`Unhandled rejection: ${reason}`)
  process.exit(1)
})
