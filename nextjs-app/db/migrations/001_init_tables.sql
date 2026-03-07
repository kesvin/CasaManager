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
  USING (auth.role() = 'authenticated')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY gastos_update_auth_owner
  ON gastos
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY gastos_delete_auth_owner
  ON gastos
  FOR DELETE
  USING (user_id = auth.uid());
