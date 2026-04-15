# oc-setup 코드 리뷰 수정 계획

## TL;DR

> **Quick Summary**: 코드 리뷰에서 발견된 10개 문제(P0 5개, P1 3개, P2 2개)를 3 Phase로 나눠 수정
> 
> **Deliverables**: 
> - P0: 5개 에러 처리 수정 (setup-preset.ts, setup-migrate.ts, migrate/*.ts)
> - P1: 3개 플랫폼 호환성 수정 (doctor/checks.ts, setup-init.ts, wizard.ts)
> - P2: 2개 안정성 개선 (config-generator.ts, 백업 로테이션)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: P0 에러 처리 → P1 플랫폼 → P2 안정성

---

## Context

### Original Request
사용자가 oc-setup 패키지의 코드 리뷰를 요청했으며 4가지 관점(정상 동작, 사이드이펙트/엣지케이스, 보완 사항, 완성도 평가)으로 엄격한 피드백을 제공함.

### Review Findings 요약
|カテゴリ|発見問題数|深刻度|
|--------|----------|------|
| 에러 처리 (빈 캐치, unhandled rejection)| 7개 | 🔴 P0 |
| 플랫폼 호환성 (HOME 경로, which 명령어)| 4개 | 🟠 P1 |
| 안정성 (race condition, 비원자적 쓰기)| 3개 | 🟡 P2 |
| 아키텍처 (wizard.plugin 불일치)| 1개 | 🟠 P1 |

### Phase Plan

```
Wave 1 (Start Immediately - P0 에러 처리):
├── T1: setup-preset.ts - try-catch 추가
├── T2: setup-migrate.ts - try-catch 추가  
├── T3: migrate/common.ts - 빈 캐치 블록 제거
├── T4: migrate/claude-code.ts - JSON parse 예외 처리
└── T5: migrate/cursor.ts - JSON parse 예외 처리

Wave 2 (After Wave 1 - P1 플랫폼 호환):
├── T6: doctor/checks.ts - os.homedir() + Windows 지원
├── T7: setup-init.ts - path.join() 사용
└── T8: wizard.ts - 경로 처리 수정

Wave 3 (After Wave 2 - P2 안정성):
├── T9: config-generator.ts - 원자적 파일 쓰기
└── T10: 전체 generator - 백업 로테이션

Wave FINAL:
├── F1: bun test 실행 및 검증
└── F2: 빌드 확인
```

---

## Work Objectives

### Phase 1: P0 에러 처리 수정 (5개 파일)
1. setup-preset.ts - applyPreset 호출 시 try-catch
2. setup-migrate.ts - runMigration 호출 시 try-catch  
3. migrate/common.ts - copyDirectory의 빈 캐치 블록 console.warn으로 변경
4. migrate/claude-code.ts - settings.json JSON.parse를 try-catch로 감싸기
5. migrate/cursor.ts - mcpConfig JSON.parse를 try-catch로 감싸기

### Phase 2: P1 플랫폼 호환 (3개 파일)
6. doctor/checks.ts - process.env.HOME → os.homedir(), which → platform별 처리
7. setup-init.ts - template literal 경로 → path.join()
8. wizard.ts - template literal 경로 → path.join()

### Phase 3: P2 안정성 개선 (2개 영역)
9. config-generator.ts - 원자적 파일 쓰기 (temp + rename)
10. 전체 generator - 백업 파일을 .bak.타임스탬프로 변경

### Must Have
- 모든 수정 후 bun test 통과
- tsc --noEmit 통과
- Windows에서도 CLI가 동작하도록 수정

### Must NOT Have (Guardrails)
- 기존 기능 손상 금지
- 의도치 않은 breaking changes 금지

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: 기존 테스트 없음 → 수정 후 수동 검증
- **Framework**: bun test
- **Test Strategy**: 각 파일 수정 후 직접 실행하여 동작 확인

### QA Policy
모든 task는 agent-executed QA로 검증:
- 각 수정 파일 대해 해당 CLI command 실행 테스트
- opencode-setup doctor로 전체 환경 확인

---

## Execution Strategy

### Dependency Matrix
- T1-T5: 독립 실행 가능 (서로 의존 없음)
- T6-T8: Wave 1 완료 후 실행
- T9-T10: Wave 2 완료 후 실행
- F1-F2: Wave 3 완료 후 실행

---

## TODOs

- [ ] 1. setup-preset.ts - try-catch 추가

  **What to do**:
  - setupPresetApply.execute() 함수를 try-catch로 감싸기
  - 예외 발생 시 user-friendly한 에러 메시지 반환
  
  **References**:
  - src/tools/setup-preset.ts:19-28 - 현재 코드

  **Acceptance Criteria**:
  - [ ] applyPreset에서 예외 발생 시 unhandled rejection 없이 에러 메시지 반환
  - [ ] bun test 또는 수동 실행으로 동작 확인

- [ ] 2. setup-migrate.ts - try-catch 추가

  **What to do**:
  - execute() 함수를 try-catch로 감싸기
  - runMigration/autoMigrate 예외 처리
  
  **References**:
  - src/tools/setup-migrate.ts:12-18 - 현재 코드

  **Acceptance Criteria**:
  - [ ] migration 중 예외 발생 시 에러 메시지 반환

- [ ] 3. migrate/common.ts - 빈 캐치 블록 제거

  **What to do**:
  - copyDirectory의 catch { // skip }를 console.warn으로 변경
  - 에러 내용을 사용자에게 전달할 수 있도록 로깅 추가
  
  **References**:
  - src/migrate/common.ts:33-38 - copyDirectory 내 catch 블록

  **Acceptance Criteria**:
  - [ ] 파일 복사 실패 시 경고 메시지 출력

- [ ] 4. migrate/claude-code.ts - JSON parse 예외 처리

  **What to do**:
  - settings.json 파싱 부분 try-catch로 감싸기
  - 파싱 실패 시 warning 배열에 추가
  
  **References**:
  - src/migrate/claude-code.ts:46-55 - JSON.parse 호출부
  - src/migrate/claude-code.ts:68-76 - settings 파싱

  **Acceptance Criteria**:
  - [ ] corrupted settings.json에서도 마이그레이션이 중단되지 않고 경고만 출력

- [ ] 5. migrate/cursor.ts - JSON parse 예외 처리

  **What to do**:
  - MCP config JSON.parse를 try-catch로 감싸기
  
  **References**:
  - src/migrate/cursor.ts:18-28 - mcpConfig 파싱

  **Acceptance Criteria**:
  - [ ] corrupted MCP config에서도 마이그레이션이 계속됨

- [ ] 6. doctor/checks.ts - os.homedir() + Windows 지원

  **What to do**:
  - process.env.HOME을 os.homedir()로 교체
  - which 명령어 대신 플랫폼별 처리 (Windows: where, Unix: which)
  - .local/share 경로를.platform에 따라 다르게 처리
  
  **References**:
  - src/doctor/checks.ts:74,85,146 - HOME env 사용
  - src/doctor/checks.ts:23,136 - which 명령어

  **Acceptance Criteria**:
  - [ ] Windows 환경에서도 doctor 명령이 정상 실행
  - [ ] opencode가 설치되지 않은 경우에도 체크가 진행됨

- [ ] 7. setup-init.ts - path.join() 사용

  **What to do**:
  - template literal 경로 (${homeDir}/.config/...)를 path.join()으로 변경
  
  **References**:
  - src/tools/setup-init.ts:33,36,40,44,48,52,56 - 경로 문자열

  **Acceptance Criteria**:
  - [ ] Windows에서도 올바른 경로로 파일 생성

- [ ] 8. wizard.ts - 경로 처리 수정

  **What to do**:
  - wizard.ts 내 모든 template literal 경로를 path.join()으로 변경
  
  **References**:
  - src/prompt/wizard.ts:86 - homeDir 경로

  **Acceptance Criteria**:
  - [ ] CLI 모드에서 Windows 경로 정상 처리

- [ ] 9. config-generator.ts - 원자적 파일 쓰기

  **What to do**:
  - writeFileSync 대신 temp 파일 + rename 패턴 적용
  - mkdirSync 전에 existsSync 체크 제거 (recursive: true가 이미 안전함)
  
  **References**:
  - src/core/config-generator.ts:131-140 - writeConfig 함수

  **Acceptance Criteria**:
  - [ ] 시스템 크래시 시에도 파일이 완전히 작성되거나原来的 상태 유지

- [ ] 10. 전체 generator - 백업 로테이션

  **What to do**:
  - 모든 backupFile 함수를 타임스탬프 기반 백업으로 변경
  - 예: config.json.bak → config.json.bak.1713000000
  
  **References**:
  - src/core/config-generator.ts:124-129 - backupFile
  - src/core/command-generator.ts:22-27
  - src/core/agent-generator.ts:23-28
  - src/core/skill-generator.ts:43-48
  - src/core/agents-md-generator.ts:74-79

  **Acceptance Criteria**:
  - [ ] 여러 번 실행해도 이전 백업이 보존됨

---

## Final Verification Wave

- [ ] F1. **Build 검증** — `bun run build` 또는 `tsc --noEmit`
- [ ] F2. **TypeScript 에러 확인** — `lsp_diagnostics`
- [ ] F3. **CLI 명령어 테스트** — npx로 직접 실행 테스트

---

## Success Criteria

### Verification Commands
```bash
bun run build  # 빌드 성공
tsc --noEmit  # 타입 에러 없음
npx opencode-setup doctor  # 플랫폼 문제 없이 실행
npx opencode-setup validate  # 검증 명령 실행
```

### Final Checklist
- [ ] P0 5개 에러 처리 수정 완료
- [ ] P1 3개 플랫폼 호환 수정 완료
- [ ] P2 2개 안정성 개선 완료 (또는 Phase 3로 미룬 경우 기록)
- [ ] 빌드 및 타입 체크 통과