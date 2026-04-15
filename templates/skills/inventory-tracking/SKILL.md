---
name: inventory-tracking
description: 재고 관리 및 추적. 동시성 제어, 재고 차감, 알림 시스템.
---

# Inventory Tracking System

## Core Principles

### Transaction Safety
- Inventory updates must be atomic
- Use database transactions
- Implement optimistic locking

### Stock Operations

#### Deduct Stock
```typescript
async function deductStock(productId: string, quantity: number) {
  return await db.transaction(async (trx) => {
    const product = await trx.query(
      'SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE',
      [productId]
    )
    
    if (product.stock < quantity) {
      throw new Error('Insufficient stock')
    }
    
    await trx.query(
      'UPDATE inventory SET stock = stock - $1 WHERE product_id = $2',
      [quantity, productId]
    )
  })
}
```

### Stock Alerts

- Low stock threshold per product
- Alert channels: email, SMS, dashboard
- Real-time inventory updates

### Concurrency

- Handle race conditions with row-level locking
- Implement retry logic for conflicts
- Queue high-traffic operations
