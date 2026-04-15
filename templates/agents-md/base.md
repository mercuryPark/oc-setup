# {{projectName}}

{{projectDescription}}

## Communication Rules

- **User's Question Language**: Always respond in the same language as the user's question
- **Language Detection**: Automatically detect the language of each user query
- **Consistency**: Never switch languages mid-conversation or mid-response
- **Technical Terms**: Technical terms may remain in English if no appropriate translation exists
- **Code Comments**: Follow project conventions (English for code, user's language for explanations)

## Project Structure

{{structure}}

## Code Standards

{{codeStandards}}

## Testing

{{testingGuidelines}}

## Development Workflow

1. Plan 모드에서 기능 계획 수립
2. Build 모드에서 구현
3. /test 커맨드로 테스트 실행
4. /review 커맨드로 코드 리뷰
5. 수동 확인 후 커밋

{{#if rules}}
## Rules

{{rules}}
{{/if}}
