# {{projectName}}

TypeScript + Next.js 프로젝트. App Router 사용.

## Project Structure

- `src/app/` - App Router 페이지 및 레이아웃
- `src/components/` - 재사용 컴포넌트
- `src/lib/` - 유틸리티, API 클라이언트
- `src/hooks/` - 커스텀 React 훅
- `src/types/` - TypeScript 타입 정의

## Code Standards

- TypeScript strict mode 활성화
- 함수형 컴포넌트 + React hooks 사용
- 네이밍: PascalCase (컴포넌트), camelCase (함수/변수), kebab-case (파일)
- 서버 컴포넌트 기본, 클라이언트는 필요시에만 'use client'

## Testing

- 테스트 러너: {{testRunner}}
- E2E: playwright
- 린트/포맷: {{linter}}
- 4단계: lint check → unit → integration → e2e

## Development Workflow

1. Plan 모드에서 기능 계획 수립
2. Build 모드에서 구현
3. /test 커맨드로 테스트 실행
4. /review 커맨드로 코드 리뷰
5. 수동 확인 후 커밋

## Rules

- 새 컴포넌트 작성 시 반드시 테스트 파일도 함께 생성
- API 호출은 src/lib/ 내 함수를 통해 수행
- 에러 바운더리를 페이지 단위로 설정
