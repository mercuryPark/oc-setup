> **English** | [한국어](./README.md)

<div align="center">

# @hoyeon0722/opencode-setup

**Get OpenCode ready in one command.**

[![npm version](https://img.shields.io/npm/v/@hoyeon0722/opencode-setup?color=cb3837)](https://www.npmjs.com/package/@hoyeon0722/opencode-setup)
[![npm downloads](https://img.shields.io/npm/dm/@hoyeon0722/opencode-setup)](https://www.npmjs.com/package/@hoyeon0722/opencode-setup)
[![CI](https://github.com/mercuryPark/oc-setup/actions/workflows/ci.yml/badge.svg)](https://github.com/mercuryPark/oc-setup/actions/workflows/ci.yml)
[![coverage](https://codecov.io/gh/mercuryPark/oc-setup/branch/master/graph/badge.svg)](https://codecov.io/gh/mercuryPark/oc-setup)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![install size](https://packagephobia.com/badge?p=@hoyeon0722/opencode-setup)](https://packagephobia.com/result?p=@hoyeon0722/opencode-setup)
![No Telemetry](https://img.shields.io/badge/telemetry-none-success)

</div>

---

## Quick Start

```bash
npx @hoyeon0722/opencode-setup init
```

That's it. The interactive wizard walks you through provider selection, model configuration, agents, skills, and permissions — then generates everything OpenCode needs.

---

## Why

[OpenCode](https://opencode.ai) supports 75+ LLM providers and dozens of configuration options. That flexibility comes with questions:

- Which model should I use for `build` vs `plan`?
- How do I write `opencode.json` from scratch?
- What goes in `AGENTS.md`?
- How do I migrate my Claude Code / Cursor / Aider setup?

**opencode-setup** answers all of these interactively and generates production-ready config files.

---

## Features

### Interactive Wizard

Run `npx @hoyeon0722/opencode-setup init` and answer a few questions:

| Step | What it configures |
|------|--------------------|
| Provider & budget | Model selection optimized for your spend |
| Language & framework | Tailored AGENTS.md rules |
| Plugins & MCP | Auto-configured server templates |
| Permissions | Safe / balanced / auto mode |

### Presets

Skip the wizard entirely:

```bash
npx oc-setup preset apply balanced    # Sonnet + Flash ($20-40/mo)
npx oc-setup preset apply frontend-ts # TypeScript/React/Next.js stack
npx oc-setup preset apply budget      # Free tier (Big Pickle)
```

<details>
<summary>All presets</summary>

**Model presets:**

| Preset | Models | Cost |
|--------|--------|------|
| `budget` | Big Pickle | Free – $10 |
| `balanced` | Claude Sonnet + Gemini Flash | $20 – $40 |
| `power` | Claude Sonnet + Opus | $50+ |
| `minimax` | MiniMax M2.5 + Big Pickle | $5 – $15 |
| `google-only` | Gemini Pro + Flash | $15 – $30 |

**Stack presets:**

| Preset | Optimized for |
|--------|---------------|
| `frontend-ts` | TypeScript / React / Next.js |
| `backend-go` | Go backends |
| `backend-python` | Python / FastAPI |
| `fullstack` | Full-stack projects |

**OMO presets** (for [oh-my-opencode](https://www.npmjs.com/package/oh-my-opencode)):

| Preset | Description |
|--------|-------------|
| `omo-free` | Free-tier model mapping |
| `omo-premium` | High-performance model mapping |

</details>

### Migration

Coming from another AI coding tool?

```bash
npx oc-setup migrate claude-code   # CLAUDE.md, skills, rules, hooks
npx oc-setup migrate cursor        # .cursorrules, MCP settings
npx oc-setup migrate aider         # .aider.conf.yml, conventions
```

### Diagnostics

```bash
npx oc-setup doctor     # Check OpenCode, Bun, API keys, LSP, plugins
npx oc-setup validate   # Validate opencode.json and AGENTS.md
```

---

## What Gets Generated

```
~/.config/opencode/
  opencode.json              # Global config (provider, model, theme)

your-project/
  opencode.json              # Project config (permissions, MCP, LSP)
  AGENTS.md                  # Project rules & coding standards
  .env.example               # Environment variable template
  .opencode/
    agents/                  # Custom agents (reviewer, tester, planner)
    commands/                # Slash commands (/test, /lint, /review, /plan)
    skills/                  # Skills (code-review, testing, frontend-design)
```

---

## Plugin Usage

Add to your `opencode.json`:

```json
{
  "plugin": ["@hoyeon0722/opencode-setup"]
}
```

Then ask the AI: *"Set up my environment"* — it will invoke the `setup_init` tool automatically.

| Plugin Tool | CLI Equivalent | Description |
|-------------|----------------|-------------|
| `setup_init` | `oc-setup init` | Interactive setup |
| `setup_preset_list` | `oc-setup preset list` | List presets |
| `setup_preset_apply` | `oc-setup preset apply <name>` | Apply preset |
| `setup_migrate` | `oc-setup migrate <tool>` | Migrate config |
| `setup_validate` | `oc-setup validate` | Validate config |
| `setup_doctor` | `oc-setup doctor` | Environment check |

---

## Claude Code Migration Guide

| Claude Code | OpenCode | Notes |
|-------------|----------|-------|
| `CLAUDE.md` | `AGENTS.md` | Renamed |
| `skill/SKILL.md` | `.opencode/skills/` | Native compatible |
| hooks | plugin hooks + commands | Auto→plugin, manual→command |
| rules | `AGENTS.md` Rules section | Merged |
| oh-my-claude-code | oh-my-opencode | Plugin install + agent mapping |
| MCP servers | `opencode.json` mcp | Config structure converted |
| extended thinking | `reasoningEffort` | high / medium / low |

---

## CLI Flags

All commands support these global flags:

| Flag | Description |
|------|-------------|
| `--json` | Machine-readable JSON output |
| `-q, --quiet` | Suppress informational output |
| `-v, --verbose` | Show detailed output |

---

## Privacy

- **No telemetry.** This tool does not collect, transmit, or phone home any data.
- **No network calls.** Everything runs locally — file operations only.
- **No analytics.** Zero tracking, zero metrics, zero data collection.

Your config stays on your machine.

---

## Development

```bash
git clone https://github.com/mercuryPark/oc-setup.git
cd oc-setup
npm install
npm run build
npm run test
```

Requires Node.js >= 20.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

---

## License

[MIT](./LICENSE)

---

<div align="center">

**Zero learning curve. Maximum power.**

<a href="https://github.com/mercuryPark/oc-setup/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mercuryPark/oc-setup" />
</a>

</div>
