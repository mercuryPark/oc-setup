> **한국어** | [English](./README.en.md)

<div align="center">

# @hoyeon0722/opencode-setup

**OpenCode 환경 세팅, 한 번의 실행으로.**

[![npm version](https://img.shields.io/npm/v/@hoyeon0722/opencode-setup?color=cb3837)](https://www.npmjs.com/package/@hoyeon0722/opencode-setup)
[![npm downloads](https://img.shields.io/npm/dm/@hoyeon0722/opencode-setup)](https://www.npmjs.com/package/@hoyeon0722/opencode-setup)
[![CI](https://github.com/mercuryPark/oc-setup/actions/workflows/ci.yml/badge.svg)](https://github.com/mercuryPark/oc-setup/actions/workflows/ci.yml)
[![coverage](https://codecov.io/gh/mercuryPark/oc-setup/branch/master/graph/badge.svg)](https://codecov.io/gh/mercuryPark/oc-setup)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![install size](https://packagephobia.com/badge?p=@hoyeon0722/opencode-setup)](https://packagephobia.com/result?p=@hoyeon0722/opencode-setup)
![No Telemetry](https://img.shields.io/badge/telemetry-none-success)

</div>

---

## 빠른 시작

```bash
npx @hoyeon0722/opencode-setup init
```

대화형 마법사가 시작됩니다. Provider 선택, 모델 설정, 에이전트, Skill, 권한까지 — 필요한 모든 파일을 생성합니다.

---

## 왜 필요한가

OpenCode는 75개 이상의 Provider와 수십 개의 설정 옵션을 지원합니다. 자유도가 높은 만큼, 처음 시작할 때 이런 질문들이 생깁니다:

- 어떤 모델을 써야 하지? build와 plan에 다른 모델을 넣어야 하나?
- opencode.json은 어떻게 작성하지?
- AGENTS.md에 뭘 써야 하지?
- oh-my-opencode는 어떻게 설정하지?
- Claude Code에서 쓰던 CLAUDE.md, skill, MCP 설정은 어떻게 옮기지?

`opencode-setup`은 이 모든 질문에 대해 대화형으로 답을 수집하고, 최적의 설정 파일을 자동 생성합니다.

---

## 주요 기능

- **17개 Skill 템플릿**: socket-io, payment-gateway, seo-optimization 등 6개 기능 영역 커버
- **13개 전문 에이전트**: websocket-expert, payment-expert, security-reviewer 등
- **MCP 서버 자동 설정**: Figma, GitHub, Notion 등 10개 서버 완전한 설정
- **Claude Code 마이그레이션**: CLAUDE.md → AGENTS.md, skills 복사, rules 병합, hook 변환

[설치](#설치) • [사용법](#사용법) • [CLI 레퍼런스](#cli-레퍼런스) • [설계 문서](./DESIGN.md)

---

## 설치

### 방법 1: OpenCode 플러그인 (추천)

`opencode.json`에 추가:
```json
{
  "plugin": ["@hoyeon0722/opencode-setup"]
}
```

OpenCode를 재시작하면 자동 로드됩니다. OpenCode 안에서 AI에게 "내 환경을 세팅해줘"라고 말하면 `setup_init` tool이 실행됩니다.

### 방법 2: 독립 CLI

```bash
npx @hoyeon0722/opencode-setup init
```

---

## 사용법

### 시나리오 1 — 처음인 경우

```bash
npx @hoyeon0722/opencode-setup init
```

대화형 마법사가 실행됩니다:
- AI 서비스 선택 (OpenCode Go, Anthropic, Google, OpenAI 등)
- 월 예산 선택 (무료 ~ $50+)
- 프로젝트 언어/프레임워크
- 플러그인 선택
- 자동화 수준 (안전/균형/자동)

### 시나리오 2 — 프리셋으로 빠르게 세팅

```bash
npx oc-setup preset list
npx oc-setup preset apply frontend-ts
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
npx oc-setup validate
```

---

## CLI 레퍼런스

| CLI | 플러그인 Tool | 설명 |
|-----|--------------|------|
| `oc-setup init` | `setup_init` | 대화형 초기 세팅 |
| `oc-setup preset list` | `setup_preset_list` | 프리셋 목록 |
| `oc-setup preset apply <name>` | `setup_preset_apply` | 프리셋 적용 |
| `oc-setup migrate <tool>` | `setup_migrate` | Claude Code, Cursor, Aider 설정 마이그레이션 |
| `oc-setup validate` | `setup_validate` | 설정 검증 |
| `oc-setup doctor` | `setup_doctor` | 환경 진단 |

---

## Claude Code 마이그레이션 가이드

| Claude Code | OpenCode | 비고 |
|-------------|----------|------|
| CLAUDE.md | AGENTS.md | 파일명만 변경 |
| skill (SKILL.md) | skill (.opencode/skills/) | 경로 복사 (네이티브 호환) |
| hook | plugin hook + command | 자동→plugin, 수동→command |
| rule | AGENTS.md Rules 섹션 | 규칙 병합 |
| oh-my-claude-code | oh-my-opencode | 플러그인 설치 + 에이전트 매핑 |
| MCP 서버 | opencode.json mcp | 설정 구조 변환 |
| extended thinking | reasoningEffort | high / medium / low |

---

## 생성되는 파일

```
~/.config/opencode/
  opencode.json           글로벌 (Provider, 모델, 테마, 플러그인)

{project}/
  opencode.json           프로젝트 (권한, MCP, LSP, 에이전트 오버라이드)
  AGENTS.md               프로젝트 규칙, 코딩 표준
  .env.example            환경변수 템플릿
  .opencode/
    agents/               커스텀 에이전트 (reviewer, tester, planner)
    commands/             커스텀 커맨드 (/test, /lint, /review, /plan)
    skills/               Skill (code-review, testing, frontend-design)
```

---

## CLI 플래그

모든 명령어는 다음 전역 플래그를 지원합니다:

| 플래그 | 설명 |
|--------|------|
| `--json` | 머신이 읽을 수 있는 JSON 출력 |
| `-q, --quiet` | 정보 출력 숨김 |
| `-v, --verbose` | 상세 출력 표시 |

---

## 프라이버시

- **텔레메트리 없음.** 이 도구는 어떠한 데이터도 수집하거나 전송하지 않습니다.
- **네트워크 호출 없음.** 로컬 파일 조작만 수행합니다.
- **분석 없음.** 추적, 메트릭, 데이터 수집 제로.

설정 데이터는 사용자의 머신에만 저장됩니다.

---

## 개발

```bash
git clone https://github.com/mercuryPark/oc-setup.git
cd oc-setup
npm install
npm run build
npm run test
```

Node.js >= 20 필요.

---

## 라이선스

[MIT](./LICENSE)

---

<div align="center">

**Zero learning curve. Maximum power.**

<a href="https://github.com/mercuryPark/oc-setup/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mercuryPark/oc-setup" />
</a>

</div>
