import type { MCPConfig } from "../types"

/**
 * MCP 서버별 표준 설정 템플릿
 * OpenCode MCP 공식 문서 및 커뮤니티 best practice 기반
 */
export const MCP_TEMPLATES: Record<
  string,
  {
    name: string
    description: string
    config: MCPConfig
    envVars: string[]
    setupInstructions: string
  }
> = {
  figma: {
    name: "Figma",
    description: "Figma 파일 접근 및 디자인 시스템 연동",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "figma-developer-mcp"],
      env: {
        FIGMA_API_KEY: "{env:FIGMA_API_KEY}",
      },
    },
    envVars: ["FIGMA_API_KEY"],
    setupInstructions:
      "1. Figma Personal Access Token 발급: https://www.figma.com/developers/api#access-tokens\n2. .env 파일에 FIGMA_API_KEY=your_token 추가",
  },

  github: {
    name: "GitHub",
    description: "GitHub 저장소 조회, PR 관리, 이슈 추적",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "{env:GITHUB_TOKEN}",
      },
    },
    envVars: ["GITHUB_TOKEN"],
    setupInstructions:
      "1. GitHub Personal Access Token 발급 (repo 권한 필요)\n2. .env 파일에 GITHUB_TOKEN=your_token 추가",
  },

  notion: {
    name: "Notion",
    description: "Notion 페이지 조회 및 데이터베이스 관리",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: {
        OPENAPI_MCP_HEADERS: '{"Authorization": "Bearer {env:NOTION_API_KEY}", "Notion-Version": "2022-06-28"}',
      },
    },
    envVars: ["NOTION_API_KEY"],
    setupInstructions:
      "1. Notion Integration 생성: https://www.notion.so/my-integrations\n2. .env 파일에 NOTION_API_KEY=your_integration_token 추가\n3. 필요한 페이지/데이터베이스에 Integration 공유 설정",
  },

  sentry: {
    name: "Sentry",
    description: "Sentry 이슈 조회 및 에러 모니터링",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-sentry"],
      env: {
        SENTRY_AUTH_TOKEN: "{env:SENTRY_AUTH_TOKEN}",
      },
    },
    envVars: ["SENTRY_AUTH_TOKEN"],
    setupInstructions:
      "1. Sentry Auth Token 발급: https://sentry.io/settings/account/api/auth-tokens/\n2. .env 파일에 SENTRY_AUTH_TOKEN=your_token 추가",
  },

  "git-ingest": {
    name: "Git Ingest",
    description: "GitHub 저장소 전체 내용을 컨텍스트로 로드",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@opencode-ai/mcp-git-ingest"],
    },
    envVars: [],
    setupInstructions: "별도 설정 없이 바로 사용 가능합니다.",
  },

  brave: {
    name: "Brave Search",
    description: "웹 검색 기능",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-brave-search"],
      env: {
        BRAVE_API_KEY: "{env:BRAVE_API_KEY}",
      },
    },
    envVars: ["BRAVE_API_KEY"],
    setupInstructions:
      "1. Brave Search API Key 발급: https://api.search.brave.com/app/keys\n2. .env 파일에 BRAVE_API_KEY=your_key 추가",
  },

  filesystem: {
    name: "Filesystem",
    description: "로컬 파일 시스템 접근 (제한된 경로)",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-filesystem", "{env:PROJECT_DIR}"],
    },
    envVars: ["PROJECT_DIR"],
    setupInstructions: ".env 파일에 PROJECT_DIR=프로젝트_절대경로 추가 (예: /Users/name/my-project)",
  },

  postgres: {
    name: "PostgreSQL",
    description: "PostgreSQL 데이터베이스 쿼리 및 스키마 조회",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-postgres"],
      env: {
        DATABASE_URL: "{env:DATABASE_URL}",
      },
    },
    envVars: ["DATABASE_URL"],
    setupInstructions:
      ".env 파일에 DATABASE_URL=postgres://user:password@host:port/database 추가",
  },

  puppeteer: {
    name: "Puppeteer",
    description: "브라우저 자동화 및 웹 스크래핑",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-puppeteer"],
    },
    envVars: [],
    setupInstructions: "별도 설정 없이 바로 사용 가능합니다.",
  },

  fetch: {
    name: "Fetch",
    description: "HTTP 요청 수행",
    config: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@anthropic-ai/mcp-fetch"],
    },
    envVars: [],
    setupInstructions: "별도 설정 없이 바로 사용 가능합니다.",
  },
}

/**
 * MCP 서버 이름으로 설정 가져오기
 */
export function getMCPTemplate(name: string): typeof MCP_TEMPLATES[string] | undefined {
  return MCP_TEMPLATES[name]
}

/**
 * 사용 가능한 MCP 서버 목록
 */
export function getAvailableMCPs(): { name: string; description: string }[] {
  return Object.entries(MCP_TEMPLATES).map(([key, value]) => ({
    name: key,
    description: value.description,
  }))
}

/**
 * MCP 설정 생성 (템플릿 기반)
 */
export function createMCPConfig(
  mcpName: string,
  customConfig?: Partial<MCPConfig>
): MCPConfig | undefined {
  const template = MCP_TEMPLATES[mcpName]
  if (!template) return undefined

  return {
    ...template.config,
    ...customConfig,
  }
}

/**
 * MCP 환경변수 목록 가져오기
 */
export function getMCPEnvVars(mcpNames: string[]): string[] {
  const vars = new Set<string>()
  for (const name of mcpNames) {
    const template = MCP_TEMPLATES[name]
    if (template) {
      template.envVars.forEach((v) => vars.add(v))
    }
  }
  return Array.from(vars)
}

/**
 * MCP 설정 안내 문서 생성
 */
export function generateMCPSetupGuide(mcpNames: string[]): string {
  const lines: string[] = ["## MCP 서버 설정 가이드\n"]

  for (const name of mcpNames) {
    const template = MCP_TEMPLATES[name]
    if (template) {
      lines.push(`### ${template.name}`)
      lines.push(template.setupInstructions)
      lines.push("")
    }
  }

  return lines.join("\n")
}
