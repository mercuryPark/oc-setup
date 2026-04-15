/**
 * 사용자 친화적인 에러 메시지 변환
 * 기술적 에러를 한국어 사용자 액션으로 변환
 */

export interface ErrorMessage {
  technical: string
  userFriendly: string
  action: string
}

const ERROR_MAP: Record<string, ErrorMessage> = {
  ENOENT: {
    technical: "ENOENT: no such file or directory",
    userFriendly: "폴���를 찾을 수 없습니다.",
    action: "경로가 올바른지 확인해주세요. 폴터가 존재하지 않으면 먼저 생성해야 합니다.",
  },
  EACCES: {
    technical: "EACCES: permission denied",
    userFriendly: "파일 접근 권한이 없습니다.",
    action: "관리자 권한으로 실행하거나 파일 권한을 확인해주세요. (chmod 명령어 사용)",
  },
  EEXIST: {
    technical: "EEXIST: file already exists",
    userFriendly: "파일이 이미 존재합니다.",
    action: "기존 파일을 백업했습니다. 덮어쓰기를 원하시면 다시 시도해주세요.",
  },
  ENOTDIR: {
    technical: "ENOTDIR: not a directory",
    userFriendly: "경로가 폴터가 아닙니다.",
    action: "올바른 폴터 경로를 입력해주세요.",
  },
  EISDIR: {
    technical: "EISDIR: illegal operation on a directory",
    userFriendly: "폴터에 파일 작업을 시도했습니다.",
    action: "파일 경로를 입력해주세요. 폴터 경로가 아닌 파일 경로여야 합니다.",
  },
  EPERM: {
    technical: "EPERM: operation not permitted",
    userFriendly: "작업을 수행할 권한이 없습니다.",
    action: "관리자 권한으로 실행하거나 시스템 설정을 확인해주세요.",
  },
  NETWORK_ERROR: {
    technical: "fetch failed",
    userFriendly: "인터넷 연결에 문제가 있습니다.",
    action: "네트워크 연결을 확인하고 다시 시도해주세요. VPN이나 프록시 설정도 확인필요합니다.",
  },
  TIMEOUT: {
    technical: "ETIMEDOUT",
    userFriendly: "요청 시간이 초과되었습니다.",
    action: "잠시 후 다시 시도해주세요. 지속적으로 발생하면 서버 상태를 확인해주세요.",
  },
  JSON_PARSE: {
    technical: "Unexpected token",
    userFriendly: "설정 파일 형식이 올바르지 않습니다.",
    action: "JSON 파일에 오타가 있는지 확인해주세요. 따옴표나 쉼표를 점검하세요.",
  },
  MODULE_NOT_FOUND: {
    technical: "Cannot find module",
    userFriendly: "필요한 파일을 찾을 수 없습니다.",
    action: "npm install을 실행하여 의존성을 설치해주세요.",
  },
}

export function translateError(error: Error | string): ErrorMessage {
  const errorMessage = typeof error === "string" ? error : error.message

  for (const [code, message] of Object.entries(ERROR_MAP)) {
    if (errorMessage.includes(code) || errorMessage.includes(message.technical)) {
      return message
    }
  }

  return {
    technical: errorMessage,
    userFriendly: "오류가 발생했습니다.",
    action: "다시 시도하거나 관리자에게 문의해주세요.",
  }
}

/**
 * 에러 메시지 포맷팅 (콘솔 출력용)
 */
export function formatErrorForConsole(error: Error | string): string {
  const translated = translateError(error)

  return `
❌ ${translated.userFriendly}

💡 해결 방법:
${translated.action}

🔧 기술적 상세:
${translated.technical}
`
}

/**
 * 특정 작업 컨텍스트에 따른 에러 메시지
 */
export function getContextualErrorMessage(
  error: Error | string,
  context: "init" | "migrate" | "preset" | "validate" | "doctor"
): string {
  const translated = translateError(error)
  const baseMessage = formatErrorForConsole(error)

  const contextHelp: Record<string, string> = {
    init: "\n📚 도움말: 'opencode-setup init --help'로 더 많은 정보를 확인할 수 있습니다.",
    migrate: "\n📚 도움말: 마이그레이션 중 문제가 발생했습니다. 원본 파일은 안전하게 백업되었습니다.",
    preset: "\n📚 도움말: 'opencode-setup preset list'로 사용 가능한 프리셋을 확인하세요.",
    validate: "\n📚 도움말: opencode.json 파일 형식을 확인해주세요.",
    doctor: "\n📚 도움말: 환경 설정 문제입니다. 위 안내를 따라 해결해주세요.",
  }

  return baseMessage + (contextHelp[context] || "")
}
