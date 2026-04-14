## 0.1.0 (2026-04-14)

### Features
- **CLI Commands**: `init`, `preset`, `doctor`, `validate`, `migrate`
- **Migration Support**: Claude Code, Cursor, Aider → OpenCode
  - Claude Code: CLAUDE.md, skills, rules, MCP config
  - Cursor: .cursorrules, MCP settings
  - Aider: .aider.conf.yml, conventions
- **Preset System**: 5 model presets (budget, balanced, power, minimax, google-only) + 4 stack presets
- **Interactive Wizard**: Step-by-step OpenCode environment setup

### CLI Usage
```bash
# Initialize new project
npx opencode-setup init

# List available presets
npx opencode-setup preset list

# Apply a preset
npx opencode-setup preset apply frontend-ts

# Migrate from Claude Code
npx opencode-setup migrate claude-code

# Check environment
npx opencode-setup doctor

# Validate config
npx opencode-setup validate
```

### Plugin Integration
Works as an OpenCode plugin (`@opencode-ai/plugin`):
```typescript
import { OcSetupPlugin } from "opencode-setup"
```

### Technical
- TypeScript with strict mode
- ESM-only build (Node.js 18+)
- vitest for testing
- GitHub Actions CI/CD
