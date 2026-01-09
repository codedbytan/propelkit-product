# CRUD Page Generator Skill

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ Check `src/config/brand.ts` for branding
3. ✅ Use dynamic brand references

---

## Trigger
"Create CRUD page for [Entity]" or "Generate CRUD for [Entity] with [fields]"

## What This Does
Generates complete CRUD interface:
1. Database schema (SQL)
2. TypeScript types
3. Zod validation
4. API routes (GET, POST, PUT, DELETE)
5. Table component
6. Form component
7. Delete confirmation

---

## Output Files

1. `schema-[entity].sql` - Database table with RLS
2. `src/types/[entity].ts` - TypeScript interfaces
3. `src/lib/validations/[entity].ts` - Zod schemas
4. `src/app/api/[entity]/route.ts` - List/Create
5. `src/app/api/[entity]/[id]/route.ts` - Get/Update/Delete
6. `src/app/dashboard/[entity]/page.tsx` - List page
7. `src/components/[entity]/[entity]-table.tsx` - Data table
8. `src/components/[entity]/[entity]-form.tsx` - Form

---

## Type Mappings

| Input | SQL | TypeScript | Zod |
|-------|-----|------------|-----|
| string | TEXT | string | z.string() |
| number | INTEGER | number | z.number() |
| boolean | BOOLEAN | boolean | z.boolean() |
| date | DATE | string | z.string().date() |
| email | TEXT | string | z.string().email() |
| price | INTEGER | number | z.number().positive() |

---

## Database Template

```sql
CREATE TABLE IF NOT EXISTS [entity_plural] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  [field_name] [SQL_TYPE],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE [entity_plural] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own" ON [entity_plural]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own" ON [entity_plural]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own" ON [entity_plural]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own" ON [entity_plural]
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Usage Example

**User:** "Create CRUD page for Product with name, description, price"

**Claude generates:** Complete CRUD with all 8 files, using `brand.*` config in success messages.
