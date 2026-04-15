---
name: pre-commit
description: Git commit 전 자동 실행되는 검사. 린트, 테스트, 타입 체크.
---

# Pre-Commit Hook

## Purpose
Automatically run checks before each git commit to ensure code quality.

## Recommended Checks

1. **Linting**
   ```bash
   npm run lint
   ```

2. **Type Checking**
   ```bash
   npm run type-check
   ```

3. **Unit Tests (fast)**
   ```bash
   npm test -- --testPathPattern=unit --maxWorkers=2
   ```

4. **Format Check**
   ```bash
   npm run format:check
   ```

## Usage

This hook is triggered automatically before every commit. If any check fails, the commit will be aborted.

## Bypass

In emergency situations, you can bypass the hook:
```bash
git commit --no-verify -m "Emergency fix"
```

## Configuration

Edit `.opencode/commands/pre-commit.md` to customize the checks for your project.
