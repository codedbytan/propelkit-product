-- ================================
-- ACME SAAS - DATABASE SCHEMA
-- ================================
-- Run this in your Supabase SQL Editor
-- This creates all tables needed for your SaaS

-- ================================
-- 1. PROFILES TABLE
-- ================================
-- Stores additional user data beyond what Supabase Auth provides
-- Linked to auth.users via the ID

create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Users can only view their own profile
create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );

-- ================================
-- 2. SUBSCRIPTIONS TABLE
-- ================================
-- Tracks payment orders (one-time purchases or recurring)
-- For one-time payments: status stays 'active' indefinitely
-- For subscriptions: status changes based on renewal

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan_id text not null,                    -- e.g., 'starter_lifetime', 'pro_plan'
  status text not null,                     -- 'active', 'cancelled', 'expired'
  razorpay_order_id text,                   -- Order ID from Razorpay
  razorpay_payment_id text,                 -- Payment ID (after successful payment)
  amount integer,                           -- Amount in paise (e.g., 299900 = ₹2999)
  currency text default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions" 
on public.subscriptions for select 
using ( auth.uid() = user_id );

-- ================================
-- 3. LICENSES TABLE
-- ================================
-- Stores license keys issued to customers
-- Used if you're selling software licenses, API keys, etc.

create table public.licenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan_key text not null,                   -- e.g., 'starter_lifetime', 'agency_lifetime'
  license_key text not null unique,         -- e.g., 'ACME-PRO-2024-ABC123'
  status text default 'active',             -- 'active', 'expired', 'revoked'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.licenses enable row level security;

create policy "Users can view own license" 
on public.licenses for select 
using ( auth.uid() = user_id );

-- ================================
-- 4. INVOICES TABLE
-- ================================
-- Stores payment receipts for users to download
-- ID is the Razorpay payment ID for easy reference

create table public.invoices (
  id text primary key,                      -- Use Razorpay Payment ID
  user_id uuid references auth.users not null,
  amount integer not null,                  -- Amount in paise
  currency text default 'INR',
  status text default 'paid',               -- 'paid', 'refunded', 'failed'
  pdf_url text,                             -- Optional: Link to stored PDF
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invoices enable row level security;

create policy "Users can view own invoices" 
on public.invoices for select 
using ( auth.uid() = user_id );

-- ================================
-- 5. WEBHOOK EVENTS TABLE
-- ================================
-- Prevents duplicate processing of Razorpay webhooks
-- Critical for idempotency

create table public.webhook_events (
  id uuid default gen_random_uuid() primary key,
  event_id text unique not null,            -- Razorpay's event ID
  event_type text not null,                 -- e.g., 'payment.captured'
  payload jsonb not null,                   -- Full webhook data
  status text default 'pending',            -- 'pending', 'processed', 'failed'
  created_at timestamp with time zone default now(),
  processed_at timestamp with time zone
);

alter table public.webhook_events enable row level security;

-- No public policies needed - only accessed via Service Role Key

-- ================================
-- 6. AUDIT LOGS TABLE
-- ================================
-- Tracks important actions for debugging and compliance
-- Examples: subscription_activated, license_revoked, refund_issued

create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  action text not null,                     -- e.g., 'subscription_activated'
  details jsonb,                            -- Additional context
  created_at timestamp with time zone default now()
);

alter table public.audit_logs enable row level security;

-- No public policies needed - admin only

-- ================================
-- 7. ENABLE REALTIME (Optional)
-- ================================
-- Allows frontend to listen for database changes in real-time
-- Useful for admin dashboards showing live user activity

alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table subscriptions;

-- Only allow service role to insert
create policy "Service role can insert audit logs"
on public.audit_logs for insert
with check (auth.jwt()->>'role' = 'service_role');

-- Admin users can view all logs
create policy "Admins can view audit logs"
on public.audit_logs for select
using (
    auth.uid() in (
        select id from auth.users where raw_user_meta_data->>'role' = 'admin'
    )
);
-- ================================
-- SETUP COMPLETE ✅
-- ================================
-- Next steps:
-- 1. Update your .env.local with Supabase credentials
-- 2. Configure Razorpay webhook to point to /api/webhooks/razorpay
-- 3. Test the payment flow with Razorpay test mode



-- ================================================
-- ORGANIZATIONS & MULTI-TENANCY
-- ================================================

-- 1. Organizations Table
CREATE TABLE public.organizations (
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
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_organizations_slug ON public.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_created_by ON public.organizations(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_subscription_status ON public.organizations(subscription_status) WHERE deleted_at IS NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Organization Members
CREATE TABLE public.organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  
  -- Invitation tracking
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  UNIQUE(organization_id, user_id) -- User can only be in org once
);

-- Indexes
CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_role ON public.organization_members(organization_id, role);

-- 3. Organization Invites
CREATE TABLE public.organization_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')), -- Can't invite as owner
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days') NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate invites
  UNIQUE(organization_id, email, accepted_at) -- Can re-invite after acceptance
);

CREATE INDEX idx_org_invites_token ON public.organization_invites(token) WHERE accepted_at IS NULL;
CREATE INDEX idx_org_invites_org_email ON public.organization_invites(organization_id, email) WHERE accepted_at IS NULL;

-- 4. Modify Existing Tables for Multi-Tenancy
ALTER TABLE public.licenses 
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS licenses_user_id_plan_key_key; -- Remove old constraint

-- New constraint: org can have multiple licenses
ALTER TABLE public.licenses 
  ADD CONSTRAINT licenses_org_plan_unique UNIQUE(organization_id, plan_key);

-- Migrate existing licenses to orgs (one-time)
-- We'll create personal orgs for existing users

ALTER TABLE public.invoices 
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- ================================================
-- ROW LEVEL SECURITY (RLS) - CRITICAL
-- ================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see orgs they're members of
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organizations"
  ON public.organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Members: Users see members of their orgs
CREATE POLICY "Users can view org members"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON public.organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Invites: Only admins see invites
CREATE POLICY "Admins can manage invites"
  ON public.organization_invites FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update licenses RLS
DROP POLICY IF EXISTS "Users can view own license" ON public.licenses;
CREATE POLICY "Users can view org licenses"
  ON public.licenses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Update invoices RLS
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view org invoices"
  ON public.invoices FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to check if user is org admin
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND organization_members.user_id = is_org_admin.user_id
      AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current org (from session or default)
CREATE OR REPLACE FUNCTION get_user_current_org(user_id UUID)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get first org user is member of
  SELECT organization_id INTO org_id
  FROM public.organization_members
  WHERE organization_members.user_id = get_user_current_org.user_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




-- ================================================
-- STEP 1: Add organization_id to existing tables
-- ================================================

-- Add to subscriptions table
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add to invoices table  
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- ================================================
-- STEP 2: Migrate existing data (create personal orgs)
-- ================================================

-- Create personal organizations for existing users
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM public.licenses WHERE user_id IS NOT NULL
  LOOP
    -- Get user email
    DECLARE
      user_email TEXT;
    BEGIN
      SELECT email INTO user_email FROM auth.users WHERE id = user_record.user_id;
      
      -- Create personal org
      INSERT INTO public.organizations (name, slug, created_by, subscription_status)
      VALUES (
        user_email || '''s Organization',
        LOWER(REPLACE(SPLIT_PART(user_email, '@', 1), '.', '-')) || '-' || SUBSTRING(gen_random_uuid()::text, 1, 6),
        user_record.user_id,
        'active'
      )
      RETURNING id INTO new_org_id;
      
      -- Add user as owner
      INSERT INTO public.organization_members (organization_id, user_id, role)
      VALUES (new_org_id, user_record.user_id, 'owner');
      
      -- Link licenses to org
      UPDATE public.licenses 
      SET organization_id = new_org_id 
      WHERE user_id = user_record.user_id;
      
      -- Link invoices to org
      UPDATE public.invoices 
      SET organization_id = new_org_id 
      WHERE user_id = user_record.user_id;
      
    END;
  END LOOP;
END $$;

-- ================================================
-- STEP 3: Now run the recurring subscription changes
-- ================================================

-- Modify subscriptions table
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'lifetime',
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Drop old constraint if exists
ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Add new status constraint
ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing'));

-- Add type constraint
ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_type_check 
    CHECK (type IN ('lifetime', 'recurring'));

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
  ON public.subscriptions(organization_id, status) 
  WHERE status = 'active';

-- Index for expiring subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring 
  ON public.subscriptions(current_period_end) 
  WHERE status = 'active' AND type = 'recurring';



  -- The DB checks user_id = auth.uid() FIRST. Since your personal license is linked to your user ID, it will now be visible.
-- This ensures that existing users with personal licenses can still access them without issues.
-- 1. Remove the strict "Organization Only" policy
DROP POLICY IF EXISTS "Users can view org licenses" ON public.licenses;
DROP POLICY IF EXISTS "Users can view own license" ON public.licenses;

-- 2. Create a "Hybrid" policy (Personal + Org)
CREATE POLICY "View own or org licenses" 
ON public.licenses FOR SELECT 
USING ( 
  -- Scenario A: It's a personal license (linked to your User ID)
  user_id = auth.uid() 
  
  OR 
  
  -- Scenario B: It's an org license (linked to a team you are in)
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);