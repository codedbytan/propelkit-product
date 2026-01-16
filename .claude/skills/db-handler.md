# Database Handler Skill

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ Always enable RLS
3. ✅ Follow naming conventions

---

## Trigger
"Create table for [entity]" or "Add [columns] to [table]"

## What This Does
Generates SQL schemas with:
- Standard columns (id, user_id, timestamps)
- Row Level Security policies
- Proper foreign keys
- Updated_at triggers

---

## Standard Table Template

```sql
CREATE TABLE IF NOT EXISTS [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Your columns here
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Standard policies
CREATE POLICY "view_own" ON [table_name]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON [table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON [table_name]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON [table_name]
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Column Types

| Use Case | SQL Type |
|----------|----------|
| ID | UUID |
| String | TEXT |
| Number | INTEGER |
| Decimal | DECIMAL(10,2) |
| Boolean | BOOLEAN |
| Date | DATE |
| Timestamp | TIMESTAMPTZ |
| JSON | JSONB |

---

## Usage Example

**User:** "Create table for blog posts with title, content, published"

**Claude generates:** Complete SQL with RLS policies.
