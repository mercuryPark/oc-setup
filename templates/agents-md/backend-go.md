# {{projectName}}

Go 백엔드 프로젝트.

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
