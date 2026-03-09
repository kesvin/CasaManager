postgresql://postgres:As125677xd%40@db.vskptuiocefcnhltwkof.supabase.co:5432/postgres
postgresql://postgres:As125677xd@@db.vskptuiocefcnhltwkof.supabase.co:5432/postgres

# Ejecutar en PowerShell dentro de nextjs-app
$supabaseUrl = Read-Host "https://vskptuiocefcnhltwkof.supabase.co"
$serviceKey  = Read-Host "<SERVICE_ROLE_KEY>"
$anonKey     = Read-Host "<ANON_KEY>"
$dbUrl       = Read-Host "<DATABASE_URL>"
$session     = Read-Host "5075"

$envText = @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
DATABASE_URL=$dbUrl
SESSION_SECRET=$session
"@

$envText | Out-File -Encoding utf8 .env.local
Write-Host ".env.local creado. No lo compartas y añádelo a .gitignore."


$env:NEXT_PUBLIC_SUPABASE_URL='https://vskptuiocefcnhltwkof.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZza3B0dWlvY2VmY25obHR3a29mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzNzg3NCwiZXhwIjoyMDg4MjEzODc0fQ.V4N5LQnd9Hij8EHvAREhkf1r30zcEDdiLtsUHyCXeS8'
node scripts/seed_two_users.js

////////////////////////////////////////////////////////////////////////////

-- Combined migration for Supabase
-- Paste this entire file into the Supabase SQL editor and run as a single migration.
-- Generated: 2026-03-06

-- ==================================================================
-- 001_init_tables.sql
-- ==================================================================

-- Init schema for CasaManager
-- Run in Supabase SQL editor or psql against DATABASE_URL

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Users table (Supabase Auth will also manage auth users; this is app-level users table)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  role text default 'member',
  metadata jsonb,
  created_at timestamptz default now()
);

-- Accounts / Cuentas
create table if not exists cuentas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  balance numeric(14,2) default 0,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Gastos (expenses)
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  account_id uuid references cuentas(id) on delete set null,
  amount numeric(14,2) not null,
  description text,
  category text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists gastos_created_idx on gastos(created_at desc);

-- Enable Row Level Security on gastos and add owner-only policies
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY gastos_select_auth_owner
  ON gastos
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY gastos_insert_auth_owner
  ON gastos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY gastos_update_auth_owner
  ON gastos
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY gastos_delete_auth_owner
  ON gastos
  FOR DELETE
  USING (user_id = auth.uid());


-- ==================================================================
-- 002_app_tables.sql
-- ==================================================================

-- App tables for CasaManager

-- Owners
create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  monthly_income numeric(14,2) default 0,
  created_at timestamptz default now()
);

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Budgets (monthly budget per owner)
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete cascade,
  amount numeric(14,2) default 0,
  created_at timestamptz default now()
);

-- Fixed expenses
create table if not exists fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text,
  amount numeric(14,2) default 0,
  day int default 1,
  account_id uuid references cuentas(id) on delete set null,
  owner_id uuid references owners(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Improvements
create table if not exists improvements (
  id uuid primary key default gen_random_uuid(),
  title text,
  estimated_cost numeric(14,2) default 0,
  created_at timestamptz default now()
);

-- House documents stored metadata (files are in Supabase Storage)
create table if not exists house_documents (
  id uuid primary key default gen_random_uuid(),
  title text,
  kind text,
  estimated_cost numeric(14,2) default 0,
  contact_name text,
  contact_phone text,
  company text,
  notes text,
  file_name text,
  file_type text,
  file_size bigint default 0,
  file_url text,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Contacts
create table if not exists house_contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  company text,
  phone text,
  description text,
  created_at timestamptz default now()
);

-- End of combined migration