---
name: authentication
description: 인증/인가 구현. JWT, OAuth 2.0, RBAC, Refresh Token rotation.
---

# Authentication & Authorization

## JWT Implementation

### Access Token
```typescript
const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
)
```

### Refresh Token
```typescript
const refreshToken = jwt.sign(
  { userId: user.id, tokenId: uuid() },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
)
// Store tokenId in database for revocation
```

## OAuth 2.0

### Flow Selection
- **Authorization Code**: Web applications
- **PKCE**: Mobile/SPA applications
- **Client Credentials**: Server-to-server

## RBAC (Role-Based Access Control)

```typescript
interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

const roles = {
  admin: ['*'],
  editor: ['posts:read', 'posts:write'],
  viewer: ['posts:read']
}
```

## Security Best Practices

- Use HTTPS only
- Store tokens in httpOnly cookies
- Implement token rotation
- Rate limit login attempts
- Log and monitor auth events
