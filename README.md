# oc-setup

[![npm version](https://img.shields.io/npm/v/oc-setup?color=cb3837)](https://www.npmjs.com/package/oc-setup)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **OpenCode 환경 세팅, 한 번의 실행으로.**

`oc-setup`은 OpenCode의 초기 환경 세팅을 대화형으로 도와주는 **플러그인 겸 CLI 도구**입니다. 모델 선택, 프로젝트 규칙, 커스텀 에이전트, 플러그인, Skill, 권한 설정까지 — 문서를 읽고 직접 JSON을 작성하는 과정을 한 번의 실행으로 대체합니다.

[설치](#설치) • [사용법](#사용법) • [CLI 레퍼런스](#cli-레퍼런스) • [설계 문서](./DESIGN.md)

---

## 왜 필요한가

OpenCode는 75개 이상의 Provider와 수십 개의 설정 옵션을 지원합니다. 자유도가 높은 만큼, 처음 시작할 때 이런 질문들이 생깁니다:

- 어떤 모델을 써야 하지? build와 plan에 다른 모델을 넣어야 하나?
- opencode.json은 어떻게 작성하지?
- AGENTS.md에 뭘 써야 하지?
- oh-my-opencode는 어떻게 설정하지?
- Claude Code에서 쓰던 CLAUDE.md, skill, MCP 설정은 어떻게 옮기지?

`oc-setup`은 이 모든 질문에 대해 대화형으로 답을 수집하고, 최적의 설정 파일을 자동 생성합니다.

## 빠른 시작

### Step 1: 설치

```bash
# OpenCode 플러그인 (추천)
npm install oc-setup

# 또는 npx로 직접 실행
npx oc-setup init
```

### Step 2: 초기화

```bash
# 대화형 위자드 실행
npx oc-setup init

# 또는 프리셋만 적용
npx oc-setup preset list
npx oc-setup preset apply frontend-ts
```

### Step 3: 시작

OpenCode를 재시작하면 바로 작업을 시작할 수 있습니다!

## 설치

### 방법 1: OpenCode 플러그인 (추천)

`opencode.json`에 추가:
```json
{
  "plugin": ["oc-setup"]
}
```

OpenCode를 재시작하면 자동 로드됩니다. OpenCode 안에서 AI에게 "내 환경을 세팅해줘"라고 말하면 `setup_init` tool이 실행됩니다.

### 방법 2: 독립 CLI

```bash
npm install -g oc-setup
oc-setup init
```

OpenCode 설정이 아직 없는 신규 사용자도 이 방법으로 바로 시작할 수 있습니다.

## 사용법

### 시나리오 1 — AI 코딩 도구가 처음인 경우

```bash
npx oc-setup init
```

대화형 위자드가 실행됩니다:
- AI 서비스 선택 (OpenCode Go, Anthropic, Google, OpenAI 등)
- 월 예산 선택 (무료 ~ $50+)
- 프로젝트 언어/프레임워크
- 플러그인 선택
- 자동화 수준 (안전/균형/자동)

결과로 생성되는 파일:
```
~/.config/opencode/opencode.json     글로벌 설정
./opencode.json                       프로젝트 설정
./AGENTS.md                           프로젝트 규칙
./.opencode/agents/                   커스텀 에이전트
./.opencode/commands/                 커스텀 커맨드
./.opencode/skills/                   Skill
./.env.example                        환경변수 템플릿
```

### 시나리오 2 — 프리셋으로 빠르게 세팅

```bash
# 프리셋 목록 확인
npx oc-setup preset list

# 프리셋 적용
npx oc-setup preset apply frontend-ts
npx oc-setup preset apply backend-go
npx oc-setup preset apply balanced
```

**모델 프리셋:**
| 프리셋 | 설명 | 월 비용 |
|--------|------|---------|
| `budget` | Big Pickle 무료 조합 | 무료 ~ $10 |
| `balanced` | Sonnet + Flash (추천) | $20 ~ $40 |
| `power` | Sonnet + Opus | $50+ |
| `minimax` | M2.5 + Big Pickle | $5 ~ $15 |
| `google-only` | Gemini Pro + Flash | $15 ~ $30 |

**스택 프리셋:**
| 프리셋 | 설명 |
|--------|------|
| `frontend-ts` | TypeScript/React/Next.js 최적화 |
| `backend-go` | Go 백엔드 최적화 |
| `backend-python` | Python/FastAPI 최적화 |
| `fullstack` | 풀스택 프로젝트 최적화 |

### 시나리오 3 — 환경 진단

```bash
npx oc-setup doctor
```

OpenCode, Bun, API 키, 설정 파일, LSP 서버, 플러그인 상태를 점검합니다.

### 시나리오 4 — 설정 검증

```bash
npx oc-setup validate
```

opencode.json과 AGENTS.md의 구조와 유효성을 검증합니다.

## CLI 레퍼런스

| CLI | 플러그인 Tool | 설명 |
|-----|--------------|------|
| `oc-setup init` | `setup_init` | 대화형 초기 세팅 |
| `oc-setup preset list` | `setup_preset_list` | 프리셋 목록 |
| `oc-setup preset apply <name>` | `setup_preset_apply` | 프리셋 적용 |
| `oc-setup migrate <tool>` | `setup_migrate` | 설정 마이그레이션 (준비 중) |
| `oc-setup validate` | `setup_validate` | 설정 검증 |
| `oc-setup doctor` | `setup_doctor` | 환경 진단 |

## 생성되는 파일

```
~/.config/opencode/
├── opencode.json           글로벌 (Provider, 모델, 테마, 플러그인)
└── tui.json                TUI 설정

{project}/
├── opencode.json           프로젝트 (권한, MCP, LSP, 에이전트 오버라이드)
├── AGENTS.md               프로젝트 규칙, 코딩 표준
├── .env.example            환경변수 템플릿
└── .opencode/
    ├── agents/             커스텀 에이전트 (reviewer, tester, planner)
    ├── commands/           커스텀 커맨드 (/test, /lint, /review, /plan)
    └── skills/             Skill (code-review, testing, frontend-design)
```

## Claude Code 매핑 가이드

| Claude Code | OpenCode | 비고 |
|-------------|----------|------|
| CLAUDE.md | AGENTS.md | 파일명만 변경 |
| skill (SKILL.md) | skill (.opencode/skills/) | 경로 복사 (네이티브 호환) |
| hook | plugin hook + command | 자동→plugin, 수동→command |
| rule | AGENTS.md Rules 섹션 | 규칙 병합 |
| oh-my-claude-code | oh-my-opencode | 플러그인 설치 + 에이전트 매핑 |
| MCP 서버 | opencode.json mcp | 설정 구조 변환 |
| extended thinking | reasoningEffort | high / medium / low |

## 기능

### 대화형 위자드
- 경험 수준 자동 감지
- 마이그레이션 옵션 제공
- Provider & 예산 기반 모델 추천
- 플러그인 & MCP 서버 선택
- 자동화 수준 설정

### 프리셋 시스템
- 5개 모델 프리셋 (budget, balanced, power, minimax, google-only)
- 4개 스택 프리셋 (frontend-ts, backend-go, backend-python, fullstack)
- 템플릿 기반 파일 생성

### 환경 진단
- OpenCode & Bun 설치 상태
- API 키 존재 여부
- 설정 파일 유효성
- LSP 서버 가용성
- 플러그인 상태

### 설정 검증
- opencode.json 스키마 검증
- AGENTS.md 구조 검증
- 권한 설정 유효성

## 개발

```bash
#克隆
git clone https://github.com/mercuryPark/oc-setup.git
cd oc-setup

# 의존성 설치
bun install

# 빌드
bun run build

# 테스트
bun test

# 개발 모드
bun run dev
```

## 라이선스

MIT

---

<div align="center">

**Zero learning curve. Maximum power.**

</div>
