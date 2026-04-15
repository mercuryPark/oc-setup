import { existsSync, cpSync } from "fs"

export function backupFile(filePath: string): string | null {
  if (!existsSync(filePath)) return null
  const backupPath = `${filePath}.bak.${Date.now()}`
  cpSync(filePath, backupPath)
  return backupPath
}
