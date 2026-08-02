-- Flare24 core schema (run in Supabase SQL Editor)
-- Enable extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text default 'Bayonne',
  bio text,
  is_gold boolean default false,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated"
  on public.profiles for select to authenticated
  using (true);

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Flares (ephemeral intent posts)
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

create policy "Authenticated can read active flares"
  on public.flares for select to authenticated
  using (active = true and expires_at > now());

create policy "Users create own flares"
  on public.flares for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own flares"
  on public.flares for update to authenticated
  using (auth.uid() = user_id);

create policy "Users delete own flares"
  on public.flares for delete to authenticated
  using (auth.uid() = user_id);

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  flare_id uuid references public.flares(id) on delete set null,
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  city text,
  intent text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "Participants can view conversations"
  on public.conversations for select to authenticated
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Authenticated can start conversation"
  on public.conversations for insert to authenticated
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- Reports (safety)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Users can create reports"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);
