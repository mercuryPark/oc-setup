---
name: rich-text-editor
description: 리치 텍스트 에디터 통합. TipTap, Slate.js 활용. 협업 편집, 이미지 업로드.
---

# Rich Text Editor Integration

## Editor Selection

### Recommended: TipTap
```typescript
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  extensions: [StarterKit],
  content: '<p>Hello World</p>',
})
```

### Alternative: Slate.js
- More flexible but steeper learning curve
- Better for complex custom behaviors

## Features

### Image Handling
- Drag & drop upload
- Image resizing
- Alt text support
- Lazy loading

### Collaborative Editing
- Use Yjs for real-time collaboration
- Conflict resolution
- Cursor awareness

### Output Format

- Store as JSON (recommended)
- Convert to HTML for display
- Support markdown export
