---
name: api-documentation
description: API 문서화. OpenAPI/Swagger, 예시 포함, 에러 케이스 문서화.
---

# API Documentation

## OpenAPI 3.0

### Basic Structure
```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

## Documentation Tools

### Swagger UI
- Interactive documentation
- Built-in request builder
- Auto-generated from OpenAPI spec

### Redoc
- Clean, responsive design
- Three-panel layout
- Code samples in multiple languages

## Best Practices

### Include Examples
```yaml
examples:
  user:
    value:
      id: 123
      name: John Doe
      email: john@example.com
```

### Document Errors
```yaml
responses:
  400:
    description: Bad Request
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

### Versioning
- Include version in URL: `/v1/users`
- Document breaking changes
- Maintain backward compatibility
