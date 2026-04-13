# {{projectName}}

풀스택 프로젝트.

## Project Structure

- `frontend/` - 프론트엔드
- `backend/` - 백엔드
- `shared/` - 공유 타입/유틸

## Code Standards

- TypeScript strict mode (프론트+백)
- 공유 타입은 shared/ 경유

## Testing

- 프론트: {{testRunner}}
- 백: 프레임워크별 테스트 러너
- E2E: playwright

## Rules

- API 계약은 shared/에 타입으로 정의
- 프론트-백 간 직접 import 금지, shared만 사용
