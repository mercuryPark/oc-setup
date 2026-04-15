import type { UserProfile } from "../types"

/**
 * TUI 설정 생성
 * OpenCode TUI (Terminal User Interface) 설정
 */
export interface TUIConfig {
  theme?: string
  keybinds?: {
    submit?: string
    cancel?: string
    up?: string
    down?: string
  }
  scroll?: {
    style?: "line" | "block" | "bar"
    width?: number
  }
  diff?: {
    style?: "side-by-side" | "unified"
    contextLines?: number
  }
}

/**
 * TUI 설정 생성
 */
export function generateTUIConfig(profile: UserProfile): TUIConfig {
  return {
    theme: "opencode",
    keybinds: {
      submit: "Enter",
      cancel: "Escape",
      up: "ArrowUp",
      down: "ArrowDown",
    },
    scroll: {
      style: "line",
      width: 2,
    },
    diff: {
      style: "side-by-side",
      contextLines: 3,
    },
  }
}

/**
 * TUI 설정을 opencode.json에 포함
 */
export function addTUIConfigToGlobal(globalConfig: Record<string, unknown>, profile: UserProfile): void {
  globalConfig.tui = generateTUIConfig(profile)
}
