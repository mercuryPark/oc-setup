import { c } from "./color.js"

export function printError(what: string, why: string, fix: string): void {
  console.error(c.error(`✖ ${what}`))
  console.error(c.dim(`  이유: ${why}`))
  console.error(`  해결: ${fix}`)
}
