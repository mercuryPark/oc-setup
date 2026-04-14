# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
