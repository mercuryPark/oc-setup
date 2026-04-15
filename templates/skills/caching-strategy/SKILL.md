---
name: caching-strategy
description: 데이터 캐싱 전략. Redis, CDN, 브라우저 캐시. Cache invalidation 패턴.
---

# Caching Strategy

## Multi-Layer Caching

### Browser Cache
```http
Cache-Control: public, max-age=3600
ETag: "abc123"
```

### CDN Cache
- Cache static assets at edge
- Purge via API on deployments
- Use versioned filenames

### Application Cache (Redis)
```typescript
const cacheKey = `user:${userId}`
let user = await redis.get(cacheKey)

if (!user) {
  user = await db.query('SELECT * FROM users WHERE id = $1', [userId])
  await redis.setex(cacheKey, 3600, JSON.stringify(user))
}
```

## Cache Invalidation

### Strategies
1. **Time-based**: TTL
2. **Event-based**: On data change
3. **Version-based**: Increment version key

### Pattern: Cache-aside
```typescript
async function getUser(id: string) {
  const cached = await cache.get(id)
  if (cached) return cached
  
  const user = await db.get(id)
  await cache.set(id, user, 3600)
  return user
}
```

## Best Practices

- Set appropriate TTL based on data volatility
- Implement cache warming for critical data
- Monitor cache hit rates
- Handle cache failures gracefully (fallback to DB)
