---
name: redis-pubsub
description: Redis Pub/Sub 패턴으로 실시간 메시지 브로드캐스팅. 채팅방, 알림, 이벤트 전파.
---

# Redis Pub/Sub Guide

## Pattern Selection

### When to Use Pub/Sub
- Real-time notifications across servers
- Chat room message broadcasting
- Event-driven architecture

### When NOT to Use
- Persistent message queuing (use Streams)
- Complex routing (use message queues)

## Implementation

### Basic Pub/Sub
```javascript
// Publisher
redisClient.publish('chat:room:123', JSON.stringify(message))

// Subscriber
redisClient.subscribe('chat:room:123')
redisClient.on('message', (channel, message) => {
  io.to(channel).emit('new_message', JSON.parse(message))
})
```

## Channel Naming

- Pattern: `{service}:{resource}:{id}`
- Examples:
  - `chat:room:123`
  - `notification:user:456`
  - `system:broadcast`

## Best Practices

- Handle reconnection automatically
- Implement channel cleanup
- Monitor memory usage
- Use pattern matching carefully
