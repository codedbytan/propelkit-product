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