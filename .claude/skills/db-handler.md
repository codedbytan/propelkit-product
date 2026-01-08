# Database Handler Skill (Supabase/PostgreSQL)

## Trigger
When user says: "Create table for [entity]" or "Add database schema" or "Set up database for [feature]"

## What This Skill Does
Generates production-ready database schemas for Supabase including:
1. Table creation with proper types
2. Row Level Security (RLS) policies
3. Indexes for performance
4. Triggers for updated_at
5. TypeScript types

---

## Standard Table Template

```sql
-- ============================================
-- TABLE: [table_name]
-- Description: [what this table stores]
-- ============================================

CREATE TABLE IF NOT EXISTS [table_name] (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to user (required for RLS)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Your fields here
  [field_name] [TYPE] [CONSTRAINTS],
  
  -- Timestamps (always include these)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Users can view their own records
CREATE POLICY "[table_name]_select_own" 
  ON [table_name] 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own records
CREATE POLICY "[table_name]_insert_own" 
  ON [table_name] 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "[table_name]_update_own" 
  ON [table_name] 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "[table_name]_delete_own" 
  ON [table_name] 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_[table_name]_user_id 
  ON [table_name](user_id);

CREATE INDEX IF NOT EXISTS idx_[table_name]_created_at 
  ON [table_name](created_at DESC);

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Type Mapping Reference

| Use Case | PostgreSQL Type | TypeScript Type | Notes |
|----------|-----------------|-----------------|-------|
| Unique ID | `UUID` | `string` | Use `gen_random_uuid()` |
| Short text | `VARCHAR(255)` | `string` | For names, titles |
| Long text | `TEXT` | `string` | For descriptions, content |
| Integer | `INTEGER` | `number` | Whole numbers |
| Decimal | `DECIMAL(10,2)` | `number` | Money, precise decimals |
| Price (paise) | `INTEGER` | `number` | Store in smallest unit |
| Boolean | `BOOLEAN` | `boolean` | true/false |
| Date only | `DATE` | `string` | YYYY-MM-DD |
| Date + time | `TIMESTAMPTZ` | `string` | With timezone |
| JSON | `JSONB` | `Record<string, any>` | Flexible data |
| Array | `TEXT[]` | `string[]` | Array of values |
| Enum | `TEXT` | string literal | Use CHECK constraint |
| Email | `TEXT` | `string` | Add UNIQUE if needed |
| URL | `TEXT` | `string` | Web URLs |
| Phone | `VARCHAR(15)` | `string` | Indian: 10 digits |

---

## Common Patterns

### User Profile Extension

```sql
-- Extends auth.users with additional fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone VARCHAR(15),
  company_name TEXT,
  gstin VARCHAR(15), -- Indian GST number
  billing_address JSONB,
  preferences JSONB DEFAULT '{}',
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### License Management

```sql
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_key VARCHAR(20) NOT NULL UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'agency')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = lifetime
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "licenses_select_own" ON licenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);
```

### Invoice Storage

```sql
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_id UUID REFERENCES licenses(id),
  
  -- Invoice details
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Seller info (your company)
  seller_name TEXT NOT NULL,
  seller_gstin VARCHAR(15),
  seller_address TEXT,
  
  -- Buyer info
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_gstin VARCHAR(15),
  buyer_address TEXT,
  buyer_state_code VARCHAR(2),
  
  -- Line items
  items JSONB NOT NULL,
  
  -- Tax calculation
  subtotal INTEGER NOT NULL, -- in paise
  cgst INTEGER DEFAULT 0,
  sgst INTEGER DEFAULT 0,
  igst INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  
  -- Payment reference
  razorpay_payment_id TEXT,
  
  -- PDF storage
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

### Webhook Events (Idempotency)

```sql
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE, -- External event ID
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed - server-only table
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
```

### Audit Logs

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS - admin only via service role
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Multi-Tenancy (Organizations)

```sql
-- Organizations/Teams
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Org policies (members can view their orgs)
CREATE POLICY "org_members_can_view" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_can_view_members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
```

---

## TypeScript Types Generation

For each table, generate corresponding TypeScript types:

```typescript
// src/types/database.ts

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company_name: string | null;
  gstin: string | null;
  billing_address: Record<string, any> | null;
  preferences: Record<string, any>;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface License {
  id: string;
  user_id: string;
  license_key: string;
  plan_type: 'starter' | 'agency';
  status: 'active' | 'expired' | 'revoked' | 'refunded';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  activated_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Add more as needed...
```

---

## Running Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Paste the SQL schema
3. Click "Run"

Or use Supabase CLI:
```bash
supabase migration new create_[table_name]
# Edit the migration file
supabase db push
```

---

## Example Usage

**User**: "Create table for blog posts with title, content, published status, and slug"

**Claude generates**:
```sql
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

-- Plus all RLS policies, indexes, and triggers...
```
