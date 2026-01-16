# Add API Route Skill

---
## 🎯 CRITICAL: Read Project Context First

**Before generating ANY code:**
1. ✅ Read `.claude/PROJECT_CONTEXT.md` for master rules
2. ✅ Check `src/config/brand.ts` for project-specific configuration
3. ✅ Use `brand.*` dynamically, NEVER hardcode values

---

## Trigger
When user says: "Add API route for [feature]" or "Create [method] endpoint for [resource]"

## What This Skill Does
Generates production-ready API routes with:
1. Next.js 15 App Router patterns (async params)
2. Supabase authentication
3. Zod input validation
4. Proper error handling
5. TypeScript types
6. HTTP status codes

---

## Template: Basic API Route

**File: `src/app/api/[resource]/route.ts`**

Replace `[resource]` with actual resource name (e.g., `products`, `users`, `blog-posts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { brand } from '@/config/brand';
import { z } from 'zod';

// Validation schema
const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  // Add more fields
});

// GET - List resources
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch data
    const { data, error, count } = await supabase
      .from('table_name')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error },
        { status: 400 }
      );
    }

    // Insert data
    const { data, error } = await supabase
      .from('table_name')
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Template: Dynamic Route with ID

**File: `src/app/api/[resource]/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  // Add more fields
});

// GET - Single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Next.js 15: params is Promise
) {
  try {
    const { id } = await params; // ✅ Must await
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('table_name')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('table_name')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Template: Webhook Handler

**File: `src/app/api/webhooks/[provider]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    
    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    // Check for duplicate events
    const supabase = createServiceClient();
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', payload.id)
      .single();

    if (existingEvent) {
      console.log('Duplicate webhook event, skipping');
      return NextResponse.json({ received: true });
    }

    // Log the event
    await supabase.from('webhook_events').insert({
      event_id: payload.id,
      event_type: payload.event,
      payload: payload,
    });

    // Process the webhook
    switch (payload.event) {
      case 'payment.captured':
        // Handle successful payment
        break;
      case 'payment.failed':
        // Handle failed payment
        break;
      default:
        console.log('Unhandled event type:', payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## Common Patterns

### Pagination
```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '10');
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('table')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

return NextResponse.json({
  data,
  pagination: { 
    page, 
    limit, 
    total: count, 
    pages: Math.ceil((count || 0) / limit) 
  }
});
```

### Search/Filter
```typescript
let query = supabase.from('table').select('*');

const search = searchParams.get('search');
if (search) {
  query = query.ilike('name', `%${search}%`);
}

const status = searchParams.get('status');
if (status) {
  query = query.eq('status', status);
}

const { data } = await query;
```

### File Upload
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to Supabase Storage
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${Date.now()}-${file.name}`, buffer, {
      contentType: file.type,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
```

---

## HTTP Status Codes

Use appropriate status codes:

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Handling Best Practices

```typescript
try {
  // Your logic
} catch (error) {
  console.error('Detailed error for logs:', error);
  
  return NextResponse.json(
    { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
    },
    { status: 500 }
  );
}
```

---

## Security Checklist

Before generating an API route, ensure:

- ✅ Auth check at the beginning
- ✅ Input validation with Zod
- ✅ User can only access their own data
- ✅ Proper error handling
- ✅ No sensitive data in error messages
- ✅ Rate limiting (if needed)
- ✅ CORS headers (if needed)

---

## Usage Examples

**User:** "Add API route for user preferences"

**Claude generates:** `src/app/api/user/preferences/route.ts` with GET and PUT methods to read and update user preferences in the `profiles` table.

**User:** "Create POST endpoint for blog posts"

**Claude generates:** `src/app/api/blog-posts/route.ts` with POST method, Zod validation for title/content/author, and Supabase insert.

**User:** "Add webhook handler for Razorpay"

**Claude generates:** `src/app/api/webhooks/razorpay/route.ts` with signature verification, duplicate check, and event processing.

---

## Important Reminders

1. **Next.js 15**: Always `await params` in dynamic routes
2. **Auth First**: Check authentication before any logic
3. **Validate Input**: Use Zod for all user input
4. **Error Handling**: Catch and log errors properly
5. **Status Codes**: Use appropriate HTTP status codes
6. **Security**: Users can only access their own data

---

**Remember:** Generate API routes that work for ANY project! 🚀
