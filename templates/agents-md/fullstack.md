# {{projectName}}

풀스택 프로젝트.

## Communication Rules

- **User's Question Language**: Always respond in the same language as the user's question
- **Language Detection**: Automatically detect the language of each user query
- **Consistency**: Never switch languages mid-conversation or mid-response
- **Technical Terms**: Technical terms may remain in English if no appropriate translation exists
- **Code Comments**: Follow project conventions (English for code, user's language for explanations)

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
