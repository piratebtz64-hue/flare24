-- Flare24 schema + RLS (run in Supabase SQL Editor)
-- Safe to re-run on empty project; on existing project review policies first.

create extension if not exists "pgcrypto";

-- ========== PROFILES ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text default 'Bayonne',
  bio text,
  is_gold boolean default false,
  verified boolean default false,
  notifications_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by authenticated" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;

create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete for users (account deletion via auth cascade)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== FLARES ==========
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

drop policy if exists "Authenticated can read active flares" on public.flares;
drop policy if exists "Users create own flares" on public.flares;
drop policy if exists "Users update own flares" on public.flares;
drop policy if exists "Users delete own flares" on public.flares;

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

-- ========== CONVERSATIONS ==========
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  flare_id uuid references public.flares(id) on delete set null,
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  city text,
  intent text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  constraint conversations_two_distinct check (participant_a <> participant_b)
);

alter table public.conversations enable row level security;

drop policy if exists "Participants can view conversations" on public.conversations;
drop policy if exists "Authenticated can start conversation" on public.conversations;

create policy "conversations_select_participants"
  on public.conversations for select to authenticated
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "conversations_insert_participant"
  on public.conversations for insert to authenticated
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "conversations_update_participants"
  on public.conversations for update to authenticated
  using (auth.uid() = participant_a or auth.uid() = participant_b);

-- ========== MESSAGES ==========
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 2000),
  created_at timestamptz default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send messages" on public.messages;

create policy "messages_select_participants"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "messages_insert_sender_participant"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- No update/delete messages by users (immutability)

-- ========== BLOCKS ==========
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

create policy "blocks_select_own"
  on public.blocks for select to authenticated
  using (auth.uid() = blocker_id);

create policy "blocks_insert_own"
  on public.blocks for insert to authenticated
  with check (auth.uid() = blocker_id);

create policy "blocks_delete_own"
  on public.blocks for delete to authenticated
  using (auth.uid() = blocker_id);

-- ========== REPORTS ==========
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

drop policy if exists "Users can create reports" on public.reports;

create policy "reports_insert_own"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);

-- Users cannot read other reports (admin only via service role)
create policy "reports_select_own"
  on public.reports for select to authenticated
  using (auth.uid() = reporter_id);

-- ========== PUSH TOKENS (web/mobile later) ==========
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text default 'web',
  created_at timestamptz default now(),
  unique (user_id, token)
);

alter table public.push_tokens enable row level security;

create policy "push_tokens_select_own"
  on public.push_tokens for select to authenticated
  using (auth.uid() = user_id);

create policy "push_tokens_insert_own"
  on public.push_tokens for insert to authenticated
  with check (auth.uid() = user_id);

create policy "push_tokens_delete_own"
  on public.push_tokens for delete to authenticated
  using (auth.uid() = user_id);

-- ========== GRANTS: least privilege ==========
revoke all on public.profiles from anon;
revoke all on public.flares from anon;
revoke all on public.conversations from anon;
revoke all on public.messages from anon;
revoke all on public.blocks from anon;
revoke all on public.reports from anon;
revoke all on public.push_tokens from anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.flares to authenticated;
grant select, insert, update on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert, delete on public.blocks to authenticated;
grant select, insert on public.reports to authenticated;
grant select, insert, delete on public.push_tokens to authenticated;
