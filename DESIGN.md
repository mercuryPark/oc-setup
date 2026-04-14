# opencode-setup — Design Document v2

> OpenCode 초기 환경 세팅 플러그인 + CLI 설계서
> 작성: Claude Opus 4.6 | 날짜: 2026-04-13
> v1 대비 변경: Go CLI → TypeScript 플러그인, 플러그인/Skill/OMO 시스템 반영, /connect 인증 플로우 추가

---

## 1. 프로젝트 개요

### 1.1 목표
`opencode-setup`은 OpenCode를 처음 사용하는 개발자가 최적의 초기 환경을 세팅할 수 있게 도와주는 **OpenCode 플러그인 겸 독립 CLI**다.

### 1.2 왜 TypeScript 플러그인인가
OpenCode 생태계의 확장은 npm 플러그인(TS/JS)으로 이루어진다. Go로 만들면 OpenCode 밖에서만 돌아가는 외부 도구가 되지만, TS 플러그인으로 만들면 OpenCode 안에서 바로 쓸 수 있는 내장 도구가 된다.

### 1.3 두 가지 실행 모드

```
`opencode-setup` (npm 패키지)
│
├── 플러그인 모드
│   opencode.json의 "plugin" 배열에 "opencode-setup" 추가
│   → OpenCode 안에서 setup_init, setup_migrate 등 tool로 실행
│
└── CLI 모드
│   npx opencode-setup init
│   → OpenCode 없이 독립 실행 (아직 OpenCode 설정이 없는 신규 사용자용)
```

### 1.4 해결하는 문제
- 타 AI 코딩 도구(Claude Code, Cursor, Aider 등)에서 전환하는 사용자의 세팅 마찰 제거
- AI 코딩 도구 경험이 없는 신규 사용자의 온보딩
- 기존 도구 설정 파일(CLAUDE.md, .cursorrules 등)을 OpenCode 형식으로 자동 변환
- 75+ provider 중 예산/용도에 맞는 최적 조합 추천
- 인기 플러그인(OMO 등), Skill, MCP 서버의 원클릭 설정

### 1.5 타겟 사용자
1. **신규 사용자** — AI 코딩 도구를 처음 쓰는 개발자
2. **Claude Code 전환자** — CLAUDE.md, skill, hook, rule, MCP 설정 보유
3. **Cursor 전환자** — .cursorrules, Cursor Settings 보유
4. **Aider 전환자** — .aider.conf.yml, conventions 파일 보유
5. **기타 전환자** — Windsurf, Codex CLI, Gemini CLI 등

### 1.6 배포
- npm publish (`npm install -g opencode-setup` 또는 `npx opencode-setup`)
- OpenCode 플러그인 등록 (`opencode.json`의 `"plugin": ["opencode-setup"]`)
- GitHub 오픈소스 (MIT License)

---

## 2. OpenCode 설정 체계

### 2.1 opencode-setup이 생성/관리하는 파일

| 파일 | 위치 | 역할 |
|------|------|------|
| `opencode.json` (글로벌) | `~/.config/opencode/opencode.json` | Provider, 기본 모델, 테마, 플러그인 |
| `tui.json` (글로벌) | `~/.config/opencode/tui.json` | TUI 키바인드, 스크롤, diff 스타일 |
| `opencode.json` (프로젝트) | `{project}/opencode.json` | 프로젝트별 모델 오버라이드, permission, MCP, LSP |
| `AGENTS.md` | `{project}/AGENTS.md` | 프로젝트 규칙, 코딩 표준, 아키텍처 가이드 |
| 에이전트 파일 | `.opencode/agents/*.md` | 커스텀 에이전트 정의 |
| 커맨드 파일 | `.opencode/commands/*.md` | 커스텀 반복 명령어 (/test, /lint 등) |
| 스킬 파일 | `.opencode/skills/*/SKILL.md` | 온디맨드 도메인 전문 지식 |
| 플러그인 파일 | `.opencode/plugins/*.ts` | 로컬 플러그인 (필요시) |
| `.env.example` | `{project}/.env.example` | 필요한 환경변수 템플릿 |

### 2.2 설정 우선순위 (낮음 → 높음)
1. Remote config (.well-known/opencode) — 조직 기본값
2. Global config (~/.config/opencode/opencode.json)
3. Custom config (OPENCODE_CONFIG 환경변수)
4. Project config (프로젝트 루트 opencode.json)

### 2.3 opencode.json 핵심 스키마

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",

  "provider": {
    "anthropic": {
      "options": { "apiKey": "{env:ANTHROPIC_API_KEY}" }
    }
  },

  "permission": {
    "edit": "allow",
    "bash": {
      "npm *": "allow",
      "git *": "allow",
      "rm *": "ask",
      "*": "ask"
    },
    "webfetch": "allow"
  },

  "agent": {
    "build": { "model": "anthropic/claude-sonnet-4-5" },
    "plan": { "model": "google/gemini-2.5-flash" }
  },

  "default_agent": "build",
  "command": {},
  "mcp": {},
  "lsp": {},

  // v2 추가: 플러그인
  "plugin": [
    "opencode-setup",
    "oh-my-opencode"  // 선택시
  ],

  // v2 추가: 외부 instruction 파일
  "instructions": [
    "docs/coding-standards.md",
    "packages/*/AGENTS.md"
  ],

  "theme": "opencode",
  "autoupdate": true
}
```

---

## 3. Claude Code → OpenCode 개념 매핑

### 3.1 Claude Code → OpenCode (v2 수정)

| Claude Code 개념 | OpenCode 대응 | 변환 방법 |
|------------------|---------------|-----------|
| `CLAUDE.md` | `AGENTS.md` | 내용 보존, 파일명 변경 + OpenCode 헤더 추가 |
| skill (`SKILL.md`) | skill (`.opencode/skills/*/SKILL.md`) | **경로 복사만** (네이티브 호환) |
| hook (이벤트 트리거) | plugin hook + command | 자동 트리거 → plugin hook, 수동 → command |
| rule (행동 규칙) | `AGENTS.md` 내 Rules 섹션 | rule 파일 내용을 AGENTS.md에 병합 |
| oh-my-claude-code | oh-my-opencode (OMO) | 플러그인 설치 + 에이전트 매핑 |
| MCP 서버 (.mcp.json) | opencode.json `mcp` 섹션 | 설정 구조 변환 |
| extended thinking | agent `reasoningEffort` | high / medium / low |
| permission (yolo) | `permission` 설정 | allow / ask / deny 세분화 |
| /init | /init | OpenCode 내장 (AGENTS.md 자동 생성) |

**v1에서 변경된 핵심:** skill은 agent로 변환하는 게 아니라 경로만 옮기면 된다. OpenCode는 `.claude/skills/*/SKILL.md` 경로도 네이티브로 탐색한다.

### 3.2 Cursor → OpenCode

| Cursor 개념 | OpenCode 대응 | 변환 방법 |
|-------------|---------------|-----------|
| `.cursorrules` | `AGENTS.md` | 규칙 내용을 AGENTS.md로 변환 |
| Cursor Settings (AI Rules) | `opencode.json` + `AGENTS.md` | 모델 설정은 config, 규칙은 AGENTS.md |
| @Codebase | 내장 (자동) | OpenCode 자동 인식 |
| Composer | `build` 에이전트 | 기본 build 에이전트 |

### 3.3 Aider → OpenCode

| Aider 개념 | OpenCode 대응 | 변환 방법 |
|------------|---------------|-----------|
| `.aider.conf.yml` | `opencode.json` | 모델, provider 변환 |
| conventions | `AGENTS.md` | 코딩 컨벤션을 AGENTS.md로 변환 |
| `/architect` | `plan` 에이전트 | plan 에이전트 |
| git 연동 | 내장 (자동) | OpenCode 기본 제공 |

### 3.4 신규 사용자

변환 대상이 없으므로:
- 프로젝트 스택에 맞는 **AGENTS.md 베스트 프랙티스 템플릿**
- 예산/용도 기반 **모델 추천**
- 기본 **permission 프리셋** (안전 / 균형 / 자동)
- **커스텀 커맨드 스타터 팩** (/test, /lint, /review, /plan)
- **인기 플러그인 추천** (OMO, skillful 등)

---

## 4. Provider & 모델 추천 로직

### 4.1 지원 Provider

| 카테고리 | Provider | 인증 방식 |
|----------|----------|-----------|
| **무료 (Zen)** | OpenCode Go: Big Pickle, MiniMax M2.5 Free, Qwen3.6 Plus Free, Nemotron 3 Super Free | Zen API Key (/connect) |
| **유료 (Zen)** | OpenCode Zen 큐레이션 | Zen 구독 + API Key |
| **직접 API** | Anthropic, Google, OpenAI, DeepSeek, Mistral, xAI, MiniMax, Kimi | 각 provider API Key |
| **클라우드** | AWS Bedrock, Azure OpenAI, Google Vertex AI | 클라우드 인증 |
| **게이트웨이** | OpenRouter, Helicone, HuggingFace | 게이트웨이 API Key |
| **로컬** | Ollama, LM Studio | LOCAL_ENDPOINT |
| **구독** | GitHub Copilot, GitLab Duo | OAuth / Token |

### 4.2 모델 추천 매트릭스

```
예산별:
├── 무료        → Big Pickle (build) + Big Pickle (plan)
├── $5-10/월    → MiniMax M2.5 (build) + Big Pickle (plan)
├── $20-50/월   → Sonnet 4.5 (build) + Flash (plan)
└── $50+/월     → Sonnet 4.5 (build) + Opus 4.6 (plan, reasoningEffort: high)

용도별:
├── 코드 생성    → Sonnet 4.5, MiniMax M2.5, Gemini 2.5 Pro
├── 계획/설계    → Opus 4.6, Gemini 2.5 Pro (thinking), Kimi K2.5
├── 빠른 반복    → Haiku 4.5, Flash, Big Pickle
└── 범용         → Sonnet 4.5 (build) + Flash (plan)
```

### 4.3 프리셋

```jsonc
// "budget" — 무료
{ "agent": { "build": { "model": "opencode/big-pickle" }, "plan": { "model": "opencode/big-pickle" } } }

// "balanced" — 추천 기본값
{ "agent": { "build": { "model": "anthropic/claude-sonnet-4-5" }, "plan": { "model": "google/gemini-2.5-flash" } } }

// "power" — 최고 성능
{ "agent": { "build": { "model": "anthropic/claude-sonnet-4-5" }, "plan": { "model": "anthropic/claude-opus-4-6", "reasoningEffort": "high" } } }

// "minimax" — 비용 대비 성능 최적
{ "agent": { "build": { "model": "minimax/minimax-m2.5" }, "plan": { "model": "opencode/big-pickle" } } }

// "google-only"
{ "agent": { "build": { "model": "google/gemini-2.5-pro" }, "plan": { "model": "google/gemini-2.5-flash" } } }

// "local" — 프라이버시 우선
{ "agent": { "build": { "model": "local.{user_model}" }, "plan": { "model": "local.{user_model}" } } }
```

### 4.4 스택별 프리셋 (모델 + AGENTS.md + commands + skills)

| 프리셋 | 포함 내용 |
|--------|-----------|
| `frontend-ts` | Next.js/React AGENTS.md, biome/vitest/playwright commands, frontend-design skill |
| `backend-go` | Go REST API AGENTS.md, golangci-lint/go test commands |
| `backend-python` | FastAPI AGENTS.md, ruff/pytest commands |
| `fullstack` | 풀스택 AGENTS.md, 프론트+백엔드 commands 통합 |

---

## 5. 플러그인 & Skill & OMO 통합 (v2 신규)

### 5.1 플러그인 추천 시스템

`opencode-setup init` 과정에서 사용자에게 인기 플러그인 설치를 제안한다.

**추천 플러그인 목록:**

| 플러그인 | 설명 | 추천 대상 |
|----------|------|-----------|
| `oh-my-opencode` | 멀티 에이전트 오케스트레이션 (Sisyphus, Prometheus, Hephaestus) | 중급 이상, oh-my-claude-code 사용자 |
| `opencode-skillful` | Skill 발견/로딩 확장 | skill을 적극 활용하는 사용자 |
| `opencode-wakatime` | 코딩 시간 추적 | WakaTime 사용자 |
| `opencode-helicone-session` | LLM 옵저버빌리티 | 비용 추적이 필요한 사용자 |

opencode-setup이 하는 일:
1. 사용자에게 플러그인 목록 제시 → 선택
2. opencode.json의 `"plugin"` 배열에 선택된 플러그인 추가
3. OMO 선택 시 → OMO 기본 설정 (에이전트 모델 매핑) 자동 생성

### 5.2 OMO 프리셋 (oh-my-claude-code → oh-my-opencode 전환)

Claude Code에서 oh-my-claude-code를 사용하던 사용자를 위한 전용 전환 플로우:

```jsonc
// opencode.json에 추가
{
  "plugin": ["oh-my-opencode"]
}

// ~/.config/opencode/oh-my-opencode.json 생성
{
  "agents": {
    "sisyphus": { "model": "anthropic/claude-opus-4-6" },
    "hephaestus": { "model": "openai/gpt-5.4" },
    "prometheus": { "model": "anthropic/claude-opus-4-6" },
    "atlas": { "model": "anthropic/claude-sonnet-4-5" },
    "oracle": { "model": "anthropic/claude-sonnet-4-5" },
    "librarian": { "model": "google/gemini-2.5-flash" }
  },
  "categories": {
    "visual-engineering": { "model": "google/gemini-2.5-pro" },
    "business-logic": { "model": "anthropic/claude-sonnet-4-5" }
  }
}
```

예산이 제한적인 경우 무료 모델 매핑:
```jsonc
{
  "agents": {
    "sisyphus": { "model": "opencode/big-pickle" },
    "hephaestus": { "model": "opencode/big-pickle" },
    "prometheus": { "model": "opencode/big-pickle" }
  }
}
```

### 5.3 Skill 시스템 통합

OpenCode의 네이티브 skill은 `.opencode/skills/*/SKILL.md` 경로에서 자동 발견된다.
opencode-setup은 스택에 맞는 기본 skill을 생성한다.

**생성하는 skill 예시:**

```
.opencode/skills/
├── code-review/
│   └── SKILL.md       # 코드 리뷰 전문 지식
├── testing/
│   └── SKILL.md       # 테스트 작성 가이드
└── frontend-design/
    └── SKILL.md       # UI/UX 디자인 가이드 (프론트엔드 프리셋 시)
```

Claude Code에서 마이그레이션 시:
```
.claude/skills/*/SKILL.md → .opencode/skills/*/SKILL.md (경로 복사)
```

---

## 6. CLI 서브커맨드 & 플러그인 Tool 명세

### 6.1 이중 인터페이스

| CLI 커맨드 | 플러그인 Tool | 설명 |
|-----------|--------------|------|
| `npx opencode-setup init` | `setup_init` | 대화형 초기 세팅 |
| `npx opencode-setup preset list` | `setup_preset_list` | 프리셋 목록 |
| `npx opencode-setup preset apply <n>` | `setup_preset_apply` | 프리셋 적용 |
| `npx opencode-setup migrate claude-code` | `setup_migrate` | 마이그레이션 |
| `npx opencode-setup validate` | `setup_validate` | 설정 검증 |
| `npx opencode-setup doctor` | `setup_doctor` | 환경 진단 |

플러그인 모드에서는 OpenCode 안에서 AI가 직접 tool을 호출할 수 있다.
예: "내 환경을 진단해줘" → AI가 `setup_doctor` tool 호출 → 결과 출력

### 6.2 `setup_init` — 메인 대화형 플로우

```
Step 1: 기본 정보
  ├── "AI 코딩 도구를 사용한 적이 있나요?"
  │   ├── 예 → 어떤 도구? → migrate 서브플로우
  │   └── 아니오 → 신규 사용자 플로우

Step 2: Provider 선택 & 인증
  ├── "어떤 AI 서비스를 사용하시겠습니까?" (복수 선택)
  │   ├── OpenCode Go (무료)
  │   ├── OpenCode Zen (유료 큐레이션)
  │   ├── Anthropic (Claude)
  │   ├── Google (Gemini)
  │   ├── OpenAI
  │   ├── 로컬 모델 (Ollama/LM Studio)
  │   └── 기타
  │
  ├── 선택된 provider별 인증 안내
  │   └── "/connect 명령을 실행해서 {provider}에 인증하세요"
  │       또는 "환경변수 {ENV_VAR}를 설정하세요"
  │   └── (v2 추가) /connect 실행 여부 확인 → 건너뛰기 가능

Step 3: 모델 설정
  ├── "주로 어떤 작업을 하시나요?"
  ├── "월 예산은?"
  └── → 추천 모델 조합 제시 → 사용자 확인/수정

Step 4: 플러그인 선택 (v2 추가)
  ├── "플러그인을 설치하시겠습니까?"
  │   ├── oh-my-opencode (멀티 에이전트 오케스트레이션) — 추천
  │   ├── opencode-skillful (Skill 관리 확장)
  │   ├── opencode-wakatime (시간 추적)
  │   └── 건너뛰기
  │
  ├── OMO 선택 시 → 에이전트 모델 매핑 자동 설정

Step 5: 프로젝트 설정
  ├── "프로젝트 언어/프레임워크는?"
  ├── "테스트 도구는?"
  ├── "린트/포맷터는?"
  ├── "MCP 서버를 연결하시겠습니까?" (Figma, Notion, GitHub, Sentry 등)
  ├── "프로젝트 규모는?" (단일, 모노레포)
  │   └── 모노레포 → instructions 필드에 "packages/*/AGENTS.md" 추가
  └── AGENTS.md, 프로젝트 opencode.json, skills, commands 생성

Step 6: Permission 설정
  ├── "자동화 수준을 선택해주세요"
  │   ├── 안전 — 모든 작업 확인 (신규 추천)
  │   ├── 균형 — 읽기/쓰기 허용, 위험 명령만 확인
  │   └── 자동 — 대부분 자동 승인 (숙련 사용자)

Step 7: 확인 & 생성
  ├── 생성될 파일 목록 미리보기
  ├── 사용자 확인
  └── 파일 생성 + 검증
```

### 6.3 `setup_migrate` — 마이그레이션

**Claude Code 탐색 대상:**
- `CLAUDE.md` → `AGENTS.md` (내용 보존)
- `.claude/skills/*/SKILL.md` → `.opencode/skills/*/SKILL.md` (**경로 복사**)
- `.claude/hooks/` → plugin hooks + commands (가능한 것만 변환, 나머지 경고)
- `.claude/rules/` → `AGENTS.md` ## Rules 섹션 병합
- `.mcp.json` 또는 `claude_desktop_config.json` → opencode.json `mcp` 섹션
- oh-my-claude-code 감지 → oh-my-opencode 설치 제안 + 에이전트 매핑

**Cursor 탐색 대상:**
- `.cursorrules` → `AGENTS.md`
- `.cursor/` 디렉토리 → 설정 탐색

**Aider 탐색 대상:**
- `.aider.conf.yml` → `opencode.json` (모델, provider)
- conventions 파일 → `AGENTS.md`

### 6.4 `setup_doctor` — 환경 진단

체크 항목:
- OpenCode 설치 여부 및 버전
- Node.js / Bun 버전
- API 키 환경변수 존재 여부 (값 노출 안 함)
- /connect 인증 상태 (auth.json 존재 확인)
- 설정된 모델 접근성
- MCP 서버 연결 상태
- LSP 서버 가용성 (gopls, typescript-language-server 등)
- 플러그인 로드 상태
- Skill 파일 유효성

---

## 7. 프로젝트 디렉토리 구조

```
opencode-setup/
├── package.json
├── tsconfig.json
├── bun.lock
├── DESIGN.md                        # 이 문서
├── AGENTS.md                        # OpenCode용 프로젝트 규칙
├── README.md
├── LICENSE                          # MIT
│
├── src/
│   ├── index.ts                     # 플러그인 진입점 (Plugin export)
│   ├── cli.ts                       # CLI 진입점 (npx opencode-setup)
│   │
│   ├── tools/                       # 플러그인 tool 정의
│   │   ├── setup-init.ts            # setup_init tool
│   │   ├── setup-preset.ts          # setup_preset_list, setup_preset_apply
│   │   ├── setup-migrate.ts         # setup_migrate tool
│   │   ├── setup-validate.ts        # setup_validate tool
│   │   └── setup-doctor.ts          # setup_doctor tool
│   │
│   ├── core/                        # 비즈니스 로직 (tool과 CLI 공유)
│   │   ├── config-generator.ts      # opencode.json 생성
│   │   ├── agents-md-generator.ts   # AGENTS.md 생성
│   │   ├── command-generator.ts     # 커스텀 커맨드 .md 생성
│   │   ├── skill-generator.ts       # Skill SKILL.md 생성
│   │   ├── agent-generator.ts       # 커스텀 에이전트 .md 생성
│   │   └── env-generator.ts         # .env.example 생성
│   │
│   ├── migrate/                     # 마이그레이션 로직
│   │   ├── claude-code.ts           # Claude Code → OpenCode
│   │   ├── cursor.ts                # Cursor → OpenCode
│   │   ├── aider.ts                 # Aider → OpenCode
│   │   └── common.ts               # 공통 유틸
│   │
│   ├── preset/                      # 프리셋 정의
│   │   ├── registry.ts              # 프리셋 레지스트리
│   │   ├── model-presets.ts         # 모델 조합 프리셋 (budget, balanced, power 등)
│   │   └── stack-presets.ts         # 스택별 프리셋 (frontend-ts, backend-go 등)
│   │
│   ├── provider/                    # Provider/모델 관리
│   │   ├── registry.ts              # 지원 provider 목록
│   │   └── recommend.ts             # 모델 추천 로직
│   │
│   ├── prompt/                      # 대화형 프롬프트
│   │   ├── wizard.ts                # init 위자드 메인 플로우
│   │   └── questions.ts             # 질문 정의
│   │
│   ├── doctor/                      # 환경 진단
│   │   ├── checks.ts                # 진단 항목
│   │   └── reporter.ts              # 결과 출력
│   │
│   ├── validator/                   # 설정 검증
│   │   └── config-validator.ts      # opencode.json, AGENTS.md 검증
│   │
│   └── types/                       # 타입 정의
│       ├── user-profile.ts          # 사용자 입력 모델
│       ├── opencode-config.ts       # opencode.json 타입
│       └── migration.ts             # 마이그레이션 타입
│
├── templates/                       # 내장 템플릿
│   ├── agents-md/                   # AGENTS.md 템플릿
│   │   ├── base.md                  # 기본 구조
│   │   ├── frontend-ts.md           # TypeScript/React/Next.js
│   │   ├── backend-go.md            # Go 백엔드
│   │   ├── backend-python.md        # Python/FastAPI
│   │   └── fullstack.md             # 풀스택
│   │
│   ├── agents/                      # 커스텀 에이전트 템플릿
│   │   ├── reviewer.md              # 코드 리뷰 에이전트
│   │   ├── tester.md                # 테스트 작성 에이전트
│   │   └── planner.md               # 계획 수립 에이전트
│   │
│   ├── commands/                    # 커스텀 커맨드 템플릿
│   │   ├── test.md
│   │   ├── lint.md
│   │   ├── review.md
│   │   └── plan.md
│   │
│   ├── skills/                      # Skill 템플릿
│   │   ├── code-review/SKILL.md
│   │   ├── testing/SKILL.md
│   │   └── frontend-design/SKILL.md
│   │
│   └── configs/                     # opencode.json 프리셋 템플릿
│       ├── budget.json
│       ├── balanced.json
│       └── power.json
│
└── test/                            # 테스트
    ├── tools/                       # tool 단위 테스트
    ├── core/                        # 비즈니스 로직 테스트
    ├── migrate/                     # 마이그레이션 테스트
    └── fixtures/                    # 테스트용 샘플 데이터
        ├── claude-code/             # Claude Code 설정 샘플
        ├── cursor/                  # Cursor 설정 샘플
        └── aider/                   # Aider 설정 샘플
```

---

## 8. 핵심 타입 정의

### 8.1 사용자 입력

```typescript
type ExperienceLevel = "new" | "beginner" | "intermediate" | "advanced"
type PreviousTool = "none" | "claude-code" | "cursor" | "aider" | "other"
type BudgetTier = "free" | "low" | "mid" | "high"
type PermissionLevel = "safe" | "balanced" | "auto"
type ProjectScale = "single" | "monorepo"

interface UserProfile {
  experienceLevel: ExperienceLevel
  previousTool: PreviousTool

  providers: string[]          // ["anthropic", "google", "opencode-go", ...]
  budget: BudgetTier

  projectLanguage: string      // "typescript", "go", "python"
  projectFramework: string     // "nextjs", "fastapi", "gin"
  testRunner: string           // "vitest", "jest", "pytest"
  linter: string               // "biome", "eslint", "golangci-lint"
  projectScale: ProjectScale

  mcpServers: MCPServerChoice[]
  plugins: string[]            // ["oh-my-opencode", "opencode-skillful", ...]
  permissionLevel: PermissionLevel

  migrationSource?: MigrationSource
}

interface MCPServerChoice {
  name: string                 // "figma", "notion", "github", "sentry"
  config: Record<string, unknown>
}
```

### 8.2 OpenCode Config

```typescript
interface OpenCodeConfig {
  $schema: string
  model?: string
  provider?: Record<string, ProviderConfig>
  permission?: PermissionConfig
  agent?: Record<string, AgentConfig>
  default_agent?: string
  command?: Record<string, CommandConfig>
  mcp?: Record<string, MCPConfig>
  lsp?: Record<string, LSPConfig>
  plugin?: string[]
  instructions?: string[]
  theme?: string
  autoupdate?: boolean
}

interface ProviderConfig {
  options?: { apiKey?: string; baseURL?: string }
  models?: Record<string, { id: string; name: string }>
}

interface AgentConfig {
  description?: string
  model?: string
  prompt?: string
  temperature?: number
  reasoningEffort?: "low" | "medium" | "high"
}

interface PermissionConfig {
  edit?: "allow" | "ask" | "deny"
  bash?: Record<string, "allow" | "ask" | "deny">
  webfetch?: "allow" | "ask" | "deny"
}

interface MCPConfig {
  type: "sse" | "stdio"
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
}

interface LSPConfig {
  disabled?: boolean
  command: string
  args?: string[]
}

interface CommandConfig {
  template: string
  description?: string
  agent?: string
  model?: string
}
```

### 8.3 마이그레이션

```typescript
interface MigrationSource {
  tool: PreviousTool
  rootPath: string

  // Claude Code
  claudeMD?: string
  skills?: string[]            // .claude/skills/*/SKILL.md 경로들
  hooks?: string[]
  rules?: string[]
  mcpConfig?: string           // .mcp.json 경로
  hasOMCC?: boolean            // oh-my-claude-code 감지 여부

  // Cursor
  cursorRules?: string

  // Aider
  aiderConfig?: string
  conventions?: string
}

interface MigrationResult {
  agentsMD: string
  config: OpenCodeConfig
  copiedSkills: string[]       // 복사된 skill 경로들
  customAgents: Record<string, string>
  customCommands: Record<string, string>
  warnings: string[]           // 변환 불가능한 항목
  pluginSuggestions: string[]  // 추천 플러그인
  envVars: Record<string, string>
}
```

---

## 9. 플러그인 진입점 구조

### 9.1 src/index.ts — 플러그인 등록

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { setupInit } from "./tools/setup-init"
import { setupPresetList, setupPresetApply } from "./tools/setup-preset"
import { setupMigrate } from "./tools/setup-migrate"
import { setupValidate } from "./tools/setup-validate"
import { setupDoctor } from "./tools/setup-doctor"

export const OcSetupPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      setup_init: setupInit(ctx),
      setup_preset_list: setupPresetList(ctx),
      setup_preset_apply: setupPresetApply(ctx),
      setup_migrate: setupMigrate(ctx),
      setup_validate: setupValidate(ctx),
      setup_doctor: setupDoctor(ctx),
    },
  }
}
```

### 9.2 Tool 예시 — setup_doctor

```typescript
import { tool } from "@opencode-ai/plugin"
import type { PluginContext } from "../types"
import { runAllChecks } from "../doctor/checks"
import { formatReport } from "../doctor/reporter"

export const setupDoctor = (ctx: PluginContext) =>
  tool({
    description: "OpenCode 환경을 진단합니다. 설치 상태, API 키, 모델 접근성, MCP 연결, LSP, 플러그인을 확인합니다.",
    args: {},
    async execute(args, context) {
      const results = await runAllChecks(ctx, context.directory)
      return formatReport(results)
    },
  })
```

### 9.3 src/cli.ts — CLI 진입점

```typescript
#!/usr/bin/env node
import { Command } from "commander"
import { runInitWizard } from "./prompt/wizard"
import { listPresets, applyPreset } from "./preset/registry"
import { runMigration } from "./migrate/common"
import { runValidation } from "./validator/config-validator"
import { runDoctor } from "./doctor/checks"

const program = new Command()

program.name("opencode-setup").description("OpenCode 초기 환경 세팅 도구").version("0.1.0")

program.command("init").description("대화형 초기 세팅").action(runInitWizard)
program.command("preset")
  .command("list").description("프리셋 목록").action(listPresets)
program.command("preset")
  .command("apply <name>").description("프리셋 적용").action(applyPreset)
program.command("migrate <tool>").description("기존 도구 마이그레이션").action(runMigration)
program.command("validate").description("설정 검증").action(runValidation)
program.command("doctor").description("환경 진단").action(runDoctor)

program.parse()
```

---

## 10. AGENTS.md 템플릿 예시

### 10.1 프론트엔드 TypeScript (frontend-ts 프리셋)

```markdown
# {{projectName}}

TypeScript + Next.js 프로젝트. App Router 사용.

## Project Structure

- `src/app/` - App Router 페이지 및 레이아웃
- `src/components/` - 재사용 컴포넌트
- `src/lib/` - 유틸리티, API 클라이언트
- `src/hooks/` - 커스텀 React 훅
- `src/types/` - TypeScript 타입 정의

## Code Standards

- TypeScript strict mode 활성화
- 함수형 컴포넌트 + React hooks 사용
- 네이밍: PascalCase (컴포넌트), camelCase (함수/변수), kebab-case (파일)
- 서버 컴포넌트 기본, 클라이언트는 필요시에만 'use client'

## Testing

- 테스트 러너: {{testRunner}}
- E2E: playwright
- 린트/포맷: {{linter}}
- 4단계: lint check → unit → integration → e2e

## Development Workflow

1. Plan 모드에서 기능 계획 수립
2. Build 모드에서 구현
3. /test 커맨드로 테스트 실행
4. /review 커맨드로 코드 리뷰
5. 수동 확인 후 커밋

## Rules

- 새 컴포넌트 작성 시 반드시 테스트 파일도 함께 생성
- API 호출은 src/lib/ 내 함수를 통해 수행
- 에러 바운더리를 페이지 단위로 설정
```

---

## 11. 기본 제공 커맨드 & 에이전트 & Skill

### 11.1 커스텀 커맨드

**test.md**
```markdown
Run the full test suite and report results.
If any tests fail, analyze the failure and suggest a fix.
```

**lint.md**
```markdown
Run the linter and fix any auto-fixable issues.
For issues that can't be auto-fixed, explain each one and suggest fixes.
```

**review.md**
```markdown
Review the recent changes (git diff HEAD~1) for:
1. Bugs or logic errors
2. Security concerns
3. Performance issues
4. Missing tests
Provide a summary with severity levels (critical/warning/info).
```

**plan.md**
```markdown
Create a detailed implementation plan for: $FEATURE
Save the plan to .opencode/plans/$FEATURE.md
```

### 11.2 커스텀 에이전트

**reviewer.md**
```markdown
---
description: "코드 리뷰 전문 에이전트"
permission:
  write: deny
  edit: deny
  bash:
    "git diff *": allow
    "git log *": allow
    "*": deny
---
You are a code reviewer. Provide constructive feedback without making direct changes.
```

**tester.md**
```markdown
---
description: "테스트 코드 작성 전문 에이전트"
---
You are a testing specialist. Write comprehensive test cases and run them to verify.
Follow the project's testing conventions in AGENTS.md.
```

### 11.3 기본 Skill

**code-review/SKILL.md**
```markdown
---
name: code-review
description: 코드 리뷰 시 참조하는 체크리스트와 가이드라인
---
# Code Review Checklist
## Security
- SQL injection, XSS, CSRF 취약점 체크
- 민감한 데이터 노출 여부
## Performance
- N+1 쿼리, 불필요한 리렌더링, 메모리 누수
## Maintainability
- 단일 책임 원칙, 함수 길이, 네이밍 일관성
```

---

## 12. 개발 Phase 계획

### Phase 1 ✅ (이 문서)
- 아키텍처 설계 (TS 플러그인 + CLI)
- 타입 정의
- CLI/Tool 명세
- 개념 매핑 (v2 수정)
- 플러그인/Skill/OMO 통합 설계
- 템플릿 설계

### Phase 2 (OpenCode에서 구현 — MiniMax M2.5 메인)

```
Step 1: 프로젝트 초기화 (M2.5 — Plan 모드)
  → npm init, tsconfig, package.json, 디렉토리 생성
  → @opencode-ai/plugin 설치
  프롬프트: "DESIGN.md 섹션 7 구조대로 프로젝트를 초기화해줘.
    package.json, tsconfig.json, src/index.ts 플러그인 진입점을 만들어줘."

Step 2: 타입 정의 (Big Pickle 가능)
  → src/types/ 의 모든 interface
  프롬프트: "DESIGN.md 섹션 8의 타입들을 src/types/에 구현해줘."

Step 3: 템플릿 파일 작성 (Big Pickle 가능)
  → templates/ 에 .md 파일들 생성
  프롬프트: "DESIGN.md 섹션 10, 11의 템플릿들을 templates/에 만들어줘."

Step 4: preset 구현 (M2.5)
  → src/preset/ + src/tools/setup-preset.ts
  프롬프트: "DESIGN.md 섹션 4.3, 4.4의 프리셋을 구현하고 setup_preset tool을 만들어줘."

Step 5: validate & doctor (M2.5)
  → src/validator/ + src/doctor/ + tool 연결
  프롬프트: "DESIGN.md 섹션 6.4의 doctor와 validate를 구현해줘."

Step 6: config/agents-md/command/skill 생성 로직 (M2.5)
  → src/core/ 전체
  프롬프트: "DESIGN.md 섹션 2.3의 opencode.json 생성과
    AGENTS.md 생성 로직을 src/core/에 구현해줘."

Step 7: init 위자드 (M2.5 — 가장 복잡)
  → src/prompt/ + src/tools/setup-init.ts
  프롬프트: "DESIGN.md 섹션 6.2의 init 플로우를 구현해줘.
    CLI 모드에서는 @inquirer/prompts, 플러그인 모드에서는 텍스트 리턴."

Step 8: migrate 구현 (M2.5)
  → src/migrate/ + src/tools/setup-migrate.ts
  프롬프트: "DESIGN.md 섹션 3, 6.3을 참고해서 Claude Code 마이그레이션을 구현해줘."

Step 9: CLI 진입점 (Big Pickle 가능)
  → src/cli.ts (commander 기반)
  프롬프트: "DESIGN.md 섹션 9.3의 CLI 진입점을 구현해줘."
```

### Phase 3 (테스트 & 배포)

```
Step 1: 단위 테스트 (bun:test)
Step 2: 통합 테스트 (init 플로우 E2E)
Step 3: README.md 작성
Step 4: npm publish + GitHub Release
```

---

## 13. 기술 스택

| 항목 | 선택 | 근거 |
|------|------|------|
| 언어 | TypeScript | OpenCode 플러그인 생태계 호환 |
| 런타임 | Bun | OpenCode가 Bun 기반 |
| 플러그인 SDK | @opencode-ai/plugin | 공식 플러그인 API |
| CLI 프레임워크 | commander | 가볍고 성숙한 CLI 라이브러리 |
| 인터랙티브 폼 | @inquirer/prompts | CLI 모드용 대화형 프롬프트 |
| 스키마 검증 | zod | 플러그인 SDK가 zod 기반 |
| YAML 파싱 | yaml (npm) | Aider 설정 파싱용 |
| 테스트 | bun:test | Bun 내장 테스트 러너 |
| 빌드 | tsup 또는 bun build | npm 배포용 번들 |
| 배포 | npm publish | npm 레지스트리 |
| 라이선스 | MIT | OpenCode와 동일 |

---

## 14. 개발 시 모델 배정 가이드

| 작업 | 모델 | 이유 |
|------|------|------|
| Plan 모드 (설계, 복잡한 논의) | MiniMax M2.5 | spec-writing 능력, 아키텍처 이해 |
| 핵심 로직 구현 (init 위자드, migrate) | MiniMax M2.5 | 복잡한 플로우, 엣지 케이스 처리 |
| 타입 정의, 템플릿 작성 | Big Pickle | 단순 패턴, 텍스트 기반 |
| 테스트 작성 | Big Pickle | 패턴화된 코드 |
| CLI 연결, 보일러플레이트 | Big Pickle | 단순 코드 생성 |
| 문서 작성 | Nemotron 3 또는 M2.5 | 텍스트 생성 |

---

*이 문서의 끝. Phase 2는 이 문서를 프로젝트 루트에 놓고 섹션 12의 순서대로 진행하세요.*
