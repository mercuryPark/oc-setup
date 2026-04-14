import { mkdirSync, existsSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import type { OMOConfig, OMOProfile } from "../types"

/**
 * OMO 설정 파일 경로
 */
export function getOMOConfigPath(homeDir: string): string {
  return join(homeDir, ".config/opencode/oh-my-opencode.json")
}

/**
 * OMO 설정을 JSON으로 직렬화
 */
export function serializeOMOConfig(config: OMOConfig): string {
  // 모든 키를 kebab-case로 변환
  const toKebabCase = (str: string): string =>
    str.replace(/([A-Z])/g, "-$1").toLowerCase()

  const transformRecord = <T>(record: Record<string, T | undefined>): Record<string, T> =>
    Object.fromEntries(
      Object.entries(record)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [toKebabCase(key), value])
    ) as Record<string, T>

  const transformed = {
    agents: transformRecord(config.agents),
    categories: transformRecord(config.categories),
  }

  return JSON.stringify(transformed, null, 2) + "\n"
}

/**
 * OMO 설정 파일 생성
 */
export function writeOMOConfig(omoProfile: OMOProfile | undefined, homeDir: string): void {
  if (!omoProfile?.enabled || !omoProfile.config) {
    return
  }

  const configPath = getOMOConfigPath(homeDir)
  const configDir = dirname(configPath)

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  const content = serializeOMOConfig(omoProfile.config)
  writeFileSync(configPath, content, "utf-8")
}

/**
 * OMO 설정 유효성 검사
 */
export function validateOMOConfig(config: OMOConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.agents.sisyphus?.model) {
    errors.push("sisyphus agent의 model은 필수입니다")
  }

  // 필수 에이전트 체크
  const requiredAgents = ["sisyphus"]
  for (const agent of requiredAgents) {
    if (!config.agents[agent]) {
      errors.push(`필수 에이전트 ${agent}가 설정되지 않았습니다`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
