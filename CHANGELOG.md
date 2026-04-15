# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-04-15

### Fixed

- README `plugin` key restored to singular form (was incorrectly changed to `plugins`)
- GitHub community files added: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- GitHub issue and PR templates added

### Changed

- README badges expanded to 5 (npm version, downloads, CI, license, install size)
- `package.json` `files` now includes CHANGELOG.md for npm distribution

---

## [0.3.0] - 2026-04-15

### Changed (Breaking)

- `FeatureConfig.agnetsMDSections` renamed to `agentsMDSections` (typo fix). External consumers using this field must update.

### Changed

- Unified `backupFile` into `src/utils/fs.ts` with timestamped backups (DRY fix)
- `config-validator.ts` now uses `homedir()` instead of `process.env.HOME` fallback
- CLI commands now return non-zero exit code on failure (preset apply, migrate)
- `doctor/checks.ts` uses `execFileSync` instead of `execSync` (security hardening)
- `doctor/checks.ts` no longer exposes API key names in output (security)

### Fixed

- Gracefully handle Ctrl+C ExitPromptError with user-friendly message and exit 130
- `migrate claude-code` now returns error when no Claude config exists
- OMO preset model IDs verified and corrected:
  - `google/antigravity-gemini-3-pro` → `google/gemini-3-pro-preview`
  - `kimi-for-coding/k2p5` → `moonshot/kimi-k2.5`
  - `venice/minimax-m2.7` → `opencode-go/minimax-m2.7`

### Removed

- None

### Dependencies

- Updated vitest to v1.x for Node 18 compatibility

---

## [0.2.1] - 2026-04-15

### Fixed

- **Package name alignment**: `@mercurypark/opencode-setup` → `@hoyeon0722/opencode-setup` across all sources
- **CLI version**: Now reads from `package.json` dynamically instead of hardcoded "0.1.0"
- **README JSON syntax**: Fixed invalid JSON in plugin installation example (`"plugin ["opencode-setup"]"` → `"plugins": ["@hoyeon0722/opencode-setup"]`)
- **Test runner**: Unified to vitest (previously mixed with bun:test)
- **Security**: Path traversal vulnerability in `setup_migrate` plugin tool (CVE candidate)

### Changed

- README now correctly documents migrate command as functional (removed "(준비 중)")
- README removed misleading "원자적 파일 작업" claim (FileTransaction was not wired)

### Dependencies

- Added `vitest` and `@vitest/coverage-v8` as devDependencies

---

## [0.2.0] - 2026-04-15

### Added

#### P0 - Critical Bug Fixes
- **MCP Server Templates**: Complete configurations for 10 services (Figma, GitHub, Notion, Sentry, Git Ingest, Brave Search, Filesystem, PostgreSQL, Puppeteer, Fetch)
- **Hook Migration**: Claude Code hook → OpenCode command conversion
- **Rule Merging**: `.claude/rules/*.md` → AGENTS.md ## Rules section
- **Transaction Rollback**: FileTransaction class for atomic file operations

#### P1 - Core Value Completion
- **Skill System**: 14 new templates (socket-io, redis-pubsub, payment-gateway, order-management, inventory-tracking, seo-optimization, rich-text-editor, media-handling, chart-library, data-fetching, caching-strategy, api-documentation, rate-limiting, authentication)
- **Agent System**: 10 new agents (websocket-expert, realtime-engineer, payment-expert, inventory-manager, seo-expert, content-editor, data-viz-expert, query-optimizer, api-designer, security-reviewer)
- **Hook Templates**: pre-commit, post-save, session-start
- **UX Enhancement**: Korean user-friendly error messages
- **TUI Config**: Added TUI configuration and default_agent setting

#### P2 - Feature Extensions
- **Migration**: Enhanced Cursor & Aider migration
- **Model Presets**: Now generate complete environments
- **Custom Presets**: Save and reuse user configurations

### Changed
- Test expectations updated for new MCP configurations

---

## [0.1.0] - 2026-04-14

### Added

- **Plugin System**: OpenCode plugin with 5 tools (setup_init, setup_preset_list, setup_preset_apply, setup_migrate, setup_doctor, setup_validate)
- **CLI Commands**: Full command-line interface with init, preset, migrate, validate, doctor subcommands
- **Preset System**: 
  - 5 model presets: budget, balanced, power, minimax, google-only
  - 4 stack presets: frontend-ts, backend-go, backend-python, fullstack
- **Config Generator**: Global and project config generation for OpenCode
- **Doctor Checks**: Environment diagnostics including OpenCode, Bun, API keys, LSP servers, and plugins
- **Validator**: Configuration file validation for opencode.json and AGENTS.md
- **Migration Support**: Claude Code to OpenCode migration infrastructure
- **Templates**: 
  - AGENTS.md templates for various project types
  - Command templates (/test, /lint, /review, /plan)
  - Agent templates (reviewer, tester, planner)
  - Skill templates (code-review, testing, frontend-design)
- **Test Suite**: 90 unit tests covering core modules

### Dependencies

- @opencode-ai/plugin - OpenCode plugin SDK (peer dependency)
- zod - Schema validation
- commander - CLI framework
- @inquirer/prompts - Interactive prompts

### Development

- TypeScript with strict mode
- Bun as runtime and test runner
- tsup for building
- MIT License
