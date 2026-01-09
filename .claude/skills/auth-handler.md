# Auth Handler Skill

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ Check `src/config/brand.ts` for URLs
3. ✅ Use Supabase Auth patterns

---

## Trigger
"Add authentication to [page/route]" or "Protect [resource] with auth"

## What This Does
- Adds auth checks to pages/routes
- Generates login/signup components
- Handles protected routes
- Session management

---

## Server Component Auth

```typescript
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  return <div>Protected content</div>;
}
```

---

## API Route Auth

```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## Client Component Auth

```typescript
'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return { user };
}
```

---

## Usage Example

**User:** "Protect the dashboard routes"

**Claude generates:** Middleware or layout auth check using Supabase patterns.
