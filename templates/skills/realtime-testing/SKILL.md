---
name: realtime-testing
description: 실시간 기능 테스트. WebSocket 테스트, 부하 테스트, 이벤트 시뮬레이션.
---

# Real-time Testing

## WebSocket Testing

### Unit Tests
```typescript
describe('WebSocket Handler', () => {
  it('should handle client connection', async () => {
    const client = io('ws://localhost:3000')
    await new Promise((resolve) => client.on('connect', resolve))
    expect(client.connected).toBe(true)
  })
})
```

### Load Testing with Artillery
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Connect and send message"
    weight: 50
    engine: ws
```

## Event Simulation

### Mocking Socket.io
```typescript
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  join: jest.fn(),
  leave: jest.fn()
}

handleMessage(mockSocket as any, testData)
expect(mockSocket.emit).toHaveBeenCalledWith('message:received')
```

## Testing Checklist

- Connection/reconnection scenarios
- Concurrent client handling
- Event ordering guarantees
- Error propagation
- Memory leak detection
