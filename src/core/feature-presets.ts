import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "..", "..", "templates")

export type FeatureType = "general" | "chat" | "ecommerce" | "content" | "dashboard" | "api"

export interface FeatureConfig {
  name: string
  description: string
  additionalAgents: string[]
  additionalSkills: string[]
  additionalCommands: string[]
  agentsMDSections: string[]
  recommendedPlugins: string[]
  envVars: string[]
  architectureTips: string[]
}

export const FEATURE_CONFIGS: Record<FeatureType, FeatureConfig> = {
  general: {
    name: "일반 웹/앱",
    description: "범용적인 웹 또는 모바일 애플리케이션",
    additionalAgents: [],
    additionalSkills: [],
    additionalCommands: [],
    agentsMDSections: [],
    recommendedPlugins: [],
    envVars: [],
    architectureTips: [],
  },
  chat: {
    name: "실시간 채팅/메신저",
    description: "WebSocket 기반 실시간 통신 애플리케이션",
    additionalAgents: ["websocket-expert", "realtime-engineer"],
    additionalSkills: ["socket-io", "redis-pubsub", "realtime-testing"],
    additionalCommands: ["/socket-debug", "/load-test"],
    agentsMDSections: [
      "## Realtime Architecture",
      "- WebSocket 연결 관리 및 재연결 전략",
      "- 메시지 큐(Redis/RabbitMQ) 활용",
      "- 수평적 확장 고려",
      "",
      "## Socket Events",
      "- 이벤트명: snake_case 사용",
      "- Acknowledgment 패턴 적용",
      "- 에러 핸들링 표준화",
      "",
      "## Message Schema",
      "- 모든 메시지에 timestamp 포함",
      "- sender_id, room_id 필수",
      "- message_type으로 구분 (text/image/file/system)",
    ],
    recommendedPlugins: ["oh-my-opencode"],
    envVars: ["REDIS_URL", "SOCKET_IO_PORT", "WS_MAX_CONNECTIONS"],
    architectureTips: [
      "Socket.io + Redis Adapter 조합 추천",
      "메시지 영속화는 MongoDB 또는 PostgreSQL",
      "부하 테스트는 Artillery 또는 k6 사용",
    ],
  },
  ecommerce: {
    name: "이커머스/쇼핑몰",
    description: "상품 판매 및 결제 시스템",
    additionalAgents: ["payment-expert", "inventory-manager"],
    additionalSkills: ["payment-gateway", "order-management", "inventory-tracking"],
    additionalCommands: ["/order-status", "/inventory-check"],
    agentsMDSections: [
      "## Payment Integration",
      "- 결제 gateway 추상화 레이어 구현",
      "- Webhook 처리 및 멱등성 보장",
      "- 환불/취소 프로세스 표준화",
      "",
      "## Inventory Management",
      "- 재고 차감은 트랜잭션 내에서 처리",
      "- 동시성 제어(Optimistic Locking)",
      "- 재고 부족 알림 시스템",
      "",
      "## Order Lifecycle",
      "- 상태: pending → paid → preparing → shipped → delivered",
      "- 각 상태별 전환 검증",
      "- 이력 관리",
    ],
    recommendedPlugins: ["oh-my-opencode"],
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "PAYMENT_GATEWAY_MODE"],
    architectureTips: [
      "결제는 반드시 테스트 모드로 먼저 개발",
      "주문-결제-재고는 Saga 패턴 고려",
      "PG사 정산 리포트와 주기적 대조",
    ],
  },
  content: {
    name: "콘텐츠/블로그/CMS",
    description: "콘텐츠 관리 및 게시 시스템",
    additionalAgents: ["seo-expert", "content-editor"],
    additionalSkills: ["seo-optimization", "rich-text-editor", "media-handling"],
    additionalCommands: ["/seo-check", "/publish-content"],
    agentsMDSections: [
      "## Content Structure",
      "-_slug 기반 URL",
      "- draft/published/archived 상태 관리",
      "- 버전 관리 고려",
      "",
      "## SEO Requirements",
      "- meta title/description 필수",
      "- Open Graph 태그",
      "- structured data (JSON-LD)",
      "",
      "## Media Handling",
      "- 이미지 최적화 (WebP 변환)",
      "- CDN 활용",
      "- lazy loading",
    ],
    recommendedPlugins: [],
    envVars: ["CDN_URL", "MEDIA_STORAGE_BUCKET"],
    architectureTips: [
      "정적 콘텐츠는 CDN 캐싱 적극 활용",
      "에디터는 TipTap 또는 Slate.js 추천",
      "SEO는 SSR 필수",
    ],
  },
  dashboard: {
    name: "데이터 대시보드/관리자",
    description: "데이터 시각화 및 관리 인터페이스",
    additionalAgents: ["data-viz-expert", "query-optimizer"],
    additionalSkills: ["chart-library", "data-fetching", "caching-strategy"],
    additionalCommands: ["/query-analyze", "/cache-stats"],
    agentsMDSections: [
      "## Data Fetching",
      "- React Query/SWR 필수",
      "- Pagination + Cursor 기반",
      "- Optimistic Updates",
      "",
      "## Visualization",
      "- Chart.js, Recharts, 또는 D3",
      "- 반응형 디자인",
      "- 로딩 상태 처리",
      "",
      "## Performance",
      "- 데이터 캐싱 전략",
      "- Debounce/Throttle",
      "- Virtualization (목록이 긴 경우)",
    ],
    recommendedPlugins: [],
    envVars: ["ANALYTICS_DB_URL", "DASHBOARD_CACHE_TTL"],
    architectureTips: [
      "집계 쿼리는 materialized view 고려",
      "실시간 데이터는 WebSocket 활용",
      "차트 데이터는 서버에서 미리 가공",
    ],
  },
  api: {
    name: "API 서버/백엔드",
    description: "RESTful 또는 GraphQL API 서비스",
    additionalAgents: ["api-designer", "security-reviewer"],
    additionalSkills: ["api-documentation", "rate-limiting", "authentication"],
    additionalCommands: ["/api-test", "/security-scan"],
    agentsMDSections: [
      "## API Design",
      "- RESTful 원칙 준수",
      "- 버전 관리 (/v1/, /v2/)",
      "- 일관된 에러 응답 형식",
      "",
      "## Authentication",
      "- JWT 또는 OAuth 2.0",
      "- Refresh Token rotation",
      "- RBAC 권한 관리",
      "",
      "## Documentation",
      "- OpenAPI/Swagger 필수",
      "- 예시 request/response 포함",
      "- 에러 케이스 문서화",
    ],
    recommendedPlugins: ["oh-my-opencode"],
    envVars: ["JWT_SECRET", "API_RATE_LIMIT", "CORS_ORIGIN"],
    architectureTips: [
      "API Gateway(Kong/AWS API Gateway) 고려",
      "Rate Limiting 필수",
      "Request/Response 로깅",
    ],
  },
}

export function getFeatureConfig(featureType: FeatureType): FeatureConfig {
  return FEATURE_CONFIGS[featureType] || FEATURE_CONFIGS.general
}

export function getAllFeatureTypes(): { value: FeatureType; name: string; description: string }[] {
  return Object.entries(FEATURE_CONFIGS).map(([key, config]) => ({
    value: key as FeatureType,
    name: config.name,
    description: config.description,
  }))
}
