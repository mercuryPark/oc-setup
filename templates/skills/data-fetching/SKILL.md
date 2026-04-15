---
name: data-fetching
description: 데이터 페칭 패턴. React Query/SWR, Pagination, Optimistic Updates.
---

# Data Fetching Patterns

## Recommended: React Query

### Basic Setup
```typescript
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })
}
```

### Mutations with Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['users'] })
    const previousUsers = queryClient.getQueryData(['users'])
    queryClient.setQueryData(['users'], (old) => [...old, newUser])
    return { previousUsers }
  },
  onError: (err, newUser, context) => {
    queryClient.setQueryData(['users'], context.previousUsers)
  }
})
```

## Pagination

### Cursor-based
```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['users'],
  queryFn: ({ pageParam }) => fetchUsers(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor
})
```

### Offset-based
Use for predictable page sizes and SEO-friendly URLs.
