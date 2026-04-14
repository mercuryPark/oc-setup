import { select, checkbox, input, confirm } from "@inquirer/prompts"
import type { ExperienceLevel, PreviousTool, BudgetTier, ProjectScale, PermissionLevel, MCPServerChoice, OMOProfile, OMOConfig } from "../types"

export async function askExperience(): Promise<ExperienceLevel> {
  const answer = await select({
    message: "AI 코딩 도구를 사용한 적이 있나요?",
    choices: [
      { name: "아니오, 처음입니다", value: "new" },
      { name: "한번씩 써봤어요", value: "beginner" },
      { name: "자주 사용합니다", value: "intermediate" },
      { name: "전문가입니다", value: "advanced" },
    ],
  })
  return answer as ExperienceLevel
}

export async function askPreviousTool(): Promise<PreviousTool> {
  const answer = await select({
    message: "이전에 사용하던 AI 코딩 도구가 있나요?",
    choices: [
      { name: "없습니다", value: "none" },
      { name: "Claude Code", value: "claude-code" },
      { name: "Cursor", value: "cursor" },
      { name: "Aider", value: "aider" },
      { name: "기타", value: "other" },
    ],
  })
  return answer as PreviousTool
}

export async function askProviders(): Promise<string[]> {
  const answer = await checkbox({
    message: "어떤 AI 서비스를 사용하시겠습니까? (복수 선택 가능)",
    choices: [
      { name: "OpenCode Go (무료)", value: "opencode-go", checked: true },
      { name: "OpenCode Zen (유료 큐레이션)", value: "opencode-zen" },
      { name: "Anthropic (Claude)", value: "anthropic" },
      { name: "Google (Gemini)", value: "google" },
      { name: "OpenAI", value: "openai" },
      { name: "DeepSeek", value: "deepseek" },
      { name: "로컬 모델 (Ollama/LM Studio)", value: "local" },
      { name: "기타", value: "other" },
    ],
  })
  return answer
}

export async function askBudget(): Promise<BudgetTier> {
  const answer = await select({
    message: "월 예산은 얼마나 되시나요?",
    choices: [
      { name: "무료 (Big Pickle)", value: "free" },
      { name: "$5-10/월 (MiniMax 추천)", value: "low" },
      { name: "$20-50/월 (Sonnet + Flash)", value: "mid" },
      { name: "$50+/월 (Sonnet + Opus)", value: "high" },
    ],
  })
  return answer as BudgetTier
}

export async function askProjectLanguage(): Promise<string> {
  const answer = await select({
    message: "프로젝트 주 언어는 무엇인가요?",
    choices: [
      { name: "TypeScript", value: "typescript" },
      { name: "JavaScript", value: "javascript" },
      { name: "Go", value: "go" },
      { name: "Python", value: "python" },
      { name: "Rust", value: "rust" },
      { name: "기타", value: "other" },
    ],
  })
  return answer
}

export async function askProjectFramework(): Promise<string> {
  const answer = await input({
    message: "프레임워크/라이브러리를 입력해주세요 (예: nextjs, react, fastapi, gin)",
    default: "nextjs",
  })
  return answer
}

export async function askTestRunner(): Promise<string> {
  const answer = await select({
    message: "테스트 도구는 무엇을 사용하시나요?",
    choices: [
      { name: "Vitest", value: "vitest" },
      { name: "Jest", value: "jest" },
      { name: "Playwright", value: "playwright" },
      { name: "Go test", value: "go test" },
      { name: "Pytest", value: "pytest" },
      { name: "기타", value: "other" },
    ],
  })
  return answer
}

export async function askLinter(): Promise<string> {
  const answer = await select({
    message: "린터/포맷터는 무엇을 사용하시나요?",
    choices: [
      { name: "Biome", value: "biome" },
      { name: "ESLint", value: "eslint" },
      { name: "Prettier", value: "prettier" },
      { name: "Golangci-lint", value: "golangci-lint" },
      { name: "Ruff", value: "ruff" },
      { name: "기타", value: "other" },
    ],
  })
  return answer
}

export async function askProjectScale(): Promise<ProjectScale> {
  const answer = await select({
    message: "프로젝트 규모는 어떤가요?",
    choices: [
      { name: "단일 프로젝트", value: "single" },
      { name: "모노레포", value: "monorepo" },
    ],
  })
  return answer as ProjectScale
}

export async function askMCPServers(): Promise<MCPServerChoice[]> {
  const addServer = await confirm({
    message: "MCP 서버를 연결하시겠습니까?",
    default: false,
  })

  if (!addServer) {
    return []
  }

  const servers = await checkbox({
    message: "어떤 MCP 서버를 연결하시겠습니까?",
    choices: [
      { name: "Figma", value: "figma" },
      { name: "Notion", value: "notion" },
      { name: "GitHub", value: "github" },
      { name: "Sentry", value: "sentry" },
      { name: "Filesystem", value: "filesystem" },
    ],
  })

  return servers.map((name) => ({
    name,
    config: {},
  }))
}

export async function askPlugins(): Promise<string[]> {
  const answer = await checkbox({
    message: "플러그인을 설치하시겠습니까?",
    choices: [
      { name: "oh-my-opencode (멀티 에이전트 오케스트레이션)", value: "oh-my-opencode" },
      { name: "opencode-skillful (Skill 관리 확장)", value: "opencode-skillful" },
      { name: "opencode-wakatime (코딩 시간 추적)", value: "opencode-wakatime" },
    ],
  })
  return answer
}

export async function askPermissionLevel(): Promise<PermissionLevel> {
  const answer = await select({
    message: "자동화 수준을 선택해주세요",
    choices: [
      { name: "안전 - 모든 작업 확인 요청 (신규 사용자 추천)", value: "safe" },
      { name: "균형 - 안전은 확인, 일상적 작업은 자동", value: "balanced" },
      { name: "자동 - 대부분 자동 승인 (숙련 사용자)", value: "auto" },
    ],
  })
  return answer as PermissionLevel
}

export async function askConfirmGeneration(files: string[]): Promise<boolean> {
  console.log("\n📁 다음 파일들이 생성됩니다:\n")
  for (const file of files) {
    console.log(`   • ${file}`)
  }
  console.log("")

  const answer = await confirm({
    message: "위 파일들을 생성하시겠습니까?",
    default: true,
  })
  return answer
}

/**
 * OMO (oh-my-opencode) 사용 여부 및 설정 선택
 */
export async function askOMO(budget: BudgetTier, plugins: string[]): Promise<OMOProfile> {
  // oh-my-opencode 플러그인 선택 여부 확인
  const hasOMOPlugin = plugins.includes("oh-my-opencode")

  if (hasOMOPlugin) {
    // 플러그인을 선택한 경우에도 OMO 설정 활성화 여부를 물어봄
    const enableOMO = await confirm({
      message: "oh-my-opencode 플러그인을 선택하셨습니다. OMO 에이전트 설정을 활성화하시겠습니까?",
      default: true,
    })

    if (!enableOMO) {
      return { enabled: false }
    }
  } else {
    // 플러그인을 선택하지 않은 경우 OMO 사용 여부 먼저 확인
    const enableOMO = await confirm({
      message: "oh-my-opencode (멀티 에이전트 오케스트레이션)를 사용하시겠습니까?",
      default: false,
    })

    if (!enableOMO) {
      return { enabled: false }
    }
  }

  console.log("\n🤖 OMO 에이전트 설정")
  console.log("   예산에 따라 최적의 에이전트 모델 조합을 추천합니다.\n")

  // 예산별 OMO 설정 생성
  const omoConfig = generateOMOConfigByBudget(budget)

  return {
    enabled: true,
    config: omoConfig,
  }
}

/**
 * 예산별 OMO 설정 생성
 * 모든 키는 kebab-case로 반환
 */
function generateOMOConfigByBudget(budget: BudgetTier): OMOConfig {
  switch (budget) {
    case "free":
    case "low":
      return {
        agents: {
          sisyphus: { model: "opencode-go/kimi-k2.5" },
          prometheus: { model: "opencode-go/glm-5" },
          atlas: { model: "opencode-go/kimi-k2.5" },
          explore: { model: "opencode-go/minimax-m2.7" },
          librarian: { model: "opencode-go/minimax-m2.5" },
          "multimodal-looker": { model: "opencode-go/kimi-k2.5" },
          "frontend-ui-ux-engineer": { model: "opencode-go/gemini-2.5-pro", variant: "low" },
          "document-writer": { model: "opencode-go/gemini-2.5-pro", variant: "low" },
        },
        categories: {
          explore: { model: "opencode-go/minimax-m2.7" },
          quick: { model: "opencode-go/minimax-m2.7" },
          deep: { model: "opencode-go/glm-5.1" },
          "unspecified-low": { model: "opencode-go/kimi-k2.5" },
          "unspecified-high": { model: "opencode-go/glm-5.1" },
          ultrabrain: { model: "opencode-go/glm-5.1", variant: "high" },
          oracle: { model: "opencode-go/glm-5.1", variant: "high" },
        },
      }

    case "mid":
      return {
        agents: {
          sisyphus: { model: "anthropic/claude-opus-4-5" },
          hephaestus: { model: "openai/gpt-5.4", variant: "medium" },
          prometheus: { model: "openai/gpt-5.4" },
          atlas: { model: "kimi-for-coding/k2p5" },
          explore: { model: "opencode-go/minimax-m2.7" },
          librarian: { model: "opencode-go/minimax-m2.5" },
          "multimodal-looker": { model: "opencode-go/kimi-k2.5" },
          "frontend-ui-ux-engineer": { model: "google/antigravity-gemini-3-pro", variant: "low" },
          "document-writer": { model: "google/antigravity-gemini-3-pro", variant: "low" },
        },
        categories: {
          explore: { model: "opencode-go/minimax-m2.7" },
          quick: { model: "opencode-go/minimax-m2.7" },
          deep: { model: "openai/gpt-5.3-codex", variant: "high" },
          "unspecified-low": { model: "anthropic/claude-sonnet-4-6" },
          "unspecified-high": { model: "anthropic/claude-opus-4-6" },
          ultrabrain: { model: "openai/gpt-5.4", variant: "xhigh" },
          oracle: { model: "openai/gpt-5.4", variant: "xhigh" },
        },
      }

    case "high":
    default:
      return {
        agents: {
          sisyphus: { model: "anthropic/claude-opus-4-6" },
          hephaestus: { model: "openai/gpt-5.4", variant: "medium" },
          prometheus: { model: "openai/gpt-5.4" },
          atlas: { model: "anthropic/claude-sonnet-4-5" },
          explore: { model: "kimi-for-coding/k2p5" },
          librarian: { model: "google/gemini-2.5-flash" },
          "multimodal-looker": { model: "opencode-go/kimi-k2.5" },
          "frontend-ui-ux-engineer": { model: "google/antigravity-gemini-3-pro", variant: "low" },
          "document-writer": { model: "google/antigravity-gemini-3-pro", variant: "low" },
        },
        categories: {
          explore: { model: "venice/minimax-m2.7" },
          quick: { model: "venice/minimax-m2.7" },
          deep: { model: "openai/gpt-5.3-codex", variant: "high" },
          "unspecified-low": { model: "anthropic/claude-sonnet-4-6" },
          "unspecified-high": { model: "anthropic/claude-opus-4-6" },
          ultrabrain: { model: "openai/gpt-5.4", variant: "xhigh" },
          oracle: { model: "openai/gpt-5.4", variant: "xhigh" },
        },
      }
  }
}
