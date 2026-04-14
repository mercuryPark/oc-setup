# oc-setup 완성 및 npm 배포工作计划 (Best Practice Edition)

## TL;DR

> **목표**: oc-setup을 완성하고 npm에 **production-grade** CLI 패키지로 배포
> **핵심 문제**: `oc-setup` 패키지명 이미 점유됨 + package.json이 npm production 标准 미달
> **추가 과제**: 마이그레이션 구현, 테스트 작성, Bun 설치 또는 빌드 스크립트 전환
> **산출물**: npm에 배포 가능한 완성된 CLI 도구 (ESM/CJS dual support, proper exit codes, peerDeps)
> **예상工作量**: Medium — 24개 태스크 (기존 23개 + T0 추가)

---

## 현재 상태 진단

### ✅ 이미 잘 된 부분
- `src/tools/` — 5개 tool (init, preset, migrate-stub, validate, doctor) 완
- `src/core/` — 6개 generator (config, agents-md, command, agent, skill, env) 완
- `src/preset/registry.ts` — 모델/스택 프리셋 레지스트리 완
- `src/prompt/` — 위자드 + 질문 13개 완
- `src/doctor/` — 진단 checks + reporter 완
- `src/validator/` — 설정 검증 완
- `src/types/` — 3개 타입 파일 + barrel export 완
- `templates/` — AGENTS.md(5), agents(3), commands(4), skills(3), configs(5) 완
- `package.json`, `tsconfig.json`, `.gitignore` 완
- `DESIGN.md` — 매우 상세한 설계 문서 완

### 🔴 막혀 있는 부분 ( Critical)
1. **패키지명 충돌** — `oc-setup` 이름이 npm에 이미 존재함
   ```
   oc-setup@1.0.9 | "OpenClaw client setup CLI"
   by branson.atxx | published a month ago
   ```
   → 새 이름으로 변경 필수

2. **package.json이 npm production standard 미달** — 현재 필드:
   ```json
   { "name": "oc-setup", "version": "0.1.0", "license": "MIT" }
   ```
   → **13개 필수 필드 누락**: description, author, repository, homepage, bugs, keywords,
     funding, engines, files, exports, main, module, types

3. **tsconfig `"module": "preserve"` 문제** — esbuild/tsup 출력용이나 npm 배포 시 ESM import 실패 가능

4. **`.npmignore` 파일 없음** — npm publish 범위 통제 불가

5. **peerDependencies 미사용** — `@opencode-ai/plugin`가 dependencies에 있어 CLI-only 모드에서도 설치 시도

6. **Bun 미설치** — 빌드 스크립트가 `bun` 명령 사용하지만 환경에 없음

### 🟡 미완성 부분 (重要)
7. **마이그레이션 미구현** — `src/migrate/`에 stub만 있고 로직 없음
   - `claude-code.ts` 없음
   - `cursor.ts` 없음
   - `aider.ts` 없음

8. **테스트 없음** — `test/` 디렉토리 없음

9. **generator import 중복** — 각 generator 파일 하단에 import 문이 또出现 (syntax 오류)

---

## Work Objectives

### Core Deliverables
- npm에 배포 가능한 완성된 CLI 도구 (production-grade package.json)
- `npx {새이름} init`으로 OpenCode 환경 세팅 가능
- 마이그레이션 (Claude Code, Cursor, Aider) 완전 구현
- 테스트 커버리지 (단위 + 통합)

### 패키지명 결정 (가장 먼저)

| 옵션 | 이름 | 장점 | 단점 |
|------|------|------|------|
| A | `opencode-setup` | 의미 명확, 짧음 | npm에 존재하는지 미확인 |
| B | `@mercurypark/oc-setup` | 네임스페이스 분리, 作者 구분 | scoped package |
| C | `oc-setup-wizard` | 기존 이름 유사 | 김 |
| D | 직접 입력 | 마음에 드는 이름 | - |

### Must Have
- **package.json이 npm production standard 충족** (모든 권장 필드 포함)
- **ESM + CJS dual support** (`exports`, `main`, `module`, `types` 필드)
- **`peerDependencies`로 `@opencode-ai/plugin` 분리** (CLI-only 모드 호환)
- **`engines` 필드로 Node >=18 필수** (하위 호환성 경고 방지)
- **`files` 필드로 npm publish 범위 제한** (dist만 배포)
- **`.npmignore` 생성** (소스 코드 배포 방지)
- **`prepare` script** (설치 시 자동 빌드)
- **CLI shebang + exit code 처리**
- **tsconfig `module: "NodeNext"` 설정**
- 마이그레이션: Claude Code → OpenCode 변환 완
- npm publish 성공

### Must NOT Have
- Bun 의존성 (Bun 없어도 빌드 가능해야 함)
- 점유된 패키지명 사용
- 테스트 없는 배포
- insecure eval/Function 사용
- `oc-setup` 문자열이 소스/템플릿에 남아있음

---

## Verification Strategy

### QA Policy
모든 태스크는 agent-executed QA 포함:
- **CLI**: `node dist/cli.js {command}` 실행 → 출력 검증
- **Build**: `npm run build` → dist/*.js 생성 검증
- **Plugin**: `node dist/index.js` import → Plugin export 검증
- **Tests**: `npm test` → 모든 테스트 통과

### Test Decision
- **Infrastructure**: Bun:test (Bun 설치 필요) 또는 vitest (Bun 없이 가능)
- **선택 필요**: Bun 설치할지, vitest로 전환할지

---

## Execution Strategy

### Wave 1: 문제 해결 + 기초 다지기 (REVISED - T0 추가, 순서 변경)

```
Wave 1 (Foundation — 순서 엄격하게 지키기):
├── T0:  package.json + tsconfig + .npmignore + peerDependencies 전면 재정비  ⭐ NEW
├── T1:  패키지명 변경 + 모든 내부 참조 업데이트
├── T2:  빌드 esbuild 전환 + shebang + prepare script + exit code           ⭐ EXPANDED
├── T3:  generator import 중복 문제 해결
├── T4:  Bun 설치 (선택) 또는 build 테스트
├── T5:  tsconfig module:preserve → NodeNext 수정 + strict 확인              ⭐ EXPANDED
└── T6:  TypeScript strict 에러 전부 수정

Critical Path: T0 → T1 → T2 → T4 → T6 → (Build 통과) → Wave 2
Max Parallel: T1, T2, T3, T5 (T0 다음, 서로 독립)
```

### Wave 2: 마이그레이션 구현 (핵심 기능)
```
Wave 2 (Migration — T0~T6 완료 후):
├── T7:  마이그레이션 공통 유틸 (migrate/common.ts 확장)
├── T8:  Claude Code → OpenCode 마이그레이션 완
├── T9:  Cursor → OpenCode 마이그레이션
├── T10: Aider → OpenCode 마이그레이션
└── T11: setup_migrate tool + CLI migrate 연결

Max Parallel: T7 먼저, 그 후 T8/T9/T10 병렬, T11 마지막
```

### Wave 3: 테스트 + 문서
```
Wave 3 (Testing + Polish):
├── T12: 테스트 프레임워크 선택 + 설정 (Bun test 또는 vitest)
├── T13: generator 단위 테스트 (src/core/*)
├── T14: preset 레지스트리 테스트
├── T15: doctor checks 테스트
├── T16: validator 테스트
├── T17: 위자드 플로우 통합 테스트
└── T18: 마이그레이션 E2E 테스트

Max Parallel: T12 먼저, T13~T16 병렬, T17~T18 마지막
```

### Wave 4: 배포 + 자동화
```
Wave 4 (Deploy):
├── T19: npm 배포 최종 검증 (package.json 13개 필드 모두 충족 확인)
├── T20: GitHub Actions CI/CD workflow 추가
├── T21: 첫 번째 git commit + PR
├── T22: npm publish 실행
└── T23: 배포 확인 + 첫 릴리스 노트 작성
```

### Dependency Matrix

```
T0 (package.json 전면)  → T1 (패키지명 결정)
T1 (패키지명)          → T2 (빌드 전환)
T2 (빌드 전환)         → T4 (Bun/대체)
T3 (import fix)        → T4 (빌드 성공)
T5 (tsconfig 수정)     → T6
T4 (Bun/대체)          → T6 (빌드 성공)
T6 (에러 수정)         → Wave 2
T7 (공통 유틸)         → T8, T9, T10
T8, T9, T10            → T11
T11                     → Wave 3
T12                     → T13~T16
T13~T16                → T17~T18
T17~T18                → Wave 4
T19                     → T20, T21
T20, T21               → T22, T23
```

### Critical Path
```
T0 → T1 → T2 → T4 → T6 → T7 → T8 → T11 → T12 → T13~T18 → T19 → T22
```

---

## TODOs

### Wave 1

- [x] ~~**T0. package.json + tsconfig + .npmignore + peerDependencies 전면 재정비** ⭐ NEW~~ ✅ DONE
  - `package.json` rewritten with 23 production fields, name=`opencode-setup`, ESM build, peerDependencies
  - `tsconfig.json` updated to NodeNext module, strict mode
  - `.npmignore` created, `src/index.ts` plugin ctx added

- [ ] **T1. 패키지명 변경 + 모든 내부 참조 업데이트** ✅ DONE
  - `oc-setup` → `opencode-setup` in src/cli.ts, src/doctor/checks.ts, src/prompt/wizard.ts, README.md, DESIGN.md

- [ ] **T2. 빌드 esbuild/tsup 전환 + shebang + prepare script + exit code** 🔴 IN PROGRESS (BLOCKED)
  - ✅ tsup installed, build script working (ESM-only format)
  - ✅ Shebang added via sed in build script
  - ✅ Exit handlers added to src/cli.ts
  - ✅ `cp -r templates dist/templates` in build script
  - 🔴 **BROKEN**: `../../templates` path in 5 files resolves to wrong location after bundling
    - Fix needed in: `src/preset/registry.ts`, `src/core/skill-generator.ts`, `src/core/agents-md-generator.ts`, `src/core/command-generator.ts`, `src/core/agent-generator.ts`
    - Change `join(__dirname, "../../templates")` → `join(__dirname, "templates")`
    - Change `join(__dirname, "../../templates/skills")` → `join(__dirname, "templates/skills")`
    - etc.
  - After fix: rebuild and verify `node dist/cli.js --version` works

  **What to do**:

  **A) package.json 전체 재정비 (production standard):**
  ```json
  {
    "name": "{새이름}",
    "version": "0.1.0",
    "description": "OpenCode 환경 세팅 CLI + Plugin. 대화형으로 OpenCode 초기 환경을 구성하고 Claude Code, Cursor, Aider 설정을 마이그레이션합니다.",
    "type": "module",
    "license": "MIT",
    "author": "mercuryPark <{email}>",
    "repository": {
      "type": "git",
      "url": "https://github.com/mercuryPark/oc-setup"
    },
    "homepage": "https://github.com/mercuryPark/oc-setup#readme",
    "bugs": {
      "url": "https://github.com/mercuryPark/oc-setup/issues"
    },
    "keywords": [
      "opencode", "setup", "cli", "developer-tools",
      "ai-coding", "claude-code", "cursor", "aider",
      "configuration", "automation"
    ],
    "funding": {
      "type": "github",
      "url": "https://github.com/sponsors/mercurypark"
    },

    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js",
        "require": "./dist/index.cjs",
        "default": "./dist/index.js"
      },
      "./cli": {
        "import": "./dist/cli.js",
        "default": "./dist/cli.js"
      }
    },
    "bin": {
      "{새이름}": "./dist/cli.js"
    },

    "files": ["dist", "templates", "README.md", "LICENSE"],
    "engines": {
      "node": ">=18"
    },

    "scripts": {
      "build": "tsup src/index.ts src/cli.ts --format cjs,esm --outDir dist --target node18 --external @opencode-ai/plugin --external zod --external commander --external @inquirer/prompts --clean",
      "prepare": "npm run build",
      "lint": "tsc --noEmit",
      "test": "vitest run",
      "dev": "tsx src/cli.ts"
    },

    "peerDependencies": {
      "@opencode-ai/plugin": "^1.0.0"
    },
    "peerDependenciesMeta": {
      "@opencode-ai/plugin": {
        "optional": true
      }
    }
  }
  ```

  **B) peerDependencies 전환:**
  - `dependencies`에서 `@opencode-ai/plugin` 제거
  - `peerDependencies`로 이동 (위 package.json 참조)
  - `peerDependenciesMeta`로 optional 표시

  **C) .npmignore 생성:**
  ```
  # Source code (publish only built output)
  src/
  test/
  fixtures/
  *.ts
  !*.d.ts
  tsconfig.json
  vitest.config.*

  # Development
  .github/
  .vscode/
  .idea/
  .git*
  .sisyphus/

  # OS
  .DS_Store
  Thumbs.db

  # Logs
  *.log
  npm-debug.log*

  # Misc
  bun.lock
  bun.lockb
  coverage/
  ```

  **D) tsconfig.json 수정 (T5에서도 사용하므로 여기서 먼저):**
  - `"module": "preserve"` → `"module": "NodeNext"`
  - `"moduleResolution": "bundler"` → `"moduleResolution": "NodeNext"`
  - `"esModuleInterop": true` 추가
  - `"outDir": "dist"` 유지 (T0와 T5 중복 방지 위해 T0에서 처리)

  **E) plugin import graceful handling 추가 (src/index.ts):**
  ```typescript
  let pluginModule: typeof import("@opencode-ai/plugin") | null = null
  try {
    pluginModule = await import("@opencode-ai/plugin")
  } catch {
    // CLI-only mode - plugin SDK not available
  }
  ```

  **Must NOT do**:
  - 점유된 `oc-setup` 이름 그대로 사용
  - `"type": "module"` 제거 (ESM 필수)
  - `dist/`를 .gitignore에서 제거 (빌드 출력은 git 추적 안 함)

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []
  - Reason: 5개 파일 동시 수정, 설정 간 의존성 이해 필요

  **Parallelization**:
  - Can Run In Parallel: NO (Wave 1 첫 태스크, 모든 후속 태스크의 기반)
  - Blocks: T1, T2, T3, T4, T5, T6
  - Blocked By: None

  **References**:
  - npm official docs: package.json mandatory fields
  - Node.js docs: exports field, ESM/CJS dual support
  - DESIGN.md: 섹션 13 기술 스택

  **Acceptance Criteria**:
  - [ ] `npm pkg validate` → 통과
  - [ ] `node -e "const p=require('./package.json'); console.log(JSON.stringify(Object.keys(p)))"` → 20개+ 필드 확인
  - [ ] `npm view @opencode-ai/plugin` → peerDep로 인식
  - [ ] `cat .npmignore` → src/, *.ts, test/ 제외 확인
  - [ ] `cat tsconfig.json` → module: NodeNext, moduleResolution: NodeNext 확인

  **QA Scenarios**:
  ```
  Scenario: package.json이 npm production standard 충족
    Tool: Bash (npm)
    Steps:
      1. npm pkg validate
      2. node -e "
        const p = require('./package.json');
        const required = ['name','version','description','type','license','author',
          'repository','homepage','bugs','keywords','main','module','types','exports',
          'bin','files','engines','scripts','peerDependencies'];
        const missing = required.filter(f => !p[f]);
        console.log(missing.length === 0 ? 'ALL OK' : 'MISSING: ' + missing.join(', '));
      "
    Expected Result: ALL OK (모든 필드 존재)
    Evidence: .sisyphus/evidence/t0-pkg-standard.txt

  Scenario: .npmignore가 올바른 파일을 제외하는지 확인
    Tool: Bash (grep)
    Steps:
      1. cat .npmignore
      2. grep -E "^(src/|test/|\\*.ts$)" .npmignore
    Expected Result: src/, test/, *.ts가 .npmignore에 존재
    Evidence: .sisyphus/evidence/t0-npmignore.txt

  Scenario: tsconfig가 NodeNext module 설정인지 확인
    Tool: Bash (node)
    Steps:
      1. node -e "const t = require('./tsconfig.json'); console.log(t.compilerOptions.module, t.compilerOptions.moduleResolution)"
    Expected Result: NodeNext NodeNext
    Evidence: .sisyphus/evidence/t0-tsconfig-module.txt
  ```

  **Commit**: YES
  - Message: `chore: overhaul package.json with npm production standard fields, add .npmignore, peerDeps, NodeNext module`
  - Files: `package.json`, `.npmignore`, `tsconfig.json`, `src/index.ts`

---

- [ ] **T1. 패키지명 변경 + 모든 내부 참조 업데이트**

  **What to do**:
  - T0에서 설정한 새 이름을 모든 파일에 적용
  - `package.json`: name 필드 (T0에서 이미 처리 가능)
  - `README.md`: npm 배지, 설치 명령어, 모든 `oc-setup` → `{새이름}`
  - `DESIGN.md`: 모든 `oc-setup` → `{새이름}`
  - 모든 `src/**/*.ts`: `oc-setup` 문자열 참조 업데이트
  - 모든 `templates/**: oc-setup 문자열 참조 업데이트
  - `.github/workflows/*.yml`: `oc-setup` → `{새이름}`

  **Must NOT do**:
  - 점유된 `oc-setup` 이름 그대로 사용
  - `"oc-setup"`이 아닌 `"oc setup"` (공백) 입력

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Reason: 문자열 치환 패턴, grep + sed 또는 일괄 수정

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 1 (T1, T2, T3, T5 동시)
  - Blocks: T2
  - Blocked By: T0 (package.json name 설정 후)

  **References**:
  - `package.json` — name, bin 필드
  - `README.md` — npm 배지
  - DESIGN.md — 패키지명 참조

  **Acceptance Criteria**:
  - [ ] `npm view {새이름}` → "not found" (사용 가능) 또는 mercuryPark 점유
  - [ ] `grep -r "oc-setup" src/ templates/` → 점유된 이름 참조 없음
  - [ ] `grep -r "{새이름}" src/` → 새 이름 참조 확인

  **QA Scenarios**:
  ```
  Scenario: 패키지명이 npm에 존재하지 않는지 확인
    Tool: Bash (curl)
    Steps:
      1. npm view {새이름}
      2. If "npm notice ADDED..." or no output → name available
      3. If returns package info → name taken → pick different name
    Expected Result: "not found" 또는 mercuryPark이 作者
    Evidence: .sisyphus/evidence/t1-npm-check.txt

  Scenario: 모든 oc-setup 참조 제거 확인
    Tool: Bash (grep)
    Steps:
      1. grep -ri "oc-setup" src/ templates/ DESIGN.md README.md
      2. Exclude: .sisyphus/, dist/, node_modules/
    Expected Result: 점유된 "oc-setup" 문자열 없음 (새 이름으로 교체됨)
    Evidence: .sisyphus/evidence/t1-no-old-name.txt
  ```

  **Commit**: YES (T0와 묶어서)
  - Message: `chore: rename package to {새이름} and update all internal references`

---

- [ ] **T2. 빌드 esbuild/tsup 전환 + shebang + prepare script + exit code** ⭐ EXPANDED

  **What to do**:

  **A) tsup/esbuild 설치:**
  - `npm install -D tsup` (권장) 또는 `npm install -D esbuild`
  - tsup 권장 이유: cjs + esm dual output + d.ts 생성을 한 명령으로 처리

  **B) package.json scripts 업데이트:**
  ```json
  "scripts": {
    "build": "tsup src/index.ts src/cli.ts --format cjs,esm --outDir dist --target node18 --external @opencode-ai/plugin --external zod --external commander --external @inquirer/prompts --clean",
    "prepare": "npm run build",
    "dev": "tsx src/cli.ts"
  }
  ```

  **C) dist/cli.js에 shebang 추가:**
  - `#!/usr/bin/env node`이 빌드 출력에 포함되는지 확인
  - tsup 사용 시: `tsup --banner.js:{\"cli\":\"#!/usr/bin/env node\"}`
  - 또는 빌드 후 `chmod +x dist/cli.js` + prepare script에서 처리

  **D) CLI exit code 처리 (src/cli.ts):**
  ```typescript
  // cli.ts 하단
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
  ```

  **E) dist/ 디렉토리가 .gitignore에 있는지 확인 (이미 추가됨 ✅)**

  **Must NOT do**:
  - bun 명령 사용 (npm/node만)
  - TypeScript 소스(.ts)를 직접 실행
  - dist/를 repo에 커밋

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Reason: 설정 파일 수정 + 약간의 CLI 코드 추가

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 1 (T1, T2, T3, T5 동시)
  - Blocks: T4
  - Blocked By: T0 (tsup 설치), T1 (bin 이름)

  **References**:
  - `src/cli.ts` — CLI 진입점 (shebang, exit code 추가 위치)
  - npm bin documentation: shebang requirement
  - Node.js exit codes: SIGINT (130), uncaughtException (1)

  **Acceptance Criteria**:
  - [ ] `npm run build` → 성공 (0 errors)
  - [ ] `ls dist/` → `index.js`, `index.cjs`, `cli.js` 생성됨 (tsup dual output)
  - [ ] `head -1 dist/cli.js` → `#!/usr/bin/env node`
  - [ ] `node dist/cli.js --version` → 버전 출력
  - [ ] `node -e "import('./dist/index.js').then(m => console.log(Object.keys(m)))"` → Plugin export 확인
  - [ ] `node -e "require('./dist/index.cjs').then(m => console.log(Object.keys(m)))"` → CJS export 확인

  **QA Scenarios**:
  ```
  Scenario: shebang 확인
    Tool: Bash
    Steps:
      1. head -1 dist/cli.js
    Expected Result: #!/usr/bin/env node
    Evidence: .sisyphus/evidence/t2-shebang.txt

  Scenario: 빌드 성공 + dual output 확인
    Tool: Bash (npm)
    Preconditions: node >= 18
    Steps:
      1. npm run build
      2. ls -la dist/
      3. file dist/cli.js dist/index.js dist/index.cjs
    Expected Result: dist/cli.js + dist/index.js (ESM) + dist/index.cjs (CJS) 생성
    Failure Indicators: "command not found: bun", "build failed", missing files
    Evidence: .sisyphus/evidence/t2-build-success.txt

  Scenario: Plugin ESM + CJS dual import 확인
    Tool: Bash (node)
    Steps:
      1. node --input-type=module -e "import('./dist/index.js').then(m => console.log('ESM:', Object.keys(m)))"
      2. node -e "const m = require('./dist/index.cjs'); console.log('CJS:', Object.keys(m))"
    Expected Result: 둘 다 OcSetupPlugin export 확인
    Evidence: .sisyphus/evidence/t2-dual-import.txt

  Scenario: CLI exit code 처리 확인
    Tool: Bash
    Preconditions: SIGINT 시그널 테스트
    Steps:
      1. timeout 0.1s node dist/cli.js init || echo "Exit code: $?"
    Expected Result: 130 (SIGINT) 또는 0 (clean exit)
    Evidence: .sisyphus/evidence/t2-exit-code.txt
  ```

  **Commit**: YES (T0, T1과 묶어서)
  - Message: `chore: setup tsup build with ESM/CJS dual output, shebang, prepare script, and exit code handling`

---

- [ ] **T3. generator import 중복 문제 해결** ⚪ SKIP (not needed - no duplicate imports found)

  **What to do**:
  - 각 generator 파일 (`src/core/*.ts`) 하단에 있는 import 문을 파일 상단으로 이동
  - 현재 패턴: 파일 하단에 import 문이 또出现 → SyntaxError 발생 가능
  - 파일별 확인:
    - `config-generator.ts` — 상단에 import 있고, 아래쪽에 `import { mkdirSync... }` 추가 중복
    - `command-generator.ts` — import 두 번째出现
    - `agent-generator.ts` — import 두 번째出现
    - `skill-generator.ts` — import 두 번째出现
    - `env-generator.ts` — import 두 번째出现
    - `agents-md-generator.ts` — import 두 번째出现

  **Must NOT do**:
  - 기능 로직 변경 (import 위치만 이동)
  - 중복 import 제거 후 필요한 import 누락

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Reason: 파일당 2줄 수정, 패턴 단순

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 1 (T1, T2, T3, T5 동시)
  - Blocks: T4 (빌드 성공에 영향)
  - Blocked By: None (독립적)

  **References**:
  - `src/core/*.ts` — 모든 generator 파일
  - `src/prompt/questions.ts` — @inquirer/prompts import 패턴
  - `src/prompt/wizard.ts` — import 배치 참고

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` → 모든 generator 파일에서 import 중복/에러 없음
  - [ ] 각 generator 파일의 import 문이 파일 상단 1곳에만 존재

  **QA Scenarios**:
  ```
  Scenario: TypeScript 컴파일 에러 없는지 확인
    Tool: Bash (npx)
    Steps:
      1. npx tsc --noEmit 2>&1
    Expected Result: No errors (warnings are OK)
    Failure Indicators: "Duplicate identifier", "Cannot find module", "SyntaxError"
    Evidence: .sisyphus/evidence/t3-tsc-noemit.txt
  ```

  **Commit**: YES
  - Message: `fix: consolidate import statements at top of generator files`

---

- [ ] **T4. Bun 설치 또는 빌드 대체 확인** ⏸️ PENDING (Bun not installed, but npm/node works fine)

  **What to do**:
  - **선택지 A (Bun 설치)**: `curl -fsSL https://bun.sh/install | bash` → reload shell → `bun --version`
  - **선택지 B (npm만 사용)**: T2에서 이미 tsup로 빌드 전환했으므로 Bun 없이도 빌드 가능
  - Bun 선택 시: `bun install && bun run build && bun test` 모두 동작하는지 확인

  **Must NOT do**:
  - production dependency로 Bun 추가 (devDependencies만)
  - 기존 node_modules 삭제

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Reason: 설치 1회성 명령

  **Parallelization**:
  - Can Run In Parallel: NO (순차적)
  - Blocks: T6, Wave 2
  - Blocked By: T2 (빌드 스크립트 전환 완료 후)

  **References**:
  - DESIGN.md 섹션 13 — Bun 런타임 의존 명시
  - bun.sh/install 문서

  **Acceptance Criteria**:
  - [ ] `bun --version` → 버전 출력 (Bun 선택 시)
  - [ ] `bun install` → 0 vulnerabilities (Bun 선택 시)
  - [ ] `npm run build` → 성공 (Bun 미선택 시에도 가능)
  - [ ] `npm test` → 테스트 실행 (T12에서 설정 후)

  **QA Scenarios**:
  ```
  Scenario: Bun 설치 확인 (선택 시)
    Tool: Bash
    Steps:
      1. bun --version
      2. bun install
    Expected Result: 버전 출력 + 설치 성공
    Failure Indicators: "command not found: bun"
    Evidence: .sisyphus/evidence/t4-bun-install.txt

  Scenario: npm build만으로 빌드 성공 (선택 없이도 가능해야 함)
    Tool: Bash (npm)
    Steps:
      1. npm run build
    Expected Result: dist/cli.js + dist/index.js + dist/index.cjs 생성
    Evidence: .sisyphus/evidence/t4-npm-build.txt
  ```

  **Commit**: NO (설치 단계이므로)

---

- [ ] **T5. tsconfig module:preserve → NodeNext 수정 + strict 확인** ✅ DONE (merged into T0)

  **What to do**:
  - T0에서 tsconfig 수정을 이미 시도했으므로, **중복을 피해라** — 이미 수정되었으면 건너뛰기
  - 수정 안 되었으면:
    - `"module": "preserve"` → `"module": "NodeNext"`
    - `"moduleResolution": "bundler"` → `"moduleResolution": "NodeNext"`
    - `"esModuleInterop": true` 추가 (없으면)
    - `"allowSyntheticDefaultImports": true` 추가 (없으면)
  - compilerOptions 검증:
    - `"strict": true` 활성화 ✅ (이미 있음)
    - `"target": "ES2022"` ✅ (이미 있음)
    - `"declaration": true` ✅ (이미 있음)
    - `"outDir": "dist"` ✅ (이미 있음)

  **Must NOT do**:
  - `"allowJs": true` 추가 (TS-first 프로젝트이므로)
  - `"strict": false` 설정
  - T0에서 이미 수정된 경우 중복 수정

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Reason: 설정 파일 1개 수정

  **Parallelization**:
  - Can Run In Parallel: YES
  - Parallel Group: Wave 1 (T1, T2, T3, T5 동시)
  - Blocks: T6
  - Blocked By: T0 (T0에서 이미 처리했으면skip)

  **References**:
  - `tsconfig.json` — 현재 내용 확인
  - Node.js docs: ESM with TypeScript

  **Acceptance Criteria**:
  - [ ] `cat tsconfig.json | grep -E '"module"|"moduleResolution"'` → NodeNext NodeNext
  - [ ] `npx tsc --noEmit` → (strict 에러 확인용, T6에서 처리)

---

- [ ] **T6. TypeScript strict 모드 에러 전부 수정** ⏸️ PENDING (blocked by T2 completion)

  **What to do**:
  - `npx tsc --noEmit` 실행 → 모든 strict 에러 확인
  - T0~T5에서 module/resolution 수정이 TS 에러를 유발했는지 확인
  - 에러별 수정:
    - `noImplicitAny` → 적절한 타입 추가
    - `strictNullChecks` → null/undefined 처리 추가
    - `noUnusedLocals` / `noUnusedParameters` → 미사용 제거 또는 underscore prefix
    - `module` 변경으로 인한 import/export 에러 → ESM 호환 수정
    - 기타 strict 모드 에러
  - 모든 generator, tool, prompt, doctor, validator 파일 검증
  - **Plugin context parameter 추가** (src/index.ts):
    ```typescript
    export const OcSetupPlugin: Plugin = async (ctx) => {
      // ctx.directory, ctx.$ (BunShell), ctx.client 사용 가능
      return { tool: { /* ... */ } }
    }
    ```

  **Must NOT do**:
  - `as any` 남용 (필요한 곳만, JSDoc 주석 추가)
  - `@ts-ignore` 남용
  - strict 모드 비활성화

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []
  - Reason: 다수의 파일에서 다양한 타입 에러 수정, 경험 필요

  **Parallelization**:
  - Can Run In Parallel: NO (순차적)
  - Blocks: Wave 2
  - Blocked By: T2 (빌드 성공), T5 (tsconfig 확인)

  **References**:
  - DESIGN.md 섹션 13 — "TypeScript strict mode" 명시
  - 모든 `src/**/*.ts` 파일
  - Node.js docs: ESM/TypeScript integration

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` → 0 errors (warnings OK)
  - [ ] `npm run build` → 성공
  - [ ] `node dist/cli.js --version` → 출력

  **QA Scenarios**:
  ```
  Scenario: TypeScript 빌드 에러 없는지 확인
    Tool: Bash (npx)
    Steps:
      1. npx tsc --noEmit 2>&1 | grep -c "error TS"
    Expected Result: 0 errors
    Failure Indicators: any "error TS..." output
    Evidence: .sisyphus/evidence/t6-tsc-strict.txt

  Scenario: Plugin ctx parameter 추가 확인
    Tool: Bash (grep)
    Steps:
      1. grep -n "async (ctx)" src/index.ts
    Expected Result: Plugin function receives ctx parameter
    Evidence: .sisyphus/evidence/t6-plugin-ctx.txt
  ```

  **Commit**: YES
  - Message: `fix: resolve all TypeScript strict mode errors and add plugin ctx parameter`

---

### Wave 2

- [ ] **T7. 마이그레이션 공통 유틸 구현**

  **What to do**:
  - `src/migrate/common.ts` 확장:
    - `detectTool(path)` — 루트 디렉토리에서 사용 중인 도구 자동 감지
    - `parseFile(path)` — 파일 파싱 유틸 (JSON, YAML, Markdown)
    - `transformPermissions(rules)` — 규칙 변환 공통 로직
    - `validateOutput(config)` — 생성된 설정 유효성 검증
    - `copyDirectory(src, dest, transform?)` — 디렉토리 복사 + 변환
    - `generateWarnings(unhandled)` — 처리 불가 항목에 대한 경고 생성
  - `src/migrate/`에 새 파일 생성: `utils.ts`, `parser.ts`

  **Must NOT do**:
  - Claude Code/Cursor/Aider 전용 로직 (각 파일에 위임)
  - 원본 파일 덮어쓰기 (항상 백업 + 새 위치에 생성)

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []
  - Reason: 공통 infrastructure, 설계 결정 필요

  **Parallelization**:
  - Can Run In Parallel: NO (Wave 2 첫 태스크)
  - Blocks: T8, T9, T10
  - Blocked By: T6

---

- [ ] **T8. Claude Code → OpenCode 마이그레이션**

  **What to do**:
  - `src/migrate/claude-code.ts` 생성
  - DESIGN.md 섹션 3.1, 6.3 참조
  - 마이그레이션 대상:
    - `CLAUDE.md` → `AGENTS.md` (내용 보존, 헤더 추가)
    - `.claude/skills/*/SKILL.md` → `.opencode/skills/*/SKILL.md` (경로 복사)
    - `.claude/hooks/` → plugin hooks + commands (변환 가능한 것만)
    - `.claude/rules/*.md` → `AGENTS.md` ## Rules 섹션 병합
    - `.mcp.json` 또는 `claude_desktop_config.json` → `opencode.json` mcp 섹션
    - oh-my-claude-code 감지 → oh-my-opencode 설치 제안 + 에이전트 매핑

  **Must NOT do**:
  - 원본 파일 삭제/수정 (복사만)
  - 변환 불가능한 hook 자동 삭제 (경고만 표시)

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []
  - Reason: 복잡한 파일 변환, 다양한 에지 케이스

  **Parallelization**:
  - Can Run In Parallel: YES (T9, T10와 병렬)
  - Blocked By: T7

---

- [ ] **T9. Cursor → OpenCode 마이그레이션**

  **What to do**:
  - `src/migrate/cursor.ts` 생성
  - 마이그레이션 대상:
    - `.cursorrules` → `AGENTS.md` (Markdown 변환)
    - `.cursor/mcp.json` → `opencode.json` mcp 섹션
    - Cursor Rules (AI Rules for Model) → `opencode.json` agent 설정

  **Must NOT do**:
  - 원본 파일 삭제
  - Cursor 전용 기능 (Tab, Autocomplete) 무시 (OpenCode에 없는 기능은 경고)

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []
  - Reason: 파일 변환 + 구조 매핑

  **Parallelization**:
  - Can Run In Parallel: YES
  - Blocked By: T7

---

- [ ] **T10. Aider → OpenCode 마이그레이션**

  **What to do**:
  - `src/migrate/aider.ts` 생성
  - 마이그레이션 대상:
    - `.aider.conf.yml` → `opencode.json` (YAML 파싱, 모델/provider 변환)
    - conventions 파일 → `AGENTS.md` 병합
    - `/architect` → `plan` 에이전트 매핑

  **Must NOT do**:
  - 원본 YAML 삭제
  - Aider 전용 기능 (submodules, whole-file) 무시 (경고만)

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []
  - Reason: YAML 파싱 + 설정 변환

  **Parallelization**:
  - Can Run In Parallel: YES
  - Blocked By: T7

---

- [ ] **T11. setup_migrate tool + CLI migrate 연결**

  **What to do**:
  - `src/tools/setup-migrate.ts` 업데이트 (현재 stub → 실제 구현)
  - `src/migrate/common.ts`의 `runMigration()` 함수 구현
  - CLI의 `migrate` 명령 연결 (현재 "준비 중" → 실제 동작)
  - 플러그인 tool과 CLI 명령 연결 검증

  **Must NOT do**:
  - 마이그레이션 로직 직접 작성 (T8~T10에서 구현, 여기서는 연결만)

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []
  - Reason: 플러그인 SDK + CLI 연결, 경계값 처리

  **Parallelization**:
  - Can Run In Parallel: NO (T8~T10 완료 후)
  - Blocks: Wave 3
  - Blocked By: T8, T9, T10

---

### Wave 3

- [ ] **T12. 테스트 프레임워크 선택 + 설정**

  **What to do**:
  - **선택지 A (Bun 설치 시)**: `bun test` 사용 (内置)
    - `test/` 디렉토리 생성, `src/` 구조 미러링
  - **선택지 B (Bun 미설치)**: `vitest` 사용
    - `npm install -D vitest @vitest/coverage-v8`
    - `vitest.config.ts` 생성:
      ```typescript
      import { defineConfig } from 'vitest/config'
      export default defineConfig({
        test: {
          environment: 'node',
          globals: true,
          include: ['test/**/*.test.ts'],
          coverage: { reporter: ['text', 'html'] }
        }
      })
      ```
  - `test/fixtures/` — 마이그레이션 테스트용 샘플 데이터

  **Must NOT do**:
  - 복잡한 테스트 설정 (Wave 3에서 간단히 시작)

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: []
  - Reason: 설정 파일 생성

---

- [ ] **T13. generator 단위 테스트**

  **What to do**:
  - `test/core/config-generator.test.ts`
  - `test/core/agents-md-generator.test.ts`
  - `test/core/command-generator.test.ts`
  - `test/core/agent-generator.test.ts`
  - `test/core/skill-generator.test.ts`
  - `test/core/env-generator.test.ts`
  - 각 generator: 정상 입력 → 예상 출력 검증
  - 백업 로직 (.bak) 테스트

---

- [ ] **T14. preset 레지스트리 테스트**

  **What to do**:
  - `test/preset/registry.test.ts`
  - MODEL_PRESETS, STACK_PRESETS 로드 테스트
  - `getModelPreset()`, `getStackPreset()` 테스트
  - `applyPreset()` — 파일 생성 검증
  - 프리셋 존재 확인 (5개 모델 + 4개 스택)

---

- [ ] **T15. doctor checks 테스트**

  **What to do**:
  - `test/doctor/checks.test.ts`
  - 각 check 함수 mock 환경에서 테스트
  - `runAllChecks()` 출력 검증

---

- [ ] **T16. validator 테스트**

  **What to do**:
  - `test/validator/config-validator.test.ts`
  - 유효/무효 opencode.json 테스트
  - 유효/무효 AGENTS.md 테스트

---

- [ ] **T17. 위자드 플로우 통합 테스트**

  **What to do**:
  - `test/prompt/wizard.integration.test.ts`
  - CLI 플러그인 tool (`setup_init`) E2E 테스트
  - 파일 생성 결과 검증

---

- [ ] **T18. 마이그레이션 E2E 테스트**

  **What to do**:
  - `test/migrate/claude-code.test.ts`
  - `test/migrate/cursor.test.ts`
  - `test/migrate/aider.test.ts`
  - `test/fixtures/`에 Claude Code, Cursor, Aider 샘플 설정 배치
  - 마이그레이션 결과 검증 (AGENTS.md 내용, opencode.json 구조)

---

### Wave 4

- [ ] **T19. npm 배포 최종 검증**

  **What to do**:
  - T0의 package.json이 모든 npm production standard를 충족했는지 재확인
  - 13개 필드 완전 검증:
    - name ✅ (T1에서 처리)
    - version: 0.1.0 ✅
    - description ✅
    - type: module ✅
    - license: MIT ✅
    - author ✅
    - repository ✅
    - homepage ✅
    - bugs ✅
    - keywords ✅
    - main ✅
    - module ✅
    - types ✅
    - exports ✅
    - bin ✅
    - files ✅
    - engines ✅
    - scripts (build, prepare, test) ✅
    - peerDependencies + peerDependenciesMeta ✅
  - README.md npm 배지 → 새 이름 + 버전 반영
  - LICENSE 파일 존재 확인 (MIT)
  - `npm pkg validate` → 통과

  **Must NOT do**:
  - 이미 점유된 이름 사용
  - 필수 필드 누락

---

- [ ] **T20. GitHub Actions CI/CD workflow 추가**

  **What to do**:
  - `.github/workflows/` 디렉토리 생성
  - `ci.yml` — push/PR 시: lint + test + build
    ```yaml
    name: CI
    on: [push, pull_request]
    jobs:
      test:
        runs-on: ubuntu-latest
        strategy:
          matrix:
            node: ['18', '20', '22']
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: ${{ matrix.node }}
              cache: 'npm'
          - run: npm ci
          - run: npm run build
          - run: npm test
    ```
  - `release.yml` — release 생성 시: npm publish
    ```yaml
    name: Release
    on:
      release:
        types: [published]
    jobs:
      publish:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: '20'
              registry-url: 'https://registry.npmjs.org'
          - run: npm ci
          - run: npm run build
          - run: npm publish --access public
            env:
              NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    ```
  - **중요**: GitHub repo에 NPM_TOKEN secret 추가 필요 (사용자 작업)

  **Must NOT do**:
  - GitHub Actions secret 직접 추가 (사용자만 가능)
  - secret 값 노출

---

- [ ] **T21. 첫 번째 git commit + PR**

  **What to do**:
  - 모든 변경 사항 git add
  - 커밋 메시지: `feat: complete oc-setup with migration, tests, and CI/CD`
  - `git push origin master`
  - 또는 Pull Request 생성 (fork한 경우)

---

- [ ] **T22. npm publish 실행**

  **What to do**:
  - **선택지 A (로컬)**: `npm publish --access public` (2FA 끄거나 OTP 입력)
  - **선택지 B (GitHub Actions)**: `release.yml` workflow 실행
  - publish 후: `npm view {새이름}` → 업로드 확인
  - GitHub release 태그 + Release note 작성

  **Must NOT do**:
  - version 0.1.0을 1.0.0으로 올림 (초기에는 0.x.y 유지)
  - public 대신 private publish (무료 계정은 public만)

---

- [ ] **T23. 배포 확인 + 릴리스 노트**

  **What to do**:
  - `npm view {새이름}` → version, description 확인
  - `npm install -g {새이름}` → 글로벌 설치 테스트
  - `npx {새이름} --version` → CLI 동작 확인
  - GitHub Releases에 Release Note 작성:
    - 버전: 0.1.0
    - 기능 목록 (init, preset, migrate, doctor, validate)
    - 설치 방법
    - 마이그레이션支持的 도구 목록

---

## Final Verification Wave

- [ ] **F1. npm 배포 성공 확인**
  - `npm view {새이름}` → version 0.1.0 확인
  - `npm install -g {새이름}` → 설치 성공
  - `npx {새이름} init --help` → 도움말 출력

- [ ] **F2. 모든 CLI 명령 동작 확인**
  - `npx {새이름} init` → 대화형 위자드 실행
  - `npx {새이름} preset list` → 프리셋 목록 출력
  - `npx {새이름} doctor` → 환경 진단 실행
  - `npx {새이름} validate` → 설정 검증 실행
  - `npx {새이름} migrate claude-code` → 마이그레이션 실행

- [ ] **F3. GitHub Actions CI 통과 확인**
  - 모든 workflow green ✅

- [ ] **F4. TypeScript 빌드 + 테스트 통과**
  - `npx tsc --noEmit` → 0 errors
  - `npm test` → all pass
  - `npm run build` → Build success

---

## Commit Strategy

- **Wave 1**: `chore: foundation (package.json, build, tsconfig, types, exit codes)` — T0+T1+T2+T3+T5+T6 묶음
- **Wave 2**: `feat: implement migration for claude-code, cursor, aider` — T7~T11 묶음
- **Wave 3**: `test: add comprehensive test suite` — T12~T18 묶음
- **Wave 4**: `ci: add GitHub Actions and prepare for npm publish` — T19~T23 묶음

---

## Success Criteria

### Verification Commands
```bash
npm view {새이름}                    # npm에 배포됨 확인
npx {새이름} --version               # CLI 동작
npx {새이름} preset list             # 프리셋 목록
npx {새이름} doctor                  # 환경 진단
npx {새이름} validate                # 설정 검증
npx tsc --noEmit                     # TypeScript 0 errors
npm test                             # All tests pass
npm run build                        # Build success
npm pkg validate                     # package.json valid
```

### Final Checklist
- [ ] npm에 `{새이름}`으로 패키지 published
- [ ] package.json이 npm production standard 13개 필드 모두 충족
- [ ] ESM + CJS dual output (dist/index.js + dist/index.cjs)
- [ ] peerDependencies로 @opencode-ai/plugin 분리
- [ ] .npmignore로 소스 코드 배포 방지
- [ ] engines: node >=18 설정
- [ ] shebang + exit code 처리
- [ ] prepare script (자동 빌드)
- [ ] `npx {새이름} init` 대화형 위자드 동작
- [ ] Claude Code 마이그레이션 동작
- [ ] 모든 TypeScript strict 에러 해결
- [ ] 테스트 통과
- [ ] GitHub Actions CI green
- [ ] README.md에 npm 배지 + 설치 안내

---

## Appendix A: npm Production Package.json Checklist

```
필수 필드 (누락 시 npm 경고/거부):
☐ name          패키지 이름 (unique)
☐ version       시맨틱 버전 (0.1.0)
☐ license       라이선스 (MIT)
☐ description   설명 (npm 검색)
☐ main          CommonJS entry (dist/index.cjs)
☐ module        ESM entry (dist/index.js)
☐ types         TypeScript entry (dist/index.d.ts)
☐ exports       ESM/CJS conditional exports
☐ bin           CLI entry (dist/cli.js)
☐ files         npm publish 범위 (["dist"])
☐ engines       Node 버전 (">=18")
☐ scripts.build 빌드 명령

권장 필드 (품질 표기):
☐ author        作者 정보
☐ repository    소스 저장소
☐ homepage      프로젝트 페이지
☐ bugs          버그 리포트 URL
☐ keywords      npm 검색 키워드
☐ funding      Funding 링크

CLI 최적화:
☐ prepare       설치 시 자동 빌드
☐ bin shebang   #!/usr/bin/env node

타입 안전:
☐ peerDependencies       SDK 분리
☐ peerDependenciesMeta   optional 표시
```

## Appendix B: Bun 설치 방법 (선택, T4 참고)

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# 홈브류
brew install bun

# 설치 후
source ~/.zshrc
bun --version   # → 1.x.x
```

**Bun 설치 시 이점:**
- `bun install` → npm보다 10x 빠름
- `bun run build` → esbuild 내장
- `bun test` → Jest/Vitest 없이 테스트
- OpenCode 자체가 Bun 기반이므로 궁합 좋음

**하지만:** Bun 미설치라도 tsup + npm으로 100% 동일 결과물 생성 가능 (T2에서 처리)
