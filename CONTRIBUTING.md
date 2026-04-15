# Contributing to @hoyeon0722/opencode-setup

## 개발 환경

- Node.js ≥20 (vitest 요구사항)
- Bun ≥1.0 (선택, dev 스크립트용)

## 시작

```bash
git clone https://github.com/mercuryPark/oc-setup
cd oc-setup
npm install
npm run test
```

## 커밋 컨벤션

Conventional Commits 사용:
- `feat:` 새 기능
- `fix:` 버그 수정
- `refactor:` 리팩토링
- `docs:` 문서
- `test:` 테스트
- `chore:` 빌드/도구

## PR 체크리스트

- [ ] 테스트 추가 또는 업데이트
- [ ] `npm run lint && npm run test` 통과
- [ ] CHANGELOG.md 업데이트 (breaking 은 명시)
