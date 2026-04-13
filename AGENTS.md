# oc-setup

OpenCode 초기 환경 세팅 플러그인 + CLI (TypeScript/Bun). 설계 문서는 DESIGN.md에 있다.

## 핵심 원칙

- **DESIGN.md가 진실의 원천이다.** 구현 시 항상 DESIGN.md를 먼저 읽고 따를 것.
- **구현 순서는 DESIGN.md 섹션 12 Phase 2를 따른다.** Step 1 → 9 순서.
- **한 번에 하나의 Step만 구현한다.**

## Project Structure

```
oc-setup/
├── src/
│   ├── index.ts         # 플러그인 진입점 (@opencode-ai/plugin)
│   ├── cli.ts           # CLI 진입점 (commander)
│   ├── tools/           # 플러그인 tool 정의 (setup_init, setup_migrate 등)
│   ├── core/            # 비즈니스 로직 (config, agents-md, command, skill 생성)
│   ├── migrate/         # 마이그레이션 (claude-code, cursor, aider)
│   ├── preset/          # 프리셋 레지스트리 및 적용
│   ├── provider/        # Provider/모델 레지스트리 및 추천
│   ├── prompt/          # 대화형 위자드 (@inquirer/prompts)
│   ├── doctor/          # 환경 진단
│   ├── validator/       # 설정 검증
│   └── types/           # 타입 정의
├── templates/           # 내장 템플릿 (.md, .json)
└── test/                # bun:test 테스트
```

## Code Standards

- TypeScript strict mode
- Bun 런타임
- 에러 처리: try/catch + 의미 있는 에러 메시지, 절대 silent fail 하지 않음
- 모든 exported 함수/타입에 JSDoc 주석
- 외부 의존성 최소화. 표준 라이브러리로 해결 가능하면 표준 사용

## Dependencies

핵심:
- `@opencode-ai/plugin` — 플러그인 SDK
- `zod` — 스키마 검증 (플러그인 SDK 의존)
- `commander` — CLI 프레임워크

CLI 모드:
- `@inquirer/prompts` — 대화형 프롬프트

선택:
- `yaml` — Aider .aider.conf.yml 파싱용 (필요시만)

**불필요한 의존성 추가 금지.**

## Testing

- `bun test` 으로 전체 테스트 실행
- test/ 디렉토리에 src/ 구조 미러링
- test/fixtures/ 에 Claude Code, Cursor, Aider 샘플 설정 배치

## Plugin Architecture

- src/index.ts는 `Plugin` 타입을 export하는 async 함수
- tool은 `tool()` 헬퍼로 정의. args는 zod 스키마.
- tool의 execute 함수는 반드시 string을 반환
- 플러그인 context: `{ client, project, $, directory, worktree }`

## 생성 파일 규칙

- 글로벌 설정: `~/.config/opencode/`
- 프로젝트 설정: 현재 디렉토리 (프로젝트 루트)
- 에이전트/커맨드: `.opencode/agents/`, `.opencode/commands/`
- 스킬: `.opencode/skills/*/SKILL.md`
- **기존 파일 덮어쓰기 전 반드시 사용자 확인**
- 덮어쓰기 시 `.bak` 백업 생성

## opencode.json 규칙

- 스키마: `https://opencode.ai/config.json`
- 모든 생성 파일에 `"$schema"` 포함
- provider/model 형식: `provider_id/model_id`
- permission 값: `"allow"` | `"ask"` | `"deny"`
- plugin 배열에 npm 패키지명 또는 `file://` 경로

## 모델 배정 (이 프로젝트 개발용)

- Plan 모드, 복잡한 로직: MiniMax M2.5
- 타입, 템플릿, 테스트, 보일러플레이트: Big Pickle
- 문서: Nemotron 3 또는 M2.5
