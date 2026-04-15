---
name: payment-gateway
description: 결제 게이트웨이 연동 및 추상화. 멱등성 보장, 웹훅 처리, 환불/취소 프로세스.
---

# Payment Gateway Integration

## Architecture

### Abstraction Layer
```typescript
interface PaymentProvider {
  createPayment(amount: number, currency: string): Promise<PaymentIntent>
  confirmPayment(paymentId: string): Promise<PaymentResult>
  refund(paymentId: string, amount?: number): Promise<RefundResult>
}
```

## Webhook Handling

### Idempotency
```javascript
// Store processed webhook IDs
await redis.set(`webhook:${eventId}`, 'processed', 'EX', 86400)

// Check before processing
if (await redis.get(`webhook:${eventId}`)) {
  return { status: 'already_processed' }
}
```

### Security
- Verify webhook signatures
- Use HTTPS only
- Implement retry logic with exponential backoff

## Testing

- Always use test/sandbox mode first
- Test edge cases:
  - Insufficient funds
  - Expired cards
  - Network timeouts
  - Webhook delays

## Error Handling

- User-friendly error messages
- Automatic retry for transient failures
- Detailed logging for debugging
- Fallback payment methods
