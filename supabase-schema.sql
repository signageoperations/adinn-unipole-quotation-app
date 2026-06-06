-- ADINN Unipole Quotation Generator permanent storage
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.quotations (
  id uuid primary key,
  quotation_no text not null,
  quotation_title text,
  quotation_date date,
  valid_until date,
  client_name text,
  contact_person text,
  phone text,
  email text,
  project_name text,
  location text,
  prepared_by text,
  item_count integer default 0,
  subtotal numeric(14, 2) default 0,
  discount numeric(14, 2) default 0,
  tax numeric(14, 2) default 0,
  grand_total numeric(14, 2) default 0,
  quote jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists quotations_quotation_no_idx
  on public.quotations (quotation_no);

create index if not exists quotations_updated_at_idx
  on public.quotations (updated_at desc);

create index if not exists quotations_client_name_idx
  on public.quotations (client_name);

alter table public.quotations enable row level security;

-- Simple no-login policy for the current office app.
-- Anyone with the VITE_SUPABASE_ANON_KEY can read/create/update/delete quotations.
-- Add Supabase Auth before using this for sensitive public-facing usage.
drop policy if exists "Allow anon read quotations" on public.quotations;
drop policy if exists "Allow anon insert quotations" on public.quotations;
drop policy if exists "Allow anon update quotations" on public.quotations;
drop policy if exists "Allow anon delete quotations" on public.quotations;

create policy "Allow anon read quotations"
  on public.quotations
  for select
  to anon
  using (true);

create policy "Allow anon insert quotations"
  on public.quotations
  for insert
  to anon
  with check (true);

create policy "Allow anon update quotations"
  on public.quotations
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow anon delete quotations"
  on public.quotations
  for delete
  to anon
  using (true);
