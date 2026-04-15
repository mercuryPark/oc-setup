import { homedir } from "os"
import { join } from "path"
import { confirm } from "@inquirer/prompts"
import {
  askExperience,
  askPreviousTool,
  askProviders,
  askBudget,
  askProjectLanguage,
  askProjectFramework,
  askFeatureType,
  askTestRunner,
  askLinter,
  askProjectScale,
  askMCPServers,
  askPlugins,
  askPermissionLevel,
  askAdvancedSettings,
  askConfirmGeneration,
  askOMO,
} from "./questions.js"
import type { UserProfile } from "../types"
import { writeGlobalConfig, writeProjectConfig, generateGlobalConfig, generateProjectConfig } from "../core/config-generator.js"
import { generateAgentsMD, writeAgentsMD } from "../core/agents-md-generator.js"
import { generateCommands, writeCommands } from "../core/command-generator.js"
import { generateAgents, writeAgents } from "../core/agent-generator.js"
import { generateSkills, writeSkills } from "../core/skill-generator.js"
import { generateEnvExample, writeEnvExample } from "../core/env-generator.js"
import { writeOMOConfig } from "../core/omo-generator.js"
import { runValidation } from "../validator/config-validator.js"
import { migrateClaudeCode } from "../migrate/claude-code.js"
import { migrateCursor } from "../migrate/cursor.js"
import { migrateAider } from "../migrate/aider.js"
import { getFeatureConfig } from "../core/feature-presets.js"

async function showPreview(profile: UserProfile, homeDir: string, projectDir: string): Promise<boolean> {
  console.log("\n" + "=".repeat(60))
  console.log("📋 설정 미리보기")
  console.log("=".repeat(60) + "\n")

  const globalConfig = generateGlobalConfig(profile)
  console.log("🌐 글로벌 설정 (~/.config/opencode/opencode.json):")
  console.log(JSON.stringify(globalConfig, null, 2))
  console.log()

  const projectConfig = generateProjectConfig(profile)
  console.log("📁 프로젝트 설정 (./opencode.json):")
  console.log(JSON.stringify(projectConfig, null, 2))
  console.log()

  const agentsMD = generateAgentsMD(profile)
  const agentsPreview = agentsMD.split("\n").slice(0, 20).join("\n")
  console.log("📄 AGENTS.md (처음 20줄):")
  console.log(agentsPreview)
  if (agentsMD.split("\n").length > 20) {
    console.log("... (이하 생략)")
  }
  console.log()

  const featureConfig = getFeatureConfig(profile.featureType)
  if (profile.featureType !== "general") {
    console.log(`🎯 기능별 설정: ${featureConfig.name}`)
    if (featureConfig.additionalSkills.length > 0) {
      console.log(`   추가 스킬: ${featureConfig.additionalSkills.join(", ")}`)
    }
    if (featureConfig.envVars.length > 0) {
      console.log(`   환경변수: ${featureConfig.envVars.join(", ")}`)
    }
    console.log()
  }

  const filesToCreate = [
    `${join(homeDir, ".config/opencode/opencode.json")} (글로벌 설정)`,
    `${projectDir}/opencode.json (프로젝트 설정)`,
    `${projectDir}/AGENTS.md (프로젝트 가이드)`,
    `${projectDir}/.opencode/commands/ (커스텀 커맨드)`,
    `${projectDir}/.opencode/agents/ (커스텀 에이전트)`,
    `${projectDir}/.opencode/skills/ (스킬)`,
    `${projectDir}/.env.example (환경변수 템플릿)`,
    ...(profile.omo?.enabled ? [`${join(homeDir, ".config/opencode/oh-my-opencode.json")} (OMO 설정)`] : []),
  ]

  console.log("📁 생성될 파일 목록:")
  for (const file of filesToCreate) {
    console.log(`   • ${file}`)
  }
  console.log()

  const shouldProceed = await confirm({
    message: "이 설정으로 계속 진행하시겠습니까?",
    default: true,
  })

  return shouldProceed
}

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
    const shouldMigrate = await confirm({
      message: "기존 설정을 자동으로 마이그레이션하시겠습니까?",
      default: true,
    })

    if (shouldMigrate) {
      console.log("\n🔄 마이그레이션 진행 중...")
      const projectDir = getProjectDir()

      if (previousTool === "claude-code") {
        const result = migrateClaudeCode(projectDir)
        console.log(result)
      } else if (previousTool === "cursor") {
        const result = migrateCursor(projectDir)
        console.log(result)
      } else if (previousTool === "aider") {
        const result = migrateAider(projectDir)
        console.log(result)
      } else {
        console.log(`\n⚠️  ${previousTool} 마이그레이션은 아직 지원되지 않습니다.`)
        console.log("   수동으로 설정을 옮겨주세요.\n")
      }

      const continueInit = await confirm({
        message: "\n마이그레이션 완료. 계속해서 새 설정을 생성하시겠습니까?",
        default: true,
      })

      if (!continueInit) {
        console.log("\n✅ 마이그레이션만 완료되었습니다.")
        return
      }
    }
  }

  console.log("\n📦 Provider 선택")
  const providers = await askProviders()
  const budget = await askBudget()

  console.log("\n🛠️ 프로젝트 정보")
  const projectLanguage = await askProjectLanguage()
  const projectFramework = await askProjectFramework()
  const featureType = await askFeatureType()
  const testRunner = await askTestRunner()
  const linter = await askLinter()

  console.log("\n📊 프로젝트 규모")
  const projectScale = await askProjectScale()

  console.log("\n🔌 MCP 서버 (선택)")
  const mcpServers = await askMCPServers()

  console.log("\n🔧 플러그인")
  const plugins = await askPlugins()

  console.log("\n🤖 oh-my-opencode (OMO) 설정")
  const omo = await askOMO(budget, plugins)

  console.log("\n🔒 권한 설정")
  const permissionLevel = await askPermissionLevel()

  console.log("\n⚙️ 고급 설정 (선택)")
  const advancedSettings = await askAdvancedSettings()

  const profile: UserProfile = {
    experienceLevel: experience,
    previousTool,
    providers,
    budget,
    projectLanguage,
    projectFramework,
    featureType,
    testRunner,
    linter,
    projectScale,
    mcpServers,
    plugins,
    permissionLevel,
    omo,
    advancedSettings,
  }

  const projectDir = getProjectDir()
  const homeDir = getHomeDir()

  const previewConfirmed = await showPreview(profile, homeDir, projectDir)
  if (!previewConfirmed) {
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

    if (omo?.enabled) {
      writeOMOConfig(omo, homeDir)
      console.log("   ✓ oh-my-opencode 설정 생성됨")
    }

    console.log("\n✅ 생성 완료!\n")

    console.log("🔍 설정 검증 중...")
    const validationResult = await runValidation(projectDir)
    console.log(validationResult)
    console.log()

    console.log("다음 단계:")
    console.log("1. .env.example을 .env로 복사하고 API 키를 설정하세요")
    console.log("2. OpenCode를 재시작하거나 'opencode --reload'를 실행하세요")
    console.log("3. 프로젝트에서 'opencode' 명령어를 사용필요합니다.")
    return
  } catch (error) {
    console.error("\n❌ 파일 생성 중 오류가 발생했습니다:")
    console.error(error instanceof Error ? error.message : String(error))
  }
}
