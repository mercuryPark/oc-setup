---
name: socket-io
description: Socket.io 기반 실시간 통신 구현. WebSocket 연결 관리, 이벤트 핸들링, 멀티플렉싱 패턴.
---

# Socket.io Development Guide

## Connection Management

### Client Connection
- Always implement reconnection strategy
- Handle connection errors gracefully
- Use namespaces for feature separation

### Server Setup
```javascript
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
  pingTimeout: 60000,
  pingInterval: 25000
})
```

## Event Patterns

### Naming Convention
- Use `snake_case` for event names
- Prefix: `user_`, `system_`, `room_`
- Example: `user_message_sent`, `system_notification`

### Acknowledgment Pattern
```javascript
// Client
socket.emit('send_message', data, (ack) => {
  if (ack.error) handleError(ack.error)
})

// Server
socket.on('send_message', async (data, callback) => {
  try {
    await saveMessage(data)
    callback({ success: true })
  } catch (err) {
    callback({ error: err.message })
  }
})
```

## Error Handling

- Implement connection state recovery
- Handle middleware errors
- Log socket errors for debugging
- Graceful degradation on connection loss

## Scaling

- Use Redis Adapter for multi-server setups
- Implement sticky sessions
- Consider horizontal scaling early
