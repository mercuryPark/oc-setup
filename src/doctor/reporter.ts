import type { CheckResult } from "./checks.js"

export function formatReport(results: CheckResult[]): string {
  const lines: string[] = ["🩺 Environment Diagnosis\n"]

  let passCount = 0
  let warnCount = 0
  let failCount = 0

  for (const result of results) {
    if (result.status === "pass") passCount++
    else if (result.status === "warn") warnCount++
    else failCount++

    const icon = result.status === "pass" ? "✓" : result.status === "warn" ? "⚠" : "✗"
    const color = result.status === "pass" ? "32" : result.status === "warn" ? "33" : "31"

    lines.push(`\x1b[${color}m${icon} ${result.name}\x1b[0m ${result.message}`)

    if (result.status === "fail" && result.fix) {
      lines.push(`  \x1b[36m→\x1b[0m ${result.fix}`)
    }
  }

  lines.push("")
  lines.push("---")
  lines.push(`Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failures`)

  return lines.join("\n")
}
