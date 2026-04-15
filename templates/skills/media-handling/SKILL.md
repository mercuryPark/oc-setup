---
name: media-handling
description: 미디어 파일 처리 및 최적화. 이미지 리사이징, WebP 변환, CDN 활용.
---

# Media Handling Guide

## Image Optimization

### Processing Pipeline
1. Upload original
2. Generate variants (thumbnail, medium, large)
3. Convert to WebP
4. Upload to CDN
5. Store metadata

### Sharp.js Example
```typescript
import sharp from 'sharp'

async function processImage(file: Buffer) {
  const webp = await sharp(file)
    .resize(1200, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
  
  return webp
}
```

## CDN Integration

- Use signed URLs for private content
- Implement cache invalidation
- Monitor bandwidth usage

## Lazy Loading

```html
<img 
  src="placeholder.jpg" 
  data-src="actual-image.webp"
  loading="lazy"
  alt="Description"
/>
```

## Best Practices

- Always provide alt text
- Use responsive images (srcset)
- Implement blur-up loading
- Handle upload errors gracefully
