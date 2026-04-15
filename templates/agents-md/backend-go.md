# {{projectName}}

Go 백엔드 프로젝트.

## Communication Rules

- **User's Question Language**: Always respond in the same language as the user's question
- **Language Detection**: Automatically detect the language of each user query
- **Consistency**: Never switch languages mid-conversation or mid-response
- **Technical Terms**: Technical terms may remain in English if no appropriate translation exists
- **Code Comments**: Follow project conventions (English for code, user's language for explanations)

## Project Structure

- `cmd/` - 진입점
- `internal/` - 비즈니스 로직
- `pkg/` - 외부 공개 패키지
- `api/` - API 핸들러

## Code Standards

- gofmt 준수
- 에러 래핑: fmt.Errorf("context: %w", err)
- 전역 상태 금지, 생성자 주입
- 모든 exported 함수에 GoDoc 주석

## Testing

- go test ./...
- 테이블 기반 테스트
- testcontainers (DB 테스트)

## Rules

- 핸들러에 비즈니스 로직 금지
- 모든 DB 쿼리는 repository 인터페이스 경유
