# oc-setup

OpenCode를 설치하고 나서 뭘 해야 할지 모르겠을 때, 이 도구 하나만 실행하면 됩니다.

`oc-setup`은 OpenCode의 초기 환경 세팅을 대화형으로 도와주는 **플러그인 겸 CLI 도구**입니다. 모델 선택, 프로젝트 규칙, 커스텀 에이전트, 플러그인, Skill, 권한 설정까지 — 문서를 읽고 직접 JSON을 작성하는 과정을 한 번의 실행으로 대체합니다.

## 왜 필요한가

OpenCode는 75개 이상의 Provider와 수십 개의 설정 옵션을 지원합니다. 자유도가 높은 만큼, 처음 시작할 때 이런 질문들이 생깁니다:

- 어떤 모델을 써야 하지? build와 plan에 다른 모델을 넣어야 하나?
- opencode.json은 어떻게 작성하지?
- AGENTS.md에 뭘 써야 하지?
- oh-my-opencode는 어떻게 설정하지?
- Claude Code에서 쓰던 CLAUDE.md, skill, MCP 설정은 어떻게 옮기지?

`oc-setup`은 이 모든 질문에 대해 대화형으로 답을 수집하고, 최적의 설정 파일을 자동 생성합니다.

## 설치

### 방법 1: OpenCode 플러그인 (추천)

opencode.json에 추가:
```json
{
  "plugin": ["oc-setup"]
}
```
OpenCode를 재시작하면 자동 설치됩니다. OpenCode 안에서 AI에게 "내 환경을 세팅해줘"라고 말하면 `setup_init` tool이 실행됩니다.

### 방법 2: 독립 CLI

```bash
npx oc-setup init
```
OpenCode 설정이 아직 없는 신규 사용자도 이 방법으로 바로 시작할 수 있습니다.

## 사용법

### 시나리오 1 — AI 코딩 도구가 처음인 경우

```bash
npx oc-setup init
```

```
? AI 코딩 도구를 사용한 적이 있나요?
  ● 아니오

? 어떤 AI 서비스를 사용하시겠습니까?
  ◉ OpenCode Go (무료)

? 월 예산은?
  ● 무료

? 프로젝트의 언어/프레임워크는?
  ● TypeScript + Next.js

? 플러그인을 설치하시겠습니까?
  ◉ oh-my-opencode (멀티 에이전트 오케스트레이션)
  ○ 건너뛰기

? 자동화 수준은?
  ● 안전 (모든 작업 확인 요청)
```

결과:
```
✅ 생성 완료

  ~/.config/opencode/opencode.json     글로벌 설정
  ./opencode.json                       프로젝트 설정 + 플러그인
  ./AGENTS.md                           프로젝트 규칙
  ./.opencode/agents/                   에이전트 (reviewer, tester)
  ./.opencode/commands/                 커맨드 (/test, /lint, /review, /plan)
  ./.opencode/skills/                   Skill (code-review, testing)
  ./.env.example                        환경변수 가이드

이제 opencode를 실행하면 바로 작업을 시작할 수 있습니다.
```

### 시나리오 2 — Claude Code에서 전환하는 경우

```bash
npx oc-setup migrate claude-code
```

```
🔍 Claude Code 설정 파일 탐색 중...

  ✓ CLAUDE.md                  발견
  ✓ .claude/skills/            3개 발견
  ✓ .claude/rules/             2개 발견
  ✓ .mcp.json                  발견 (Figma, Notion)
  ✓ oh-my-claude-code          감지됨
  ⚠ .claude/hooks/             2개 (직접 변환 불가)
```

결과:
```
✅ 마이그레이션 완료

  CLAUDE.md             →  AGENTS.md               (내용 보존)
  .claude/skills/       →  .opencode/skills/        (3개 경로 복사)
  .claude/rules/        →  AGENTS.md ## Rules       (규칙 병합)
  .mcp.json             →  opencode.json mcp 섹션   (Figma, Notion)
  oh-my-claude-code     →  oh-my-opencode 플러그인  (에이전트 매핑)

  ⚠ 수동 확인 필요 (2건):
    • pre-commit hook → .opencode/commands/pre-commit.md로 변환
    • post-save hook → OpenCode 미지원. LSP에서 처리 권장.
```

### 시나리오 3 — 프리셋으로 한 줄 세팅

```bash
npx oc-setup preset list
```

```
NAME              DESCRIPTION                          MONTHLY COST
budget            Big Pickle 무료 조합                  무료 ~ $10
balanced          Sonnet + Flash                       $20 ~ $40
power             Sonnet + Opus                        $50+
minimax           M2.5 + Big Pickle                    $5 ~ $15
google-only       Gemini Pro + Flash                   $15 ~ $30
local             Ollama 기반                           전기세만
frontend-ts       프론트엔드 TS 최적화                  모델에 따름
backend-go        Go 백엔드 최적화                      모델에 따름
fullstack         풀스택 프로젝트 최적화                 모델에 따름
```

```bash
npx oc-setup preset apply frontend-ts
```

### 시나리오 4 — 환경 점검

```bash
npx oc-setup doctor
```

```
🩺 환경 진단 중...

  ✓ OpenCode             v1.3.2
  ✓ Bun                  v1.2.x
  ✓ ANTHROPIC_API_KEY    설정됨
  ✓ Figma MCP            연결 가능
  ✓ oh-my-opencode       플러그인 로드됨
  ✗ typescript-language-server  미설치
    → npm install -g typescript-language-server
  ⚠ Notion MCP           응답 시간 초과
    → API 토큰 확인 필요
```

## 커맨드 요약

| CLI | 플러그인 Tool | 설명 |
|-----|--------------|------|
| `npx oc-setup init` | `setup_init` | 대화형 초기 세팅 |
| `npx oc-setup preset list` | `setup_preset_list` | 프리셋 목록 |
| `npx oc-setup preset apply <n>` | `setup_preset_apply` | 프리셋 적용 |
| `npx oc-setup migrate <tool>` | `setup_migrate` | 설정 마이그레이션 |
| `npx oc-setup validate` | `setup_validate` | 설정 검증 |
| `npx oc-setup doctor` | `setup_doctor` | 환경 진단 |

## 생성되는 파일

```
~/.config/opencode/
├── opencode.json           글로벌 (Provider, 모델, 테마, 플러그인)
└── tui.json                TUI (키바인드, 스크롤)

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

## 기여하기

```bash
git clone https://github.com/{owner}/oc-setup.git
cd oc-setup
bun install
bun test
bun run build
```

설계 문서는 [DESIGN.md](./DESIGN.md)를 참고하세요.

## 라이선스

MIT
