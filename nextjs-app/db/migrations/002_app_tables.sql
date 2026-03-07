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
