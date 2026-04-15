import type { Writable } from "stream"

export enum LogLevel {
  SILENT = 0,
  NORMAL = 1,
  VERBOSE = 2,
}

let _level: LogLevel = LogLevel.NORMAL
let _json: boolean = false
let _stdout: Writable = process.stdout
let _stderr: Writable = process.stderr

export function setLogLevel(level: LogLevel): void {
  _level = level
}

export function setJsonMode(enabled: boolean): void {
  _json = enabled
}

export function isJsonMode(): boolean {
  return _json
}

export function getLogLevel(): LogLevel {
  return _level
}

export function setStdout(out: Writable): void {
  _stdout = out
}

export function setStderr(err: Writable): void {
  _stderr = err
}

export function log(...args: unknown[]): void {
  if (_level === LogLevel.SILENT) return
  _stdout.write(formatArgs(args) + "\n")
}

export function error(...args: unknown[]): void {
  _stderr.write(formatArgs(args) + "\n")
}

export function warn(...args: unknown[]): void {
  if (_level === LogLevel.SILENT) return
  _stderr.write(formatArgs(args) + "\n")
}

export function verbose(...args: unknown[]): void {
  if (_level !== LogLevel.VERBOSE) return
  _stdout.write(formatArgs(args) + "\n")
}

export function json(data: unknown): void {
  if (!_json) return
  _stdout.write(JSON.stringify(data, null, 2) + "\n")
}

export function success(...args: unknown[]): void {
  if (_level === LogLevel.SILENT) return
  log(...args)
}

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a
      if (a === null || a === undefined) return String(a)
      if (a instanceof Error) return a.message
      try {
        return JSON.stringify(a)
      } catch {
        return String(a)
      }
    })
    .join(" ")
}

export function printResult(data: {
  success: boolean
  message: string
  details?: string[]
  warnings?: string[]
  [key: string]: unknown
}): void {
  if (_json) {
    const serializable: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null || Array.isArray(v)) {
        serializable[k] = v
      }
    }
    json(serializable)
  } else {
    if (data.success) {
      log(data.message)
    } else {
      error(data.message)
    }
    if (data.details?.length) {
      for (const d of data.details) log(`  • ${d}`)
    }
    if (data.warnings?.length) {
      for (const w of data.warnings) warn(`⚠️  ${w}`)
    }
  }
}
