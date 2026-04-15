/**
 * Model ID 검증 스크립트
 *
 * 사용법:
 *   npx tsx scripts/validate-models.ts
 *   npx tsx scripts/validate-models.ts --verbose
 *   npx tsx scripts/validate-models.ts --json
 *
 * 검증 대상:
 *   - src/ 내 모든 TypeScript 소스 파일
 *   - templates/omo/*.json 내 모델 ID
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join, relative } from "path"
import { parseArgs } from "util"

const ROOT = join(process.cwd(), "src")
const TEMPLATES = join(process.cwd(), "templates", "omo")

const KNOWN_PROVIDERS = new Set([
  "openai",
  "anthropic",
  "google",
  "opencode-go",
  "opencode-zen",
  "moonshotai",
  "moonshot",
  "deepseek",
  "kimi",
  "venice",
  "openrouter",
  "groq",
  "aws",
  "amazon-bedrock",
  "azure",
  "cloudflare-ai-gateway",
  "zenmux",
  "302-ai",
])

const KNOWN_OPENCODE_GO_MODELS = new Set([
  "glm-5",
  "glm-5.1",
  "kimi-k2.5",
  "minimax-m2.5",
  "minimax-m2.7",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
])

const SUSPICIOUS_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /^(?!.*\/).*$/,
    message: "Missing provider prefix (should be 'provider/model')",
  },
  {
    pattern: /antigravity-/,
    message: "Antigravity models are fictional",
  },
  {
    pattern: /kimi-for-coding\//,
    message: "Provider should be 'moonshotai' or 'moonshot', not 'kimi-for-coding'",
  },
  {
    pattern: /kimi-k2\.(?:0|1)(?![0-9])/,
    message: "Kimi k2.5 is the current version, not k2.0 or k2.1",
  },
  {
    pattern: /claude-(?:haiku|sonnet|opus)-[3-4]\.[0-9]/,
    message: "Anthropic model naming uses dashes, not dots (e.g., claude-sonnet-4-5, not claude-sonnet-4.5)",
  },
  {
    pattern: /gemini-(?:2\.[0-4]|3)-(?:pro|flash|lite)/,
    message: "Verify this Gemini model version is correct",
  },
  {
    pattern: /gpt-5\.[0-2]/,
    message: "Verify this GPT-5.x model version is correct",
  },
  {
    pattern: /^venice\//,
    message: "Venice provider model names may differ from other providers",
  },
  {
    pattern: /^local\./,
    message: "Local models need full qualified path (e.g., local.granite-3.3-2b-instruct@q8_0)",
  },
]

interface ValidationResult {
  file: string
  line: number
  modelId: string
  status: "ok" | "warning" | "error"
  reason?: string
}

function findTsFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...findTsFiles(full))
    } else if (entry.endsWith(".ts") || entry.endsWith(".json")) {
      files.push(full)
    }
  }
  return files
}

function extractModelIds(content: string, filePath: string): Array<{ modelId: string; line: number }> {
  const results: Array<{ modelId: string; line: number }> = []
  const lines = content.split("\n")
  const modelPattern = /"(anthropic|openai|google|opencode-go|opencode-zen|moonshotai|moonshot|deepseek|kimi|venice|openrouter|groq|aws|azure|local|302-ai)[^"]*\/[^"]+"|model:\s*"(anthropic|openai|google|opencode-go|opencode-zen|moonshotai|moonshot|deepseek|kimi|venice|openrouter|groq|aws|azure|local|302-ai)[^"]+"/gi

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const matches = line.matchAll(modelPattern)
    for (const match of matches) {
      const modelId = match[0].replace(/^model:\s*/, "").replace(/^"|"$/g, "").trim()
      results.push({ modelId, line: i + 1 })
    }
  }
  return results
}

function validateModel(modelId: string): ValidationResult | null {
  const [provider, ...rest] = modelId.split("/")
  const model = rest.join("/")
  const result: ValidationResult = {
    file: "",
    line: 0,
    modelId,
    status: "ok",
  }

  if (!provider || !model) {
    result.status = "error"
    result.reason = "Invalid format: missing provider or model name"
    return result
  }

  if (!KNOWN_PROVIDERS.has(provider) && !provider.startsWith("local")) {
    result.status = "warning"
    result.reason = `Unknown provider '${provider}' — may need verification`
  }

  if (provider === "opencode-go" && !KNOWN_OPENCODE_GO_MODELS.has(model)) {
    result.status = "warning"
    result.reason = `Unknown opencode-go model '${model}' — verify this is a valid model`
  }

  for (const { pattern, message } of SUSPICIOUS_PATTERNS) {
    if (pattern.source === "^(?!.*\\/).*$" && (provider === "local" || modelId.includes("/"))) {
      continue
    }
    if (pattern.test(modelId)) {
      if (result.status !== "error") {
        result.status = "warning"
      }
      result.reason = message
    }
  }

  return result
}

function runValidation(opts: { verbose: boolean; json: boolean }): void {
  const files = [
    ...findTsFiles(ROOT),
    ...readdirSync(TEMPLATES).map((f) => join(TEMPLATES, f)),
  ]

  const results: ValidationResult[] = []

  for (const file of files) {
    const content = readFileSync(file, "utf-8")
    const models = extractModelIds(content, file)
    for (const { modelId, line } of models) {
      const validated = validateModel(modelId)
      if (validated) {
        validated.file = relative(process.cwd(), file)
        validated.line = line
        if (validated.status !== "ok" || opts.verbose) {
          results.push(validated)
        }
      }
    }
  }

  const ok = results.filter((r) => r.status === "ok")
  const warnings = results.filter((r) => r.status === "warning")
  const errors = results.filter((r) => r.status === "error")

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          summary: { total: results.length, ok: ok.length, warnings: warnings.length, errors: errors.length },
          results,
        },
        null,
        2
      )
    )
    return
  }

  console.log("Model ID Validation Report")
  console.log("=".repeat(60))

  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length})`)
    for (const r of errors) {
      console.log(`  ${r.file}:${r.line} — ${r.modelId}`)
      if (r.reason) console.log(`    ${r.reason}`)
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length})`)
    for (const r of warnings) {
      console.log(`  ${r.file}:${r.line} — ${r.modelId}`)
      if (r.reason) console.log(`    ${r.reason}`)
    }
  }

  if (ok.length > 0 && opts.verbose) {
    console.log(`\n✅ OK (${ok.length})`)
    for (const r of ok) {
      console.log(`  ${r.file}:${r.line} — ${r.modelId}`)
    }
  }

  console.log(`\n---`)
  console.log(`Total: ${results.length} | OK: ${ok.length} | Warnings: ${warnings.length} | Errors: ${errors.length}`)

  if (errors.length > 0) {
    process.exit(1)
  }
}

const { values } = parseArgs({
  options: {
    verbose: { type: "boolean", short: "v", default: false },
    json: { type: "boolean", default: false },
  },
})

runValidation({ verbose: values.verbose ?? false, json: values.json ?? false })
