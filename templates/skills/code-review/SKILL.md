---
name: code-review
description: 코드 리뷰 시 참조하는 체크리스트와 가이드라인. 코드 리뷰, PR 리뷰, 코드 품질 확인 시 사용.
---
# Code Review Checklist

## Security
- SQL injection, XSS, CSRF 취약점
- 민감한 데이터 노출 여부
- 인증/인가 누락

## Performance
- N+1 쿼리
- 불필요한 리렌더링
- 메모리 누수
- 큰 번들 사이즈

## Maintainability
- 단일 책임 원칙
- 함수/메서드 길이 (50줄 이하 권장)
- 네이밍 일관성
- 중복 코드

## Testing
- 새 기능에 테스트 존재하는지
- 엣지 케이스 커버
- 테스트 이름이 의도를 설명하는지
