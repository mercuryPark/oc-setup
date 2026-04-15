---
name: post-save
description: 파일 저장 후 자동 실행. 포맷팅, 자동 수정, 실시간 린트.
---

# Post-Save Hook

## Purpose
Perform automatic actions after files are saved in the editor.

## Common Actions

1. **Auto-format**
   - Run formatter on the saved file
   - Fix indentation and spacing

2. **Auto-fix Lint Errors**
   - Fix auto-fixable linting issues
   - Show remaining errors

3. **Import Organization**
   - Sort and organize imports
   - Remove unused imports

## Usage

This hook runs automatically when you save files in OpenCode. Configure which actions to run in your project settings.

## Performance

- Only runs on the saved file, not the entire project
- Skips if the file hasn't changed
- Respects `.gitignore` patterns
