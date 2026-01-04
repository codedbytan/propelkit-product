-- ================================
-- ACME SAAS - DATABASE SCHEMA
-- ================================
-- Run this in your Supabase SQL Editor
-- This creates all tables needed for your SaaS

-- ================================================
-- ACME SAAS - COMPLETE DATABASE SCHEMA
-- ================================================

-- ================================
-- 1. PROFILES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- ================================
-- 2. ORGANIZATIONS TABLE (NEW)
-- ================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND char_length(slug) <= 50),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  
  -- Billing
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
  subscription_plan TEXT CHECK (subscription_plan IN ('starter', 'pro', 'agency')),
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by) WHERE deleted_at IS NULL;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- ================================
-- 3. ORGANIZATION MEMBERS (NEW)
-- ================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org members"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ================================
-- 4. ORGANIZATION INVITES (NEW)
-- ================================
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days') NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(organization_id, email, accepted_at)
);

CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invites(token) WHERE accepted_at IS NULL;

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- ================================
-- 5. SUBSCRIPTIONS TABLE (MODIFIED)
-- ================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- Keep for backward compatibility
  organization_id uuid references public.organizations(id) on delete cascade, -- NEW
  plan_id text not null,
  status text not null CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
  razorpay_order_id text,
  razorpay_payment_id text,
  amount integer,
  currency text default 'INR',
  
  -- Recurring subscription fields (NEW)
  type text default 'lifetime' CHECK (type IN ('lifetime', 'recurring')),
  razorpay_subscription_id text unique,
  razorpay_plan_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  cancelled_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(organization_id, status) WHERE status = 'active';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING ( 
  auth.uid() = user_id OR
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid()
  )
);

-- ================================
-- 6. LICENSES TABLE (MODIFIED)
-- ================================
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Keep for backward compatibility
  organization_id uuid references public.organizations(id) on delete cascade, -- NEW
  plan_key text not null,
  license_key text not null unique,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX IF NOT EXISTS idx_licenses_user ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_org ON public.licenses(organization_id);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own license" ON public.licenses;

CREATE POLICY "Users can view org licenses"
  ON public.licenses FOR SELECT
  USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ================================
-- 7. INVOICES TABLE (MODIFIED)
-- ================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  organization_id uuid references public.organizations(id) on delete set null, -- NEW
  amount integer not null,
  currency text default 'INR',
  status text default 'paid',
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(organization_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;

CREATE POLICY "Users can view org invoices"
  ON public.invoices FOR SELECT
  USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ================================
-- 8. WEBHOOK EVENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid default gen_random_uuid() primary key,
  event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  processed_at timestamp with time zone
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ================================
-- 9. AUDIT LOGS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true); -- Service role bypasses RLS anyway

-- ================================
-- 10. COUPONS TABLE (NEW)
-- ================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value INTEGER NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  applies_to JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  order_id TEXT,
  discount_amount INTEGER,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 11. AUTO-CREATE PERSONAL ORG ON SIGNUP
-- ================================

-- Function to create personal org
CREATE OR REPLACE FUNCTION create_personal_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  user_slug TEXT;
BEGIN
  -- Generate slug from email
  user_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 6);
  
  -- Create organization
  INSERT INTO public.organizations (name, slug, created_by, subscription_status)
  VALUES (
    NEW.email || '''s Organization',
    user_slug,
    NEW.id,
    'trial'
  )
  RETURNING id INTO org_id;
  
  -- Add user as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_personal_organization();

-- ================================
-- 12. HELPER FUNCTIONS
-- ================================

CREATE OR REPLACE FUNCTION get_user_default_org(user_id UUID)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.organization_members
  WHERE organization_members.user_id = get_user_default_org.user_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;