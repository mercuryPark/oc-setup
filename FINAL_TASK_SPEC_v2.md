# 작업 지시서 v2: @hoyeon0722/opencode-setup 100점 지향 (v0.2.1 → v0.4.0)

> **이 문서는 v0.2.1 실물을 npm 에서 다운로드해 100% 소스·실행 검증한 2차 지시서다. 1차 지시서(FINAL_TASK_SPEC.md) 의 구조를 그대로 이어받는다. 모든 이슈는 `grep`·실제 CLI 출력·Best Practice 출처로 뒷받침된다.**

---

## 📦 컨텍스트 업데이트

- **현재 버전**: v0.2.1 (npm 발행 확인됨)
- **1차 지시서 결과**: 65.5 → **85.5 (A-)** 달성. P0/P1 대부분 통과.
- **이번 목표**: **85.5 → 100 (A+)**. 단순 버그 제로를 넘어 **"많은 사람이 호감을 느끼면서 편리하게 사용"** 을 실현.
- **벤치마크**: `create-vite`, `create-next-app`, `create-t3-app`, `commitizen`, `biome`, `changesets` — 각 영역의 표준 패키지.

---

## 🛡️ 가드레일 (1차 지시서와 동일)

1. `dist/` 직접 수정 금지. 모든 변경은 `src/` → `npm run build`
2. 각 이슈마다 **검증 → 수정 → 재검증** 3단계
3. 한 이슈 = 한 커밋 (Conventional Commits)
4. Breaking change 는 CHANGELOG 에 반드시 명시
5. TypeScript strict, `npm run lint` 통과 필수
6. **기존 스펙과 동떨어진 개편 금지** — 확장만 허용

---

## 🗺️ 로드맵

| 릴리스 | 범위 | 목표 점수 |
|--------|------|----------|
| v0.2.2 (hotfix) | 1차 스펙의 잔재 + 즉시 수정 가능 | 88 |
| v0.3.0 (minor) | 기존 P2 실행 + DX 정비 | 93 |
| v0.4.0 (minor) | Trust & Delight 레이어 | 100 |

---

# 🔴 v0.2.2 — 1차 스펙 잔재 핫픽스 (지금 당장)

---

## P0-2-R. README 의 `plugin` 키 **단수형** 복원 (Regression)

**증거 (검증됨)**:
```
$ grep -A 2 "plugin" README.md | head -5
{
  "plugins": ["@hoyeon0722/opencode-setup"]
}
```

**사실**:
- OpenCode 공식 `opencode.json` schema 키는 **단수형 `plugin`**
- 소스 코드도 단수형 사용: `src/preset/registry.ts` 의 `opencodeConfig.plugin`
- v0.2.0 원본 → v0.2.1 에서 `plugin` → `plugins` 로 과잉 수정되어 **regression** 발생

**영향**: README 복붙한 사용자의 OpenCode 가 플러그인을 로드하지 못함. **초보자 타겟 패키지에 치명적 온보딩 실패 유지**.

**수정**:
```diff
- "plugins": ["@hoyeon0722/opencode-setup"]
+ "plugin": ["@hoyeon0722/opencode-setup"]
```

**검증**:
```bash
grep -c '"plugin":' README.md    # → 1 이상
grep -c '"plugins":' README.md   # → 0
```

또한 **README 의 모든 JSON 블록을 실제 opencode 와 호환되는지 확인**. 필요시 `validate-readme-json.sh` 추가 (1차 스펙 P0-2 의 Best Practice 항목 참고).

---

## P0-7. `package.json` `files` 에 `CHANGELOG.md` 누락

**증거 (검증됨)**:
```
$ cat package.json | jq '.files'
["dist", "templates", "README.md", "LICENSE"]
```
→ CHANGELOG.md 가 tarball 에 포함 안 됨. npm 페이지 "Versions" 탭에서 변경 내역 확인 불가.

**수정**:
```json
"files": ["dist", "templates", "README.md", "LICENSE", "CHANGELOG.md"]
```

**검증**:
```bash
npm pack --dry-run 2>&1 | grep CHANGELOG
# → "CHANGELOG.md" 출력되어야 함
```

---

## P0-8. GitHub 커뮤니티 파일 최소 3종 누락

**증거 (검증됨)**:
- `.github/workflows/` 디렉토리 없음
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` 전부 없음
- GitHub "Community Standards" 체크리스트에서 "Incomplete" 판정 예상

**수정** — 4개 파일 신규 생성:

### 1. `CONTRIBUTING.md`
```markdown
# Contributing to @hoyeon0722/opencode-setup

## 개발 환경
- Node.js ≥20 (vitest 요구사항)
- Bun ≥1.0 (선택, dev 스크립트용)

## 시작
\`\`\`bash
git clone https://github.com/mercuryPark/oc-setup
cd oc-setup
npm install
npm run test
\`\`\`

## 커밋 컨벤션
Conventional Commits 사용:
- \`feat:\` 새 기능
- \`fix:\` 버그 수정
- \`refactor:\` 리팩토링
- \`docs:\` 문서
- \`test:\` 테스트
- \`chore:\` 빌드/도구

## PR 체크리스트
- [ ] 테스트 추가 또는 업데이트
- [ ] \`npm run lint && npm run test\` 통과
- [ ] CHANGELOG.md 업데이트 (breaking 은 명시)
```

### 2. `CODE_OF_CONDUCT.md`
Contributor Covenant v2.1 템플릿 그대로 사용:
```bash
curl -o CODE_OF_CONDUCT.md https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md
```

### 3. `SECURITY.md`
```markdown
# Security Policy

## 지원 버전
| Version | Supported |
| ------- | --------- |
| 0.x     | ✅        |

## 취약점 신고
보안 이슈는 **공개 이슈로 올리지 마세요**. 아래로 비공개 리포트:
- GitHub Security Advisory: https://github.com/mercuryPark/oc-setup/security/advisories/new
- Email: (mercuryPark 에 이메일 추가)

48시간 내 초기 응답, 7일 내 수정 계획을 공유합니다.
```

### 4. `.github/ISSUE_TEMPLATE/bug_report.yml`
```yaml
name: 🐛 Bug Report
description: 동작 이상을 신고합니다
labels: ["bug"]
body:
  - type: input
    attributes:
      label: 패키지 버전
      placeholder: "0.2.1"
    validations:
      required: true
  - type: input
    attributes:
      label: Node 버전
      placeholder: "v20.10.0"
    validations:
      required: true
  - type: textarea
    attributes:
      label: 재현 절차
      placeholder: |
        1. ...
        2. ...
    validations:
      required: true
  - type: textarea
    attributes:
      label: 기대 동작 vs 실제 동작
    validations:
      required: true
```

### 5. `.github/pull_request_template.md`
```markdown
## 변경 사항
<!-- 어떤 이슈를 해결하거나 어떤 기능을 추가했는지 -->

## 체크리스트
- [ ] 테스트 추가/업데이트
- [ ] `npm run lint && npm run test` 로컬 통과
- [ ] CHANGELOG.md 업데이트

## 연관 이슈
Closes #
```

**근거**: [GitHub Community Health](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)

**검증**:
```bash
ls -la CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md .github/
# → 모두 존재
```

---

## P0-9. 배지 2개 → 5개로 확대

**증거 (검증됨)**: 현재 README 최상단에 `npm version`, `License` 2개만.

**수정** — README 최상단 배지 블록 교체:
```markdown
[![npm version](https://img.shields.io/npm/v/@hoyeon0722/opencode-setup?color=cb3837)](https://www.npmjs.com/package/@hoyeon0722/opencode-setup)
[![npm downloads](https://img.shields.io/npm/dm/@hoyeon0722/opencode-setup)](https://www.npmjs.com/package/@hoyeon0722/opencode-setup)
[![CI](https://github.com/mercuryPark/oc-setup/actions/workflows/ci.yml/badge.svg)](https://github.com/mercuryPark/oc-setup/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![install size](https://packagephobia.com/badge?p=@hoyeon0722/opencode-setup)](https://packagephobia.com/result?p=@hoyeon0722/opencode-setup)
```

**주의**: CI 배지는 P1-10 에서 CI workflow 생성 후 활성화. 그 전까지는 "workflow not found" 로 표시 → **P1-10 과 함께 처리**.

**근거**: [biome README 배지 패턴](https://raw.githubusercontent.com/biomejs/biome/main/packages/%40biomejs/biome/README.md), [Shields.io npm bundle](https://shields.io/badges/npm-bundle-size)

---

# 🟠 v0.3.0 — DX 정비 (1차 P2 승격 + 추가)

---

## P1-10. GitHub Actions CI (Node 매트릭스)

**증거**: `.github/workflows/` 부재 확인됨.

**수정** — `.github/workflows/ci.yml` 신규 생성:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        node: [20, 22]
        os: [ubuntu-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test

  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm audit --production --audit-level=moderate
```

**근거**: [changesets CI 패턴](https://github.com/changesets/changesets)

**주의**: Node 18 제외 — vitest 4.x 가 Node 20+ 요구. `engines.node` 도 `">=20"` 으로 상향 (1차 P0-3 연장). **Breaking change, CHANGELOG 명시**.

---

## P1-11. 기본 에이전트 품질 균질화 (1차 P2-1)

**증거**: 1차 스펙 확인 — `templates/agents/reviewer.md`, `tester.md`, `planner.md` 가 `security-reviewer.md`(57줄) 대비 뼈대 수준.

**수정**: `reviewer.md`, `tester.md`, `planner.md` 를 최소 50줄 이상으로 보강. 구조:
```markdown
# [에이전트명]

## 역할
[한 문단]

## 트리거 조건
- 언제 이 에이전트가 호출되어야 하는가

## 체크리스트
- [ ] ...

## 작업 프로세스
1. ...

## 출력 포맷
[구체적 예시]

## 권한 설정
\`\`\`json
{ "edit": "ask", "bash": { "npm test": "allow" } }
\`\`\`
```

**참고**: `templates/agents/security-reviewer.md` 를 템플릿으로 삼아 도메인만 바꿈.

---

## P1-12. 빌드 스크립트 크로스플랫폼 (1차 P2-2)

**증거**: `package.json` build script 에 macOS BSD `sed -i ''` 잔재.

**수정** — `tsup.config.ts` 신규:
```typescript
import { defineConfig } from "tsup"
import { cpSync, chmodSync } from "fs"

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  target: "node20",
  external: ["@opencode-ai/plugin", "zod", "commander", "@inquirer/prompts"],
  clean: true,
  dts: true,
  banner: (ctx) => ({
    js: ctx.format === "esm" ? "#!/usr/bin/env node" : ""
  }),
  onSuccess: async () => {
    cpSync("templates", "dist/templates", { recursive: true })
    chmodSync("dist/cli.js", 0o755)
  },
})
```
`package.json`:
```json
"scripts": {
  "build": "tsup",
  ...
}
```

**검증 (Linux 에서 빌드)**:
```bash
docker run --rm -v $PWD:/app -w /app node:20-alpine sh -c "npm ci && npm run build"
# → 에러 없이 완료
```

---

## P1-13. `@inquirer/prompts` 최신 안정화 (1차 P2-5)

**증거**: `npm audit` — 4 low severity 취약점. 현재 `^6.0.0` → 최신 안정.

**수정**: 최신 버전으로 업그레이드. Breaking 체크 후 wizard 코드 업데이트.
```bash
npm install @inquirer/prompts@latest
npm run test
```
주의: `select`/`checkbox` API 변경 가능 → wizard 전체 테스트 필수.

---

## P1-14. 테스트 커버리지 명시 (신규)

**증거**: `vitest.config.ts` 이미 `coverage: { reporter: ["text", "html"] }` 정의됨. 하지만 배지·CI 에 노출 안 됨.

**수정**:
1. `package.json`:
```json
"scripts": {
  "test:coverage": "vitest run --coverage",
  ...
}
```
2. `.github/workflows/ci.yml` 에 coverage 단계 추가 + Codecov 업로드:
```yaml
- run: npm run test:coverage
- uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```
3. README 배지에 Codecov 추가:
```markdown
[![codecov](https://codecov.io/gh/mercuryPark/oc-setup/branch/main/graph/badge.svg)](https://codecov.io/gh/mercuryPark/oc-setup)
```

**목표 커버리지**: core/ 및 migrate/ 80% 이상.

---

## P1-15. `--json` / `--quiet` / `--verbose` 전역 플래그

**증거**: 현재 `preset apply` 만 JSON 스타일, 다른 명령은 고정 포맷.

**수정** — `src/cli.ts` 에 전역 옵션 추가:
```typescript
program
  .option("--json", "JSON 형식으로 출력")
  .option("--quiet", "필수 출력만 표시")
  .option("--verbose", "상세 디버그 출력")
```
각 action 에서 `program.opts()` 로 플래그 읽어 출력 분기.

**근거**: [clig.dev](https://clig.dev/) — CLI 표준 플래그.

**검증**:
```bash
node dist/cli.js doctor --json | jq .
# → valid JSON 출력
node dist/cli.js preset apply balanced --quiet
# → 최소 출력
```

---

## P1-16. `NO_COLOR` 환경변수 지원

**증거**: 현재 `\x1B[32m` 등 raw ANSI 사용 (1차 P2-4 에서 picocolors 도입 권장).

**수정**: picocolors 도입 + `NO_COLOR` 자동 감지.
```typescript
// src/utils/color.ts (신규)
import pc from "picocolors"

// picocolors 는 NO_COLOR, isTTY, CI 환경 자동 감지
export const c = {
  success: (s: string) => pc.green(s),
  error: (s: string) => pc.red(s),
  warn: (s: string) => pc.yellow(s),
  info: (s: string) => pc.cyan(s),
  dim: (s: string) => pc.dim(s),
}
```
기존 `\x1B[...]` 전부 교체.

**근거**: [NO_COLOR 표준](https://no-color.org/), [nodejs-cli-apps-best-practices](https://github.com/lirantal/nodejs-cli-apps-best-practices)

**검증**:
```bash
NO_COLOR=1 node dist/cli.js doctor
# → 색상 코드 없이 plain text
```

---

## P1-17. 에러 메시지 3단 구조 표준화

**증거**: 현재 에러가 단순 `console.error(error.message)` 수준. 1차 P2-3 `.env.example` 보강과 같은 맥락.

**수정**: 에러 출력 래퍼 `src/utils/error.ts` 신규:
```typescript
export function printError(what: string, why: string, fix: string): void {
  console.error(c.error(`✖ ${what}`))
  console.error(c.dim(`  이유: ${why}`))
  console.error(`  해결: ${fix}`)
}
```
주요 에러 지점 (migrate, preset apply, validate) 에서 사용.

**예시**:
```
✖ opencode.json 파일을 쓸 수 없습니다.
  이유: ~/.config/opencode/ 디렉토리에 쓰기 권한이 없습니다.
  해결: chmod 755 ~/.config/opencode/ 실행 후 재시도하세요.
```

**근거**: [nodejs-cli-apps-best-practices — Error messages](https://github.com/lirantal/nodejs-cli-apps-best-practices)

---

## P1-18. Spinner / 진행 표시 (`ora`)

**증거**: 현재 `init` / `preset apply` 중 진행 중 피드백 없음.

**수정**:
```bash
npm install ora
```
```typescript
import ora from "ora"

const spinner = ora("opencode.json 생성 중...").start()
try {
  writeProjectConfig(profile, projectDir)
  spinner.succeed("opencode.json 생성 완료")
} catch (err) {
  spinner.fail("opencode.json 생성 실패")
  throw err
}
```

**적용 대상**: `setup_init` tool 및 CLI init wizard 의 각 파일 생성 단계.

**근거**: [ora](https://github.com/sindresorhus/ora) — Sindre Sorhus 의 표준 spinner.

---

## P1-19. OpenCode Provider 목록 기반 omo 모델 검증 (1차 P1-7)

**증거 (검증됨)** — 현재 omo 모델 목록:
```
templates/omo/premium.json:
  - anthropic/claude-opus-4-6
  - anthropic/claude-sonnet-4-5
  - anthropic/claude-sonnet-4-6
  - google/gemini-2.5-flash
  - google/gemini-3-pro-preview
  - moonshot/kimi-k2.5
  - openai/gpt-5.3-codex
  - openai/gpt-5.4
  - opencode-go/kimi-k2.5
  - opencode-go/minimax-m2.7

templates/omo/free.json:
  - opencode-go/gemini-2.5-pro
  - opencode-go/glm-5, glm-5.1
  - opencode-go/kimi-k2.5
  - opencode-go/minimax-m2.5, m2.7
```

**수정 절차**:
1. `https://models.dev` API 또는 `opencode` CLI 로 실존 목록 조회
2. 각 ID 가 실존하는지 체크 → **존재하지 않는 것만** 실존 대체재로 교체
3. 교체 내역 `CHANGELOG.md` 에 명시
4. 자동 검증 스크립트 `scripts/validate-models.ts` 추가:
```typescript
// 각 json 파일 파싱 → 모델 ID 추출 → Models.dev API 조회 → 결과 리포트
// CI 에서 돌려 regression 방지
```

**자동화**: CI 에 `npm run validate:models` 단계 추가.

---

# 🟢 v0.4.0 — Trust & Delight (100점 레이어)

---

## P2-1. Hero GIF / 스크린캐스트

**근거**: [create-t3-app](https://github.com/t3-oss/create-t3-app) 등 상위 CLI 도구는 README 최상단에 실제 동작 영상/GIF 배치. 텍스트보다 "실제 동작 확인" 이 전환율 핵심.

**수정**:
1. `init` wizard 실행 → `vhs` (https://github.com/charmbracelet/vhs) 로 녹화
2. GIF 를 `assets/demo.gif` 저장 (리포 또는 별도 CDN)
3. README 최상단에 배치:
```markdown
<p align="center">
  <img src="./assets/demo.gif" alt="oc-setup init demo" width="700" />
</p>
```

**대안**: asciinema (https://asciinema.org/) — 가벼운 SVG 기반, 접근성 좋음.

---

## P2-2. README 구조 재정렬 (3초 룰)

**근거**: [clig.dev](https://clig.dev/), create-vite, create-next-app 모두 "스크롤 없이 보이는 첫 화면에 실행 명령 1줄".

**수정** — README 상단 섹션 순서 재배치:
```markdown
# @hoyeon0722/opencode-setup

[배지 5종]

<p align="center"><img src="./assets/demo.gif" /></p>

> OpenCode 환경 세팅, 한 번의 실행으로.

## Quick Start

\`\`\`bash
npx @hoyeon0722/opencode-setup init
\`\`\`

## Why

(기존 "왜 필요한가" 섹션)

## Features
...
```

**스크롤 없이 배지 + GIF + Quick Start 1줄**이 보이도록.

---

## P2-3. 이중 언어 README (KR + EN)

**근거**: [GitHub 다국어 README 논의](https://github.com/orgs/community/discussions/31132) — 커뮤니티 표준은 **별도 파일**.

**수정**:
1. 현재 `README.md` → `README.md` (한국어 유지)
2. `README.en.md` 영어 번역 생성
3. 양쪽 상단에 언어 스위치:
```markdown
> [한국어](./README.md) | **English**
```

**중요**: 영어 번역은 기계 번역이 아닌 **자연스러운 영어** — 해외 사용자 호감도에 직결. npm 패키지 페이지가 영어 README 를 더 자주 인덱싱.

---

## P2-4. 스마트 기본값 감지 (Wizard)

**근거**: [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) 은 git/npm/yarn/pnpm/bun 환경 자동 감지해 default 채움.

**수정** — wizard 시작 시 감지:
```typescript
// src/prompt/detector.ts (신규)
export async function detectEnvironment(): Promise<Detected> {
  const hasOpencode = existsSync(join(homedir(), ".config/opencode/opencode.json"))
  const hasProject = existsSync("opencode.json")
  const hasClaudeCode = existsSync("CLAUDE.md") || existsSync(".claude")
  const pkgJson = existsSync("package.json")
    ? JSON.parse(readFileSync("package.json", "utf-8"))
    : null
  const detectedLang = detectLanguage(pkgJson)  // ts/js/go/py
  const detectedFramework = detectFramework(pkgJson)  // next/vite/express/...

  return { hasOpencode, hasProject, hasClaudeCode, detectedLang, detectedFramework }
}
```

**적용**:
- 이미 존재하는 `opencode.json` 발견 → "기존 설정 발견, 덮어쓸까요?" 로 시작
- `CLAUDE.md` 발견 → "Claude Code 설정을 마이그레이션하시겠습니까? (예/아니오)" 로 migrate 제안
- `package.json` 의 dependencies 에서 `next` 감지 → 언어/프레임워크 질문 스킵

**목표**: 5~7개 질문 이내로 완료. 스마트 감지로 1-2개 감소.

---

## P2-5. `init` 완료 후 "Next Steps" 조건부

**근거**: [create-t3-app logNextSteps.ts](https://github.com/t3-oss/create-t3-app/blob/main/cli/src/helpers/logNextSteps.ts) — 사용자가 선택한 옵션에 따라 다른 안내.

**수정** — 완료 메시지를 프로필 기반 동적 생성:
```typescript
function logNextSteps(profile: UserProfile, files: string[]): void {
  const steps: string[] = []

  if (!existsSync(".env")) {
    steps.push(`1. .env.example 을 .env 로 복사: ${c.dim("cp .env.example .env")}`)
    for (const provider of profile.providers) {
      steps.push(`   ${provider} API 키를 .env 에 입력`)
    }
  }

  if (profile.plugins.includes("oh-my-opencode")) {
    steps.push(`2. oh-my-opencode 플러그인 활성화: opencode 에서 ${c.info("/reload")}`)
  }

  steps.push(`${steps.length + 1}. opencode 실행하고 ${c.info("/init")} 로 프로젝트 분석`)

  console.log("\n다음 단계:")
  for (const s of steps) console.log(`  ${s}`)
}
```

---

## P2-6. `init --resume` 지원

**근거**: [commitizen --retry](https://github.com/commitizen/cz-cli) — 이전 세션 재사용 패턴.

**수정**:
1. wizard 마지막 응답을 `~/.cache/oc-setup/last-session.json` 저장
2. `init --resume` 시 이 파일 읽어 프리필:
```typescript
if (options.resume && existsSync(sessionPath)) {
  const last = JSON.parse(readFileSync(sessionPath, "utf-8"))
  // inquirer prompt 에 default 값으로 전달
}
```

**효과**: 실수로 Ctrl+C 했을 때 `init --resume` 으로 복구.

---

## P2-7. "Did you know" 팁 로테이션

**근거**: [nodejs-cli-apps-best-practices](https://github.com/lirantal/nodejs-cli-apps-best-practices) — spinner 옆에 팁 로테이션.

**수정**:
```typescript
// src/utils/tips.ts
const TIPS = [
  "💡 balanced 프리셋은 월 $20~40 로 가장 많이 선택됩니다.",
  "💡 Claude Code 유저는 'oc-setup migrate claude-code' 로 1분만에 이주!",
  "💡 omo 프리셋은 oh-my-opencode 플러그인과 함께 사용하세요.",
  "💡 'oc-setup doctor' 로 언제든 환경을 진단할 수 있습니다.",
]

export function randomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)]
}
```
파일 생성 spinner 중간 / 완료 메시지 뒤에 랜덤 팁 표시.

**중요**: 과하지 않게. wizard 완료 1회만.

---

## P2-8. "Telemetry None" 명시 배지 + 문구

**근거**: [Next.js Telemetry 논란](https://github.com/vercel/next.js/issues/59688) — opt-out 방식 무통보 수집은 오히려 신뢰 훼손. **명시적 "수집 안 함"** 이 신뢰 차별점.

**수정**:
1. README 배지 추가:
```markdown
![No Telemetry](https://img.shields.io/badge/telemetry-none-success)
```
2. wizard 완료 메시지 말미:
```
🔒 No telemetry. Your data stays local.
```
3. 새 섹션 `## Privacy` README:
```markdown
## Privacy

- 이 도구는 텔레메트리/분석/사용량 수집을 **하지 않습니다**.
- 네트워크 호출: 없음 (로컬 파일 조작만)
- 수집하는 데이터: 없음
- 전송하는 데이터: 없음
```

---

## P2-9. Changesets 릴리스 자동화

**근거**: [changesets](https://github.com/changesets/changesets) — Astro, Chakra UI, Remix 표준.

**수정**:
```bash
npm install -D @changesets/cli
npx changeset init
```
`.github/workflows/release.yml`:
```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release
          createGithubReleases: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
`package.json`:
```json
"scripts": {
  "release": "changeset publish"
}
```

**효과**: PR 마다 `.changeset/*.md` 추가 → main merge 시 Release PR 자동 생성 → 승인 시 CHANGELOG 업데이트 + npm publish 자동.

---

## P2-10. Contributors 섹션

**근거**: [create-t3-app](https://github.com/t3-oss/create-t3-app) — README 하단 아바타 그리드. "혼자 만든 게 아니다" 라는 신뢰 신호.

**수정** — README 하단:
```markdown
## Contributors

<a href="https://github.com/mercuryPark/oc-setup/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mercuryPark/oc-setup" />
</a>
```

초기에는 혼자 기여자일 수 있음 → 그래도 배치. PR 유입 시 자동 업데이트.

---

## P2-11. 커뮤니티 링크

**근거**: Discord 배지 자체가 "살아있는 프로젝트" 신호. 규모와 무관.

**수정** (선택, Discord 운영 가능 시):
1. Discord 서버 개설
2. README 배지:
```markdown
[![Discord](https://img.shields.io/discord/YOUR_SERVER_ID?label=discord&color=7289da)](https://discord.gg/YOUR_INVITE)
```

**대안**: GitHub Discussions 활성화만으로도 OK.
`.github/settings.yml` 또는 수동으로 `Discussions` 기능 켜기.

---

## P2-12. Showcase / 사용 예시

**근거**: "실제 사용 중" 증거가 신뢰 극대화.

**수정** — README 에 `## Showcase` 섹션:
```markdown
## Showcase

아래 프로젝트들이 이 도구로 세팅되었습니다:
- [프로젝트명](URL) — 설명
- ...

자신의 프로젝트를 추가하려면 PR 을 보내주세요.
```

PR 템플릿에 "Showcase 등록" 체크박스 추가.

---

## P2-13. 번들 최적화

**증거 (검증됨)**: 현재 `dist/chunk-*.js` 68KB — 3개 의존성 대비 조금 큼.

**수정**:
1. tsup `treeshake: true` 명시
2. 빌드 후 번들 분석:
```bash
npx bundle-analyzer dist/chunk-*.js
# 또는 sentry/source-map-explorer
```
3. 사용 안 하는 `@inquirer/prompts` 하위 모듈 tree-shake 확인
4. **목표**: chunk < 50KB, cli < 20KB

**응답 시간 목표**: `--version` < 80ms, `--help` < 80ms (현재 ~100ms).

---

## P2-14. `npm init` / `create-*` 별칭 제공

**근거**: `create-vite`, `create-next-app` 관행 — `npm create vite` 형태로 실행.

**수정** — 별도 래퍼 패키지 `create-opencode` 발행:
```json
{
  "name": "create-opencode",
  "bin": { "create-opencode": "./dist/cli.js" },
  "dependencies": {
    "@hoyeon0722/opencode-setup": "^0.4.0"
  }
}
```
CLI 는 `@hoyeon0722/opencode-setup init` 호출만.

**효과**: `npm create opencode@latest` 로 실행 가능. Discoverability 대폭 상승.

**우선순위 낮음**: 메인 패키지가 안정화된 후 고려.

---

## P2-15. 한눈에 보이는 `--list-all` 또는 `info`

**근거**: 사용자가 "이 패키지가 뭘 해주는지" 빠르게 파악 필요.

**수정** — 새 명령:
```bash
npx @hoyeon0722/opencode-setup info
```
출력:
```
@hoyeon0722/opencode-setup v0.4.0

이 패키지는 무엇을 하나요?
  OpenCode 환경 세팅을 대화형으로 도와주는 CLI + Plugin.

사용 가능한 명령:
  init      대화형 초기 세팅
  preset    프리셋 관리 (5 model + 4 stack + 2 omo)
  migrate   Claude Code / Cursor / Aider 마이그레이션
  doctor    환경 진단
  validate  설정 검증

생성되는 파일:
  ~/.config/opencode/opencode.json   글로벌 설정
  ./opencode.json                    프로젝트 설정
  ./AGENTS.md                        프로젝트 규칙
  ./.opencode/                       에이전트/커맨드/스킬

지원 Provider (7):
  Anthropic, OpenAI, Google, DeepSeek, OpenRouter, MiniMax, Ollama

프라이버시: 텔레메트리 없음, 네트워크 호출 없음

문서: https://github.com/mercuryPark/oc-setup
이슈: https://github.com/mercuryPark/oc-setup/issues
```

---

# ✅ 수용 기준 (100점)

**v0.2.2 hotfix 완료 기준**:
- [ ] `grep '"plugins":' README.md` → 0건 (단수형 복원)
- [ ] `npm pack --dry-run | grep CHANGELOG` → 포함 확인
- [ ] CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md` 존재
- [ ] README 배지 5개

**v0.3.0 완료 기준** (앞의 + 아래):
- [ ] `.github/workflows/ci.yml` 존재, Node 20/22 × Linux/macOS 매트릭스 통과
- [ ] `engines.node >= 20` 명시
- [ ] 테스트 커버리지 리포트 생성, core/migrate 80% 이상
- [ ] `NO_COLOR=1` 환경에서 색상 코드 출력 안 함
- [ ] `--json`, `--quiet`, `--verbose` 전역 플래그 동작
- [ ] 기본 에이전트 3개 모두 50줄 이상
- [ ] `npm audit --production --audit-level=moderate` 에러 없음
- [ ] omo 모델 ID 전부 Models.dev 검증 완료
- [ ] Linux Docker 에서 `npm ci && npm run build` 성공
- [ ] spinner 적용: `init` 및 `preset apply` 실행 시 진행 표시

**v0.4.0 완료 기준** (앞의 + 아래):
- [ ] README 최상단에 데모 GIF 또는 asciinema 임베드
- [ ] `README.en.md` 자연스러운 영어 번역 존재
- [ ] `init` wizard 가 package.json / opencode.json / CLAUDE.md 자동 감지
- [ ] 완료 메시지가 사용자 선택에 따라 조건부 "Next Steps" 출력
- [ ] `init --resume` 동작
- [ ] Changesets 기반 CI 릴리스 자동화 동작
- [ ] README 에 Privacy 섹션 + "No Telemetry" 배지
- [ ] Contributors 섹션 존재
- [ ] GitHub Discussions 활성화
- [ ] `npx @hoyeon0722/opencode-setup info` 명령 동작
- [ ] 번들 크기: chunk < 50KB, cli < 20KB
- [ ] `--version` / `--help` 응답 시간 < 80ms

---

# 📝 커밋 / 릴리스 플로우

### v0.2.2 (hotfix)
```
fix(readme): restore plugin key to singular form
chore(pkg): include CHANGELOG.md in published files
docs: add CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
docs: add GitHub issue and PR templates
docs(readme): expand badge set to 5
chore(release): v0.2.2
```

### v0.3.0 (minor — Breaking: Node ≥20)
```
chore(ci): add GitHub Actions workflow with Node matrix
refactor(build): replace shell sed with tsup.config.ts (BREAKING: Node >=20)
feat(agents): fill out reviewer/tester/planner templates
chore(deps): upgrade @inquirer/prompts to latest stable
feat(cli): add --json/--quiet/--verbose global flags
feat(cli): respect NO_COLOR env and migrate to picocolors
refactor(cli): standardize 3-tier error messages
feat(cli): add ora spinners for long operations
fix(omo): verify and correct all model IDs
chore(ci): add coverage reporting via Codecov
chore(release): v0.3.0
```

### v0.4.0 (minor — Trust & Delight)
```
docs(readme): add hero demo GIF
docs(readme): restructure for 3-second rule
docs: add English README
feat(wizard): smart default detection (project/env)
feat(wizard): conditional Next Steps output
feat(cli): add init --resume flag
feat(cli): did-you-know tips rotation
docs(readme): add Privacy section and No-Telemetry badge
chore(ci): adopt changesets for release automation
docs(readme): add Contributors section
feat(cli): add 'info' command
chore(build): optimize bundle size
chore(release): v0.4.0
```

---

# 🚦 릴리스 전 최종 체크 (v0.4.0)

```bash
# 1. 전체 검증
npm run lint && npm run build && npm run test:coverage

# 2. 수용 기준 전부 통과 확인 (위 체크리스트)

# 3. 번들 크기 체크
ls -la dist/*.js | awk '{print $5, $9}'

# 4. 응답 시간 체크
time node dist/cli.js --version
time node dist/cli.js --help

# 5. NO_COLOR 동작
NO_COLOR=1 node dist/cli.js doctor

# 6. --json 동작
node dist/cli.js doctor --json | jq .

# 7. Linux 빌드 호환
docker run --rm -v $PWD:/app -w /app node:20-alpine sh -c "npm ci && npm run build"

# 8. 패킹 테스트
npm pack
mkdir /tmp/final-test && cd /tmp/final-test
npm init -y
npm install /<repo>/hoyeon0722-opencode-setup-0.4.0.tgz
npx @hoyeon0722/opencode-setup info
npx @hoyeon0722/opencode-setup doctor

# 9. GitHub Actions 로컬 실행 (act)
act -j test

# 10. npm publish (dry-run)
npm publish --dry-run --access public
```

---

# 📌 남은 의사결정 (사용자 확인 필요)

1. **Node 버전 상향** (`>=18` → `>=20`): vitest 4.x 요구사항. **Breaking change**. OK?
2. **create-opencode 별칭 패키지**: 유지보수 추가 부담. P2-14 는 선택.
3. **Discord 운영**: P2-11 선택. 리소스 없으면 GitHub Discussions 만.
4. **Showcase 초기 데이터**: 본인이 쓰는 프로젝트 1-2개로 시작.

---

# 🎯 점수 예상 (100점 달성 시)

| 카테고리 | v0.2.1 | v0.2.2 | v0.3.0 | v0.4.0 |
|---------|--------|--------|--------|--------|
| 기능 완성도 | 24/25 | 24/25 | **25/25** | 25/25 |
| 코드 품질 | 17/20 | 18/20 | **20/20** | 20/20 |
| UX / 편의성 | 18/20 | 18/20 | 19/20 | **20/20** |
| 실용성/차별화 | 8/15 | 9/15 | 12/15 | **15/15** |
| 보안 | 9.5/10 | 9.5/10 | **10/10** | 10/10 |
| 배포/메타 | 9/10 | 9.5/10 | 10/10 | **10/10** |
| **합계** | **85.5** | **88** | **96** | **100** |

**100점 = Trust (CI/문서/커뮤니티 파일) + Delight (감동 레이어) + Discoverability (별칭/배지/Showcase) 삼박자.**

---

**끝. MiniMax 에게 이 문서를 그대로 전달하되, v0.2.2 → v0.3.0 → v0.4.0 순서로 단계별 진행 권장.**
