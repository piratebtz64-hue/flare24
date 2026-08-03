-- Table flares uniquement (si schema complet déjà partiel)
-- Coller dans SQL Editor → Run

create extension if not exists "pgcrypto";

create table if not exists public.flares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  city text not null,
  intent text not null,
  tag text default 'Privé',
  expires_at timestamptz not null,
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists flares_active_expires_idx
  on public.flares (active, expires_at desc);

alter table public.flares enable row level security;

drop policy if exists "flares_select_active" on public.flares;
drop policy if exists "flares_insert_own" on public.flares;
drop policy if exists "flares_update_own" on public.flares;
drop policy if exists "flares_delete_own" on public.flares;

create policy "flares_select_active"
  on public.flares for select to authenticated
  using (
    (active = true and expires_at > now())
    or user_id = auth.uid()
  );

create policy "flares_insert_own"
  on public.flares for insert to authenticated
  with check (auth.uid() = user_id);

create policy "flares_update_own"
  on public.flares for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "flares_delete_own"
  on public.flares for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.flares to authenticated;
