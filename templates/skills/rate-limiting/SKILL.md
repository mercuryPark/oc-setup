---
name: rate-limiting
description: API Rate Limiting 구현. Token bucket, Sliding window, 분산 환경 지원.
---

# Rate Limiting

## Algorithms

### Token Bucket
```typescript
class TokenBucket {
  constructor(private capacity: number, private refillRate: number) {}
  
  async consume(key: string, tokens: number): Promise<boolean> {
    const bucket = await redis.hmget(key, 'tokens', 'lastRefill')
    // Implementation
  }
}
```

### Sliding Window
More accurate but requires more memory.

## Implementation

### Redis-based
```typescript
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // requests
  duration: 1 // per second
})
```

### Express Middleware
```typescript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests'
}))
```

## Headers

Include rate limit info in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```
