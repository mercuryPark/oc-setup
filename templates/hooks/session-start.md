---
name: session-start
description: OpenCode 세션 시작 시 실행. 환경 확인, 의존성 설치, 워밍업.
---

# Session Start Hook

## Purpose
Initialize the development environment when an OpenCode session begins.

## Common Tasks

1. **Environment Check**
   - Verify Node.js version
   - Check environment variables
   - Validate configuration files

2. **Dependency Installation**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Development Server**
   ```bash
   npm run dev &
   ```

## Usage

Runs automatically when you start working with OpenCode on this project.

## Configuration

Customize in `.opencode/commands/session-start.md` based on your project needs.
