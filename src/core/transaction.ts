import { existsSync, unlinkSync, rmdirSync, renameSync, writeFileSync, mkdirSync } from "fs"

export interface FileOperation {
  type: "write" | "mkdir" | "backup"
  path: string
  backupPath?: string
  content?: string
}

export class FileTransaction {
  private operations: FileOperation[] = []
  private completed: FileOperation[] = []
  private rolledBack = false

  writeFile(filePath: string, content: string): void {
    const backupPath = existsSync(filePath) ? `${filePath}.txbak.${Date.now()}` : undefined

    this.operations.push({
      type: "write",
      path: filePath,
      content,
      backupPath,
    })
  }

  mkdir(dirPath: string): void {
    if (!existsSync(dirPath)) {
      this.operations.push({
        type: "mkdir",
        path: dirPath,
      })
    }
  }

  async execute(): Promise<void> {
    if (this.rolledBack) {
      throw new Error("Transaction has already been rolled back")
    }

    for (const op of this.operations) {
      try {
        if (op.type === "mkdir") {
          mkdirSync(op.path, { recursive: true })
          this.completed.push(op)
        }
      } catch (error) {
        await this.rollback()
        throw new Error(`Failed to create directory ${op.path}: ${error}`)
      }
    }

    for (const op of this.operations) {
      if (op.type === "write") {
        try {
          if (op.backupPath && existsSync(op.path)) {
            renameSync(op.path, op.backupPath)
          }
          writeFileSync(op.path, op.content!, "utf-8")
          this.completed.push(op)
        } catch (error) {
          await this.rollback()
          throw new Error(`Failed to write file ${op.path}: ${error}`)
        }
      }
    }
  }

  async rollback(): Promise<void> {
    if (this.rolledBack) return

    this.rolledBack = true

    for (const op of this.completed.reverse()) {
      try {
        if (op.type === "write") {
          if (op.backupPath && existsSync(op.backupPath)) {
            if (existsSync(op.path)) {
              unlinkSync(op.path)
            }
            renameSync(op.backupPath, op.path)
          } else if (existsSync(op.path)) {
            unlinkSync(op.path)
          }
        } else if (op.type === "mkdir") {
          try {
            rmdirSync(op.path)
          } catch {
          }
        }
      } catch {
      }
    }
  }

  commit(): void {
    for (const op of this.operations) {
      if (op.type === "write" && op.backupPath && existsSync(op.backupPath)) {
        try {
          unlinkSync(op.backupPath)
        } catch {
        }
      }
    }
  }
}

export async function withTransaction<T>(
  fn: (tx: FileTransaction) => Promise<T>
): Promise<T> {
  const tx = new FileTransaction()

  try {
    const result = await fn(tx)
    await tx.execute()
    tx.commit()
    return result
  } catch (error) {
    await tx.rollback()
    throw error
  }
}
