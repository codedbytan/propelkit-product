# CRUD Page Generator Skill

## Trigger
When user says: "Create a CRUD page for [Entity]" or "Generate CRUD for [Entity] with [fields]"

## What This Skill Does
Generates a complete, production-ready CRUD interface including:
1. Database schema (SQL for Supabase)
2. TypeScript types
3. Zod validation schema
4. API routes (GET, POST, PUT, DELETE)
5. Server Component page with data table
6. Client Component form for create/edit
7. Delete confirmation dialog

## Input Requirements
- **Entity name** (singular, e.g., "Product", "BlogPost")
- **Fields** (name: type pairs)

## Output Structure

### 1. Database Schema
**File: `schema-[entity].sql`**

```sql
-- [Entity] Table
CREATE TABLE IF NOT EXISTS [entity_plural] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  [field_name] [SQL_TYPE] [CONSTRAINTS],
  -- ... more fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE [entity_plural] ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "[entity_plural]_select_own" ON [entity_plural]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "[entity_plural]_insert_own" ON [entity_plural]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[entity_plural]_update_own" ON [entity_plural]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "[entity_plural]_delete_own" ON [entity_plural]
  FOR DELETE USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_[entity_plural]_updated_at
  BEFORE UPDATE ON [entity_plural]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. TypeScript Types
**File: `src/types/[entity].ts`**

```typescript
export interface [Entity] {
  id: string;
  user_id: string;
  [field_name]: [TypeScript_Type];
  // ... more fields
  created_at: string;
  updated_at: string;
}

export type Create[Entity]Input = Omit<[Entity], 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type Update[Entity]Input = Partial<Create[Entity]Input>;
```

### 3. Zod Validation Schema
**File: `src/lib/validations/[entity].ts`**

```typescript
import { z } from 'zod';

export const create[Entity]Schema = z.object({
  [field_name]: z.[zod_type]([validation_message]),
  // ... more fields
});

export const update[Entity]Schema = create[Entity]Schema.partial();

export type Create[Entity]Input = z.infer<typeof create[Entity]Schema>;
export type Update[Entity]Input = z.infer<typeof update[Entity]Schema>;
```

### 4. API Routes
**File: `src/app/api/[entity-plural]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { create[Entity]Schema } from '@/lib/validations/[entity]';

// GET all [entities]
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('[entity_plural]')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    data, 
    pagination: { page, limit, total: count || 0 }
  });
}

// POST create new [entity]
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = create[Entity]Schema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('[entity_plural]')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
```

**File: `src/app/api/[entity-plural]/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { update[Entity]Schema } from '@/lib/validations/[entity]';

// GET single [entity]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('[entity_plural]')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// PUT update [entity]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = update[Entity]Schema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('[entity_plural]')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE [entity]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('[entity_plural]')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

### 5. Page Component
**File: `src/app/dashboard/[entity-plural]/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { [Entity]Table } from '@/components/[entity-plural]/[entity]-table';
import { Create[Entity]Button } from '@/components/[entity-plural]/create-[entity]-button';

export const metadata = {
  title: '[Entity_Plural] | Dashboard',
};

export default async function [Entity]Page() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: [entity_plural] } = await supabase
    .from('[entity_plural]')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">[Entity_Plural]</h1>
          <p className="text-muted-foreground">Manage your [entity_plural]</p>
        </div>
        <Create[Entity]Button />
      </div>
      
      <[Entity]Table data={[entity_plural] || []} />
    </div>
  );
}
```

### 6. Table Component
**File: `src/components/[entity-plural]/[entity]-table.tsx`**

```typescript
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { [Entity] } from '@/types/[entity]';
import { Edit[Entity]Dialog } from './edit-[entity]-dialog';
import { Delete[Entity]Dialog } from './delete-[entity]-dialog';
import { formatDate } from '@/lib/utils';

interface [Entity]TableProps {
  data: [Entity][];
}

export function [Entity]Table({ data }: [Entity]TableProps) {
  const [editItem, setEditItem] = useState<[Entity] | null>(null);
  const [deleteItem, setDeleteItem] = useState<[Entity] | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              [TABLE_HEADERS]
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={[COLUMN_COUNT]} className="text-center py-8 text-muted-foreground">
                  No [entity_plural] found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  [TABLE_CELLS]
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Edit[Entity]Dialog item={editItem} onClose={() => setEditItem(null)} />
      <Delete[Entity]Dialog item={deleteItem} onClose={() => setDeleteItem(null)} />
    </>
  );
}
```

### 7. Form Component
**File: `src/components/[entity-plural]/[entity]-form.tsx`**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create[Entity]Schema, Create[Entity]Input } from '@/lib/validations/[entity]';

interface [Entity]FormProps {
  defaultValues?: Partial<Create[Entity]Input>;
  onSubmit: (data: Create[Entity]Input) => Promise<void>;
  isLoading?: boolean;
}

export function [Entity]Form({ defaultValues, onSubmit, isLoading }: [Entity]FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Create[Entity]Input>({
    resolver: zodResolver(create[Entity]Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      [FORM_FIELDS]
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

## Type Mappings

| User Input | SQL Type | TypeScript Type | Zod Type |
|------------|----------|-----------------|----------|
| string | TEXT | string | z.string() |
| text | TEXT | string | z.string() |
| number | INTEGER | number | z.number() |
| float | DECIMAL | number | z.number() |
| boolean | BOOLEAN | boolean | z.boolean() |
| date | DATE | string | z.string().date() |
| datetime | TIMESTAMPTZ | string | z.string().datetime() |
| email | TEXT | string | z.string().email() |
| url | TEXT | string | z.string().url() |
| price | INTEGER | number | z.number().positive() |
| phone | TEXT | string | z.string().regex(/^[6-9]\d{9}$/) |

## Example Usage

**User**: "Create a CRUD page for Product with name, description, price, and imageUrl"

**Claude generates**:
- `schema-products.sql` - Database table with RLS
- `src/types/product.ts` - TypeScript interfaces
- `src/lib/validations/product.ts` - Zod schemas
- `src/app/api/products/route.ts` - List/Create endpoints
- `src/app/api/products/[id]/route.ts` - Read/Update/Delete endpoints
- `src/app/dashboard/products/page.tsx` - Products list page
- `src/components/products/product-table.tsx` - Data table
- `src/components/products/product-form.tsx` - Create/Edit form
- `src/components/products/create-product-button.tsx` - Create dialog
- `src/components/products/edit-product-dialog.tsx` - Edit dialog
- `src/components/products/delete-product-dialog.tsx` - Delete confirmation
