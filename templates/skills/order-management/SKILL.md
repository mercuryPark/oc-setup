---
name: order-management
description: 주문 라이프사이클 관리. 상태 전환, 이력 추적, 동시성 제어.
---

# Order Management System

## State Machine

### Order States
```
pending → paid → preparing → shipped → delivered
   ↓        ↓        ↓          ↓
cancelled  refund  failed     returned
```

### State Transitions
- Define allowed transitions explicitly
- Validate business rules before state change
- Log all state changes with timestamp

## Implementation

### Database Schema
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  status_history JSONB DEFAULT '[]',
  version INTEGER DEFAULT 1, -- for optimistic locking
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Optimistic Locking
```typescript
async updateOrderStatus(orderId: string, newStatus: string, currentVersion: number) {
  const result = await db.query(
    `UPDATE orders 
     SET status = $1, version = version + 1
     WHERE id = $2 AND version = $3
     RETURNING *`,
    [newStatus, orderId, currentVersion]
  )
  
  if (result.rowCount === 0) {
    throw new Error('Order was modified by another process')
  }
}
```

## Best Practices

- Never delete orders (soft delete only)
- Maintain complete audit trail
- Handle concurrent modifications
- Implement idempotent operations
