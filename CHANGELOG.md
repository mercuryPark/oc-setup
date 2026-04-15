# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
