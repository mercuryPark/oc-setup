# {{projectName}}

Python + FastAPI 프로젝트.

## Communication Rules

- **User's Question Language**: Always respond in the same language as the user's question
- **Language Detection**: Automatically detect the language of each user query
- **Consistency**: Never switch languages mid-conversation or mid-response
- **Technical Terms**: Technical terms may remain in English if no appropriate translation exists
- **Code Comments**: Follow project conventions (English for code, user's language for explanations)

## Project Structure

- `app/` - 메인 애플리케이션
- `app/routers/` - API 라우터
- `app/models/` - Pydantic 모델
- `app/services/` - 비즈니스 로직
- `tests/` - 테스트

## Code Standards

- Python 3.12+
- Type hints 필수
- ruff로 린트/포맷

## Testing

- pytest
- httpx (AsyncClient)

## Rules

- 라우터에 비즈니스 로직 금지
- 모든 엔드포인트에 Pydantic 응답 모델 정의
