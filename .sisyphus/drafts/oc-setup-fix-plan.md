# oc-setup 코드 리뷰 수정 계획

## 수정 우선순위

### Phase 1 (출시 전): 에러 처리 + 플랫폼 호환성

#### P0 - 즉시 수정 필요

1. **setup-preset.ts** - try-catch 추가
   - applyPreset 호출 시 unhandled rejection 방지

2. **setup-migrate.ts** - try-catch 추가
   - runMigration/autoMigrate 호출 시 예외 처리

3. **migrate/common.ts** - 빈 캐치 블록 처리
   - copyDirectory의 catch { // skip } 제거
   - console.warn 또는 에러 수집으로 변경

4. **migrate/claude-code.ts** - JSON parse try-catch
   - settings.json 파싱 시 예외 처리 추가

5. **migrate/cursor.ts** - JSON parse try-catch
   - MCP config 파싱 시 예외 처리 추가

#### P1 - 중요 (초기 배포 전)

6. **doctor/checks.ts** - Windows 호환성
   - process.env.HOME → os.homedir()로 변경
   - which 명령어 → Windows.where 고려
   - .local/share 경로 → 플랫폼별 처리

7. **setup-init.ts, wizard.ts** - 경로 처리 수정
   - template literal 경로 → path.join() 사용

8. **wizard.ts** - plugin mode 지원 검토
   - 플러그인에서 호출할지 여부 결정
   - 별도 구현이 필요하면 분리

### Phase 2 (출시 후): 안정성 개선

9. **config-generator.ts** - 원자적 파일 쓰기
   - writeFileSync → temp 파일 + rename 패턴

10. **모든 generator** - 백업 로테이션
    - .bak.타임스탬프 형태로 변경

### Phase 3 (v0.2+): 기능 확장

11. 테스트 코드 작성
12. Progress bar 추가
13. Plugin mode wizard 지원

---

## Self-Clearance Check

- [x] Core objective: 코드 리뷰 기반 수정 계획 수립
- [x] Scope boundaries: Phase 1-3 모든 항목 포함
- [x] No critical ambiguities remaining
- [x] Technical approach: 각 파일별 구체적 수정 내용 결정
- [x] Test strategy: bun test로 검증
- [x] No blocking questions outstanding

→ ALL YES. Proceed to plan generation.