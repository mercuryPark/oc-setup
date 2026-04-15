---
name: chart-library
description: 차트 라이브러리 통합. Chart.js, Recharts, D3.js. 반응형 디자인, 성능 최적화.
---

# Chart Library Integration

## Library Selection

### React: Recharts
```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts'

<LineChart width={600} height={300} data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Line type="monotone" dataKey="value" />
</LineChart>
```

### Vanilla JS: Chart.js
```typescript
import { Chart } from 'chart.js/auto'

new Chart(ctx, {
  type: 'line',
  data: { labels, datasets }
})
```

### Advanced: D3.js
- Use for custom visualizations
- More complex but maximum flexibility

## Best Practices

### Performance
- Debounce resize handlers
- Use virtualization for large datasets
- Implement data aggregation

### Responsive Design
```typescript
const [containerRef, { width }] = useMeasure()

<LineChart width={width} height={width * 0.6}>
```

### Accessibility
- Add aria-labels
- Provide data tables as alternatives
- Support keyboard navigation
