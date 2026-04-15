---
name: seo-optimization
description: SEO 최적화 가이드. 메타 태그, structured data, Core Web Vitals.
---

# SEO Optimization Guide

## Meta Tags

### Essential Tags
```html
<title>Page Title - Brand Name</title>
<meta name="description" content="Compelling description under 160 chars">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://example.com/page">
```

### Open Graph
```html
<meta property="og:title" content="Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:type" content="website">
```

## Structured Data

### JSON-LD
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title",
  "author": {"@type": "Person", "name": "Author"},
  "datePublished": "2024-01-15"
}
</script>
```

## Technical SEO

- Implement server-side rendering (SSR)
- Optimize Core Web Vitals (LCP, FID, CLS)
- Create XML sitemap
- Configure robots.txt
- Implement hreflang for i18n
