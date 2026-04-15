import pc from "picocolors"

export const c = {
  success: (s: string) => pc.green(s),
  error: (s: string) => pc.red(s),
  warn: (s: string) => pc.yellow(s),
  info: (s: string) => pc.cyan(s),
  dim: (s: string) => pc.dim(s),
  bold: (s: string) => pc.bold(s),
}
