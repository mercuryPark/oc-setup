import { homedir } from "os"
import {
  askExperience,
  askPreviousTool,
  askProviders,
  askBudget,
  askProjectLanguage,
  askProjectFramework,
  askTestRunner,
  askLinter,
  askProjectScale,
  askMCPServers,
  askPlugins,
  askPermissionLevel,
  askConfirmGeneration,
} from "./questions"
import type { UserProfile } from "../types"
import { writeGlobalConfig, writeProjectConfig } from "../core/config-generator"
import { generateAgentsMD, writeAgentsMD } from "../core/agents-md-generator"
import { generateCommands, writeCommands } from "../core/command-generator"
import { generateAgents, writeAgents } from "../core/agent-generator"
import { generateSkills, writeSkills } from "../core/skill-generator"
import { generateEnvExample, writeEnvExample } from "../core/env-generator"

function getProjectDir(): string {
  return process.cwd()
}

function getHomeDir(): string {
  return homedir()
}

export async function runInitWizard(): Promise<void> {
  console.log("🔧 OpenCode 환경 세팅 마법사에 오신 것을 환영합니다!\n")

  const experience = await askExperience()
  const previousTool = await askPreviousTool()

  if (previousTool !== "none") {
    console.log(`\n⚠️  ${previousTool}에서 전환하시는군요!`)
    console.log("   'oc-setup migrate' 명령으로 마이그레이션을 먼저 진행해주세요.\n")
    return
  }

  console.log("\n📦 Provider 선택")
  const providers = await askProviders()
  const budget = await askBudget()

  console.log("\n🛠️ 프로젝트 정보")
  const projectLanguage = await askProjectLanguage()
  const projectFramework = await askProjectFramework()
  const testRunner = await askTestRunner()
  const linter = await askLinter()

  console.log("\n📊 프로젝트 규모")
  const projectScale = await askProjectScale()

  console.log("\n🔌 MCP 서버 (선택)")
  const mcpServers = await askMCPServers()

  console.log("\n🔧 플러그인")
  const plugins = await askPlugins()

  console.log("\n🔒 권한 설정")
  const permissionLevel = await askPermissionLevel()

  const profile: UserProfile = {
    experienceLevel: experience,
    previousTool,
    providers,
    budget,
    projectLanguage,
    projectFramework,
    testRunner,
    linter,
    projectScale,
    mcpServers,
    plugins,
    permissionLevel,
  }

  const projectDir = getProjectDir()
  const homeDir = getHomeDir()

  const filesToCreate = [
    `${homeDir}/.config/opencode/opencode.json (글로벌 설정)`,
    `${projectDir}/opencode.json (프로젝트 설정)`,
    `${projectDir}/AGENTS.md (프로젝트 가이드)`,
    `${projectDir}/.opencode/commands/ (커스텀 커맨드)`,
    `${projectDir}/.opencode/agents/ (커스텀 에이전트)`,
    `${projectDir}/.opencode/skills/ (스킬)`,
    `${projectDir}/.env.example (환경변수 템플릿)`,
  ]

  const confirmed = await askConfirmGeneration(filesToCreate)
  if (!confirmed) {
    console.log("\n❌ 취소되었습니다.")
    return
  }

  console.log("\n✨ 파일 생성 중...\n")

  try {
    writeGlobalConfig(profile, homeDir)
    console.log("   ✓ 글로벌 설정 생성됨")

    writeProjectConfig(profile, projectDir)
    console.log("   ✓ 프로젝트 설정 생성됨")

    const agentsMD = generateAgentsMD(profile)
    writeAgentsMD(agentsMD, projectDir)
    console.log("   ✓ AGENTS.md 생성됨")

    const commands = generateCommands()
    writeCommands(commands, projectDir)
    console.log("   ✓ 커스텀 커맨드 생성됨")

    const agents = generateAgents()
    writeAgents(agents, projectDir)
    console.log("   ✓ 커스텀 에이전트 생성됨")

    const skills = generateSkills(profile)
    writeSkills(skills, projectDir)
    console.log("   ✓ 스킬 생성됨")

    const envContent = generateEnvExample(profile)
    writeEnvExample(envContent, projectDir)
    console.log("   ✓ .env.example 생성됨")

    console.log("\n✅ 생성 완료!\n")
    console.log("다음 단계:")
    console.log("1. .env.example을 .env로 복사하고 API 키를 설정하세요")
    console.log("2. OpenCode를 재시작하거나 'opencode --reload'를 실행하세요")
    console.log("3. 프로젝트에서 'opencode' 명령어를 사용해보세요!\n")
  } catch (error) {
    console.error("\n❌ 파일 생성 중 오류가 발생했습니다:")
    console.error(error instanceof Error ? error.message : String(error))
  }
}
